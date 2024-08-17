import mongoose from 'mongoose'
import { startOfMinute, isBefore } from 'date-fns'
import Axios from 'axios'
import { leagues } from '@/contants/leagues'
import { createLeagueIdString } from '@/helpers'

import dbConnect from '@/utils/dbConnect.js'
import { FixtureModel } from '@/models/fixturesSchema.js'

const makeRequest = async id => {
  const options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures/events',
    params: { fixture: id },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPIKEY,
      'X-RapidAPI-Host': process.env.RAPIDAPIHOST
    }
  }
  try {
    const response = await Axios(options)
    return response.data // Assuming the response contains the data you need
  } catch (error) {
    throw new Error(`Error fetching data for fixture ${id}:`, error)
  }
}

const getEvents = async fixtureIds => {
  // Array to store all the promises for fetching data
  const fetchPromises = []

  // Iterate over each fixture and create Axios requests
  fixtureIds.forEach(id => {
    const promise = makeRequest(id)
    fetchPromises.push(promise)
  })

  try {
    // Wait for all requests to complete
    return await Promise.all(fetchPromises)
  } catch (error) {
    throw new Error('Error fetching fixture data:', error)
  }
}

const getFixtures = async ids => {
  try {
    const found = await FixtureModel.find(
      { status: 'FT', 'league.id': { $in: ids } },
      { events: 1, date: 1 }
    )
    return found
  } catch (error) {
    throw new Error('Error fetching league data:', error)
  } finally {
    mongoose.disconnect()
  }
}

const filterFixtures = fixtures =>
  fixtures.filter(fixture => {
    const now = new Date()
    const dateToCompare = startOfMinute(fixture.date)
    return isBefore(dateToCompare, now) && fixture.events.length === 0
  })

export default async function main(req, res) {
  const { ids } = req.query
  await dbConnect()
  const fixtures = await getFixtures(ids)
  const fixturesToUpdate = filterFixtures(fixtures).map(fixture => fixture._id)
  console.log(fixturesToUpdate)

  const events = await getEvents(fixturesToUpdate.slice(0, 5))

  const curatedEvents = events.map(ev => {
    return {
      id: ev.parameters.fixture,
      events: createEvents(ev.response)
    }
  })
  const updateOperations = buildFixtures(curatedEvents)
  const { status, message } = await saveBatchedFixtures(updateOperations)
  return res.status(status).json({ message })
}

const createEvents = events => {
  const filtered = events.filter(ev => ['Card', 'Goal'].includes(ev.type))
  let cardCounts = {}
  let modifiedCards = []

  filtered.forEach((card, _) => {
    if (card.detail === 'Yellow Card') {
      const playerId = card.player.id
      cardCounts[playerId] = (cardCounts[playerId] || 0) + 1

      if (cardCounts[playerId] == 2) {
        card.detail = 'Yellow/Red Card'
        card.comments = 'Two Yellow Cards'
        return modifiedCards.push(card)
      }
    } else if (card.detail === 'Red Card') {
      const playerId = card.player.id
      if (cardCounts[playerId] && cardCounts[playerId] < 2) {
        return modifiedCards.push(card)
      }
      return
    }
    return modifiedCards.push(card)
  })
  return modifiedCards
}

const buildFixtures = fixtures =>
  fixtures.map(fixture => {
    const newFixture = {
      events: fixture.events
    }
    return {
      updateOne: {
        filter: { _id: fixture.id },
        update: newFixture,
        upsert: true
      }
    }
  })

// Function to save a fixture to the database
const saveBatchedFixtures = async fixtures => {
  try {
    const urls = createLeagueIdString(leagues);
    await dbConnect()
    const result = await FixtureModel.bulkWrite(fixtures)
    mongoose.disconnect()
    if (result.modifiedCount > 0 || result.insertedCount > 0) {
      // Update successful, 'nModified' indicates the number of documents modified
      return {
        message: `${result.insertedCount} added and ${
          result.modifiedCount
        } documents updated successfully ${urls.join('.                                                  ')}`,
        status: 200
      }
    } else {
      // Update didn't make any changes, but the operation was successful
      return {
        message: `No changes made but update successful ${urls.join('.                                                  ')}`,
        status: 200
      }
    }
  } catch (error) {
    mongoose.disconnect()
    return {
      message: `We had an error saving this fixture ${
        error.message
      }${urls.join('.                                                  ')}`,
      status: 400
    }
  }
}

// Function to save all fixtures and return a Promise
const saveAllFixtures = fixtures => {
  const promises = fixtures.map(saveFixture)
  return Promise.all(promises)
}
