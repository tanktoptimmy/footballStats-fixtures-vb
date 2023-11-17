import Axios from 'axios'
import mongoose from 'mongoose'

import dbConnect from '@/utils/dbConnect.js'
import { FixtureModel } from '@/models/fixturesSchema.js'

const makeRequest = async (league) => {
  const options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
    params: league,
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPIKEY,
      'X-RapidAPI-Host': process.env.RAPIDHOST
    }
  };
    try {
      const response = await Axios(options);
      return response.data; // Assuming the response contains the data you need
    } catch (error) {
      throw new Error(`Error fetching data for league ${league.league}:`, error);
    }
}

const getFixtures = async (leagues) => {

  // Array to store all the promises for fetching data
  const fetchPromises = [];

  // Iterate over each leagueId and create Axios requests
  leagues.forEach(league => {
    const promise = makeRequest(league);
    fetchPromises.push(promise);
  });

  try {
  // Wait for all requests to complete
  return await Promise.all(fetchPromises)
  } catch(error) {
    throw new Error('Error fetching league data:', error);
  };
}

export default async function main(req, res) {
  const { ids } = req.query;
  
  const leagues = {
    39: {
      // Premier League
      league: '39',
      season: '2023'
    },
    40: {
      // Championship
      league: '40',
      season: '2023'
    },
    140: {
      // La Liga
      league: '140',
      season: '2023'
    }
  }

  const leaguesToGet = ids.map(id => leagues[id])
  // get all the fixtures
  const fixtures = await getFixtures(leaguesToGet);
  // // Extracting response arrays and merging them into a single array
  const mergedFixtures = fixtures.reduce((accumulator, obj) => {
    // Concatenate the response array of each object with the accumulator
    return accumulator.concat(obj.response);
  }, []);

  saveAllFixtures(mergedFixtures)
    .then(() => {
      // Close the MongoDB connection after saving all fixtures
      mongoose.connection.close()
      res.status(200).json({ message: "All saved nicely" });
    })
    .catch(error => {
      console.error('Error saving fixtures:', error.message)
      // Close the MongoDB connection in case of an error
      mongoose.connection.close()
      res.status(400).json({ message: "Houston, we've had a problem" });
    })
}

// Function to save a fixture to the database
const saveFixture = async fixture => {
  try {
    await dbConnect()
    const newFixture = {
      _id: fixture.fixture.id,
      date: fixture.fixture.date,
      round: fixture.league.round,
      league: {
        name:fixture.league.name,
        id: fixture.league.id,
      },
      teams: {
        home: fixture.teams.home.name,
        away: fixture.teams.away.name
      }
    }

    // console.log(newFixture)

    const filter = { _id: fixture.fixture.id } // Assuming _id is present in the fixtureData
    const update = { $set: newFixture }
    const options = { upsert: true }
    await FixtureModel.updateOne(filter, update, options)
  } catch (error) {
    throw new Error('Error saving fixture:', error.message)
  }
}

// Function to save all fixtures and return a Promise
const saveAllFixtures = fixtures => {
  const promises = fixtures.map(saveFixture)
  return Promise.all(promises)
}
