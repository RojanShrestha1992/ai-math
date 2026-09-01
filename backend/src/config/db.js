const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`)
    // Don't exit — allow server to run without DB during development
    // In production, you would uncomment the next line:
    // process.exit(1)
  }
}

module.exports = connectDB
