import Axios from 'axios'
import mongoose from 'mongoose'
import { createLeagueIdString } from '@/helpers'
import { leagues } from '@/contants/leagues'

import dbConnect from '@/utils/dbConnect.js'
import { FixtureModel } from '@/models/fixturesSchema.js'

const makeRequest = async league => {
  console.log('k:', league)
  const options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
    params: league,
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPIKEY,
      'X-RapidAPI-Host': process.env.RAPIDHOST
    }
  }
  try {
    const response = await Axios(options)

    console.log(response.data.response[0])
    return response.data // Assuming the response contains the data you need
  } catch (error) {
    throw new Error(`Error fetching data for league ${league.league}:`, error)
  }
}

const getFixtures = async leagues => {
  // Array to store all the promises for fetching data
  const fetchPromises = []

  // Iterate over each leagueId and create Axios requests
  leagues.forEach(league => {
    const promise = makeRequest(league)
    fetchPromises.push(promise)
  })

  try {
    // Wait for all requests to complete
    return await Promise.all(fetchPromises)
  } catch (error) {
    throw new Error('Error fetching league data:', error)
  }
}

export default async function main(req, res) {
  const { ids } = req.query

  const leaguesToGet = ids.map(id => leagues[id])
  // get all the fixtures
  const fixtures = await getFixtures(leaguesToGet)
  // // Extracting response arrays and merging them into a single array
  const mergedFixtures = fixtures.reduce((accumulator, obj) => {
    // Concatenate the response array of each object with the accumulator
    return accumulator.concat(obj.response)
  }, [])

  const updateOperations = buildFixtures(mergedFixtures)
  const { status, message } = await saveBatchedFixtures(updateOperations)
  return res.status(status).json({ message })
}

const buildFixtures = fixtures =>
  fixtures.map(fixture => {
    const newFixture = {
      _id: fixture.fixture.id,
      date: fixture.fixture.date,
      round: fixture.league.round,
      referee: fixture.fixture.referee,
      season: fixture.league.season,
      league: {
        name: fixture.league.name,
        id: fixture.league.id
      },
      teams: {
        home: {
          name: fixture.teams.home.name,
          id: fixture.teams.home.id
        },
        away: {
          name: fixture.teams.away.name,
          id: fixture.teams.away.id
        }
      },
      score: {
        halftime: {
          home: fixture.score.halftime.home,
          away: fixture.score.halftime.away
        },
        fulltime: {
          home: fixture.score.fulltime.home,
          away: fixture.score.fulltime.away
        }
      },
      status: fixture.fixture.status.short
    }
    return {
      updateOne: {
        filter: { _id: fixture.fixture.id },
        update: newFixture,
        upsert: true
      }
    }
  })

// Function to save a fixture to the database
const saveBatchedFixtures = async fixtures => {
  const urls = createLeagueIdString(leagues);
  try {
    await dbConnect()
    const result = await FixtureModel.bulkWrite(fixtures)
    mongoose.disconnect()
    if (result.modifiedCount > 0 || result.insertedCount > 0) {
      // Update successful, 'nModified' indicates the number of documents modified
      return {
        message: `${result.insertedCount} added and ${
          result.modifiedCount
        } documents updated successfully. ${urls.join('.                                                  ')}`,
        status: 200
      }
    } else {
      // Update didn't make any changes, but the operation was successful
      return {
        message: `No changes made but update successful. ${urls.join('.                                                  ')}`,
        status: 200
      }
    }
  } catch (error) {
    mongoose.disconnect()
    return {
      message: `We had an error saving this fixture ${
        error.message
      }. ${urls.join('.                                                  ')}`,
      status: 400
    }
  }
}

// Function to save all fixtures and return a Promise
const saveAllFixtures = fixtures => {
  const promises = fixtures.map(saveFixture)
  return Promise.all(promises)
}
