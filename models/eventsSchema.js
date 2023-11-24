import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  _id: Number,
  events: [
    {
      time: {
        elapsed: Number,
        extra: {
          type: Number,
          default: null
        }
      },
      team: {
        id: Number,
        name: String
      },
      player: {
        id: Number,
        name: String
      },
      assist: {
        id: {
          type: Number,
          default: null
        },
        name: {
          type: String,
          default: null
        }
      },
      type: String,
      detail: String
    }
  ]
})

export const EventModel = mongoose.model('Event', eventSchema)
