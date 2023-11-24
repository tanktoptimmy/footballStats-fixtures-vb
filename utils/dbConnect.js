// utils/dbConnect.js
import 'dotenv/config'
import mongoose from 'mongoose'

async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

export default dbConnect
