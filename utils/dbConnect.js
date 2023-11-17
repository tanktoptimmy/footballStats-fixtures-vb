// utils/dbConnect.js
import 'dotenv/config'
import mongoose from 'mongoose'

const connection = {}

async function dbConnect() {
  if (connection.isConnected) {
    return
  }

  console.log('we are going to connect to mongoose now')
  console.log(process.env.MONGODB_URI)
  const db = await mongoose.connect(process.env.MONGODB_URI)
  console.log('mongoosed')
  connection.isConnected = db.connections[0].readyState
}

export default dbConnect
