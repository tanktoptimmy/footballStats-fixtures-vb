// import Axios from 'axios';
// import mongoose from 'mongoose';
// import dbConnect from '@/utils/dbConnect.js'
// import { query, variables } from '@/utils/query.js'
// import { EventsModel } from "@/models/eventsSchema.js"

// const start  = async (req, res) => {
//   const { data } = await Axios.post('https://events.green-1-aws.live.skybet.com/graphql', {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     query,
//     variables
//   })
//   console.log(data)
//   const {message, status} = await savePriceboosts(data.data)
//   res.status(status).json(message);
// }

// const savePriceboosts = async (boosts) => {
//   try {
//     console.log("we are going to connect")
//     await dbConnect();
//     console.log("we have CONNECTED")
//     const filter = { _id: 5 }; // Assuming _id is present in the fixtureData
//     const update = { $set: {_id: 5, events: boosts.events} };
//     const options = { upsert: true };
//     await EventsModel.updateOne(filter, update, options);
//     return {
//       message: 'Priceboosts saved successfully',
//       status: 200
//     };
//   } catch (error) {
//     return {
//       message: 'Priceboosts NOT saved successfully',
//       status: 400
//     };
//     // throw new Error('Error saving Priceboosts:', error.message);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// export default start;

import Axios from 'axios'
import mongoose from 'mongoose'

import dbConnect from './utils/dbConnect.js'
import { MatchModel } from './models/matchesSchema.js'

export default async function main() {
  // get all the fixtures

  // filter out all the fixtures you want
  // const filtered = response.filter(obj => {
  //  return obj.league.round === "Regular Season - 1"
  // });

  // create fixture strings i.e. 112323-123123-4323432-2345435 - can be up to 20 long
  const fixtureString = filtered.map(obj => obj.fixture.id).join('-')
  const fixtures = await getFixtures(fixtureString)
  saveAllFixtures(fixtures)
    .then(() => {
      // Close the MongoDB connection after saving all fixtures
      mongoose.connection.close()
    })
    .catch(error => {
      console.error('Error saving fixtures:', error.message)
      // Close the MongoDB connection in case of an error
      mongoose.connection.close()
    })
}

// Function to save a fixture to the database
const saveFixture = async fixture => {
  try {
    await dbConnect()
    const newFixture = {
      _id: fixture.fixture.id,
      ...fixture
    }

    const filter = { _id: fixture.fixture.id } // Assuming _id is present in the fixtureData
    const update = { $set: newFixture }
    const options = { upsert: true }
    await MatchModel.updateOne(filter, update, options)
  } catch (error) {
    throw new Error('Error saving fixture:', error.message)
  }
}

// Function to save all fixtures and return a Promise
const saveAllFixtures = fixtures => {
  const promises = fixtures.map(saveFixture)
  return Promise.all(promises)
}
