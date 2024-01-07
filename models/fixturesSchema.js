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
  events: [],
  statistics: {
    home: {
      shotsOn: Number,
      shotsOff: Number,
      totalShots: Number,
      blockedShots: Number,
      shotsInside: Number,
      shotsOutside: Number,
      fouls: Number,
      corners: Number,
      offsides: Number,
      ballPossession: String,
      yellowCards: Number,
      redCards: Number,
      saves: Number,
      totalPasses: Number,
      passesAccurate: Number,
      passesPercentage: String
    },
    away: {
      shotsOn: Number,
      shotsOff: Number,
      totalShots: Number,
      blockedShots: Number,
      shotsInside: Number,
      shotsOutside: Number,
      fouls: Number,
      corners: Number,
      offsides: Number,
      ballPossession: String,
      yellowCards: Number,
      redCards: Number,
      saves: Number,
      totalPasses: Number,
      passesAccurate: Number,
      passesPercentage: String
    }
  }
})

export const FixtureModel =
  mongoose.models.Fixture || mongoose.model('Fixture', fixtureSchema)
