import mongoose from 'mongoose'

const fixtureSchema = new mongoose.Schema({
  _id: Number,
  league: Number,
  date: Date,
  referee: String,
  season: Number,
  teams: {
    home: {
      name: String,
      id: Number
    },
    away: {
      name: String,
      id: Number
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
  status: String,
  events: []
})

export const FixtureModel =
  mongoose.models.Fixture || mongoose.model('Fixture', fixtureSchema)
