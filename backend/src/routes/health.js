const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1
    ? 'connected'
    : 'disconnected'

  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development'
  })
})

module.exports = router
