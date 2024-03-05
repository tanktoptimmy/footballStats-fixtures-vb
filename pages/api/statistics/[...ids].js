import mongoose from 'mongoose'
import { startOfMinute, isBefore } from 'date-fns'
import Axios from 'axios';
import { leagues } from '@/contants/leagues';
import { createLeagueIdString } from '@/helpers'

import dbConnect from '@/utils/dbConnect.js'
import { FixtureModel } from '@/models/fixturesSchema.js'

const makeRequest = async id => {
  console.log(`getting ${id}`)
  const options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics',
    params: {fixture: id},
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

  console.log("get events called")
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
      { statistics: 1, date: 1, teams: 1 }
    )
    return found
  } catch (error) {
    throw new Error('Error fetching league data:', error)
  } finally {
    mongoose.disconnect()
  }
}

const filterFixtures = fixtures => fixtures.filter(fixture => {
  const now = new Date();
  const dateToCompare = startOfMinute(fixture.date);
  return isBefore(dateToCompare, now) && (fixture.statistics?.home?.corners === undefined || fixture.statistics?.away?.corners === undefined);
});

export default async function main(req, res) {
  const { ids } = req.query
  console.log("connecting to db")
  await dbConnect()
  const fixtures = await getFixtures(ids)
  const fixturesToUpdate = filterFixtures(fixtures).map(fixture => fixture._id);
  console.log(fixturesToUpdate.length)
  const slicedFixturesToUpdate = fixturesToUpdate.slice(0,5);
  console.log(slicedFixturesToUpdate)
  const events = await getEvents(slicedFixturesToUpdate);
  const curatedEvents = events.map(ev => {
    const { teams } = fixtures.find(obj => obj._id.toString() === ev.parameters.fixture.toString());
    return {
      id: ev.parameters.fixture,
      statistics: createStatistics(ev.response, teams)
    }
  })

  const updateOperations = buildFixtures(curatedEvents)
  const { status, message } = await saveBatchedFixtures(updateOperations)
  return res.status(status).json({ message })
}

const createTeamStats = (stats) => {
  return {
    shotsOn: getStat(stats,"Shots on Goal").value || 0,
    shotsOff: getStat(stats,"Shots off Goal").value || 0,
    totalShots: getStat(stats,"Total Shots").value || 0,
    blockedShots: getStat(stats,"Blocked Shots").value || 0,
    shotsInside: getStat(stats,"Shots insidebox").value || 0,
    shotsOutside: getStat(stats,"Shots outsidebox").value || 0,
    fouls: getStat(stats,"Fouls").value || 0,
    corners: getStat(stats,"Corner Kicks").value || 0,
    offsides: getStat(stats,"Offsides").value || 0,
    ballPossession: getStat(stats,"Ball Possession").value || "unknown",
    yellowCards: getStat(stats,"Yellow Cards").value || 0,
    redCards: getStat(stats,"Red Cards").value || 0,
    saves: getStat(stats,"Goalkeeper Saves").value || 0,
    totalPasses: getStat(stats,"Total passes").value || 0,
    passesAccurate: getStat(stats,"Passes accurate").value || 0,
    passesPercentage: getStat(stats,"Passes %").value || "unknown"
  }
}
const getStat = (arr, name) => arr.find(stat => stat.type === name)
const createStatistics = (events, teams) => {
  if (events[0]?.team?.id === teams.home.id && events[1]?.team?.id === teams.away.id) {
    return {
      home: createTeamStats(events[0].statistics),
      away: createTeamStats(events[1].statistics)
    }
  }
  if (events[1]?.team?.id === teams.home.id && events[0]?.team?.id === teams.away.id) {
    return {
      home: createTeamStats(events[1].statistics),
      away: createTeamStats(events[0].statistics)
    }
  }

  return {
    home: {
      
    },
    away: {
      
    }
  }
}

const buildFixtures = fixtures =>
  fixtures.map(fixture => {
    const newFixture = {
      statistics: fixture.statistics
    }
    return  {
      updateOne: {
        filter: { _id: parseInt(fixture.id, 10) },
        update: newFixture,
        upsert: true
      }
    }
  })

// Function to save a fixture to the database
const saveBatchedFixtures = async fixtures => {
  try {
    await dbConnect()
    console.log(`bulk writing ${fixtures.length} fixtures`)
    const result = await FixtureModel.bulkWrite(fixtures)
    
    if (result.modifiedCount > 0 || result.insertedCount > 0) {
      // Update successful, 'nModified' indicates the number of documents modified
      return {
        message: `${result.insertedCount} added and ${result.modifiedCount} documents updated successfully  ${createLeagueIdString(leagues)}`,
        status: 200
      }
    } else {
      // Update didn't make any changes, but the operation was successful
      return {
        message: `No changes made but update successful ${createLeagueIdString(leagues)}`,
        status: 200
      }
    }
  } catch (error) {
    
    return {
      message: `We had an error saving this fixture ${error.message} ${createLeagueIdString(leagues)}`,
      status: 400
    }
  } finally {
    mongoose.disconnect()
  }
}

// Function to save all fixtures and return a Promise
const saveAllFixtures = fixtures => {
  const promises = fixtures.map(saveFixture)
  return Promise.all(promises)
}
