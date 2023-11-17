import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  time: {
    elapsed: Number,
    extra: Number
  },
  team: {
    id: Number,
    name: String,
    logo: String
  },
  player: {
    id: Number,
    name: String
  },
  assist: {
    id: Number,
    name: String
  },
  type: String,
  detail: String,
  comments: String
})

const lineupPlayerSchema = new mongoose.Schema({
  player: {
    id: Number,
    name: String,
    number: Number,
    pos: String,
    grid: String
  }
})

const lineupSchema = new mongoose.Schema({
  team: {
    id: Number,
    name: String,
    logo: String,
    colors: {
      player: {
        primary: String,
        number: String,
        border: String
      },
      goalkeeper: {
        primary: String,
        number: String,
        border: String
      }
    }
  },
  coach: {
    id: Number,
    name: String,
    photo: String
  },
  formation: String,
  startXI: [lineupPlayerSchema],
  substitutes: [lineupPlayerSchema]
})

const statisticsSchema = new mongoose.Schema({
  games: {
    minutes: Number,
    number: Number,
    position: String,
    rating: String,
    captain: Boolean,
    substitute: Boolean
  },
  offsides: Number,
  shots: {
    total: Number,
    on: Number
  },
  goals: {
    total: Number,
    conceded: Number,
    assists: Number,
    saves: Number
  },
  passes: {
    total: Number,
    key: Number,
    accuracy: String
  },
  tackles: {
    total: Number,
    blocks: Number,
    interceptions: Number
  },
  duels: {
    total: Number,
    won: Number
  },
  dribbles: {
    attempts: Number,
    success: Number,
    past: Number
  },
  fouls: {
    drawn: Number,
    committed: Number
  },
  cards: {
    yellow: Number,
    red: Number
  },
  penalty: {
    won: Number,
    committed: Number,
    scored: Number,
    missed: Number,
    saved: Number
  }
})

const playerStatisticsSchema = new mongoose.Schema({
  player: {
    id: Number,
    name: String,
    photo: String
  },
  statistics: [statisticsSchema]
})

const teamSchema = new mongoose.Schema({
  team: {
    id: Number,
    name: String,
    logo: String,
    update: Date
  },
  players: [playerStatisticsSchema]
})

const matchSchema = new mongoose.Schema({
  _id: Number,
  fixture: {
    id: Number,
    referee: String,
    timezone: String,
    date: Date,
    timestamp: Number,
    periods: {
      first: Number,
      second: Number
    },
    venue: {
      id: Number,
      name: String,
      city: String
    },
    status: {
      long: String,
      short: String,
      elapsed: Number
    }
  },
  league: {
    id: Number,
    name: String,
    country: String,
    logo: String,
    flag: String,
    season: Number,
    round: String
  },
  teams: {
    home: {
      id: Number,
      name: String,
      logo: String,
      winner: Boolean
    },
    away: {
      id: Number,
      name: String,
      logo: String,
      winner: Boolean
    }
  },
  goals: {
    home: Number,
    away: Number
  },
  score: {
    halftime: {
      home: Number,
      away: Number
    },
    fulltime: {
      home: Number,
      away: Number
    },
    extratime: {
      home: Number,
      away: Number
    },
    penalty: {
      home: Number,
      away: Number
    }
  },
  events: [eventSchema],
  lineups: [lineupSchema]
})

const responseSchema = new mongoose.Schema({
  get: String,
  parameters: {
    ids: String
  },
  errors: [String],
  results: Number,
  paging: {
    current: Number,
    total: Number
  },
  response: [matchSchema]
})

export const MatchModel = mongoose.model('Match', matchSchema)
