import mongoose from 'mongoose'

const fixtureSchema = new mongoose.Schema({
  _id: Number,
  league: Number,
  date: Date,
  referee: String,
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
  },
  score: {
    halftime: {
      home: String,
      away: String
    },
    fulltime: {
      home: String,
      away: String
    }
  },
  status: String
})

export const FixtureModel = mongoose.model('Fixture', fixtureSchema)
