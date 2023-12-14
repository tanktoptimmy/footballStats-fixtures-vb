// utils/dbConnect.js
import 'dotenv/config'
import mongoose from 'mongoose'

async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    console.log(`39: Premier League
    40: Championship
    140: La Liga
    78: Bundesliga
    135: Serie A Italy
    61: Ligue 1`)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

export default dbConnect
