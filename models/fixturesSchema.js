import mongoose from 'mongoose'

const fixtureSchema = new mongoose.Schema({
  _id: Number,
  league: Number,
  date: Date,
  teams: {
    home: {
      name: String
    },
    away: {
      name: String
    }
  },
  round: String,
  league: {
    name: String,
    id: Number
  }
})

export const FixtureModel = mongoose.model('Fixture', fixtureSchema)
