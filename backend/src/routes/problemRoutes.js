/**
 * Problem routes.
 *
 * Exposes the math solver REST endpoint.
 *
 * @module problemRoutes
 */

const express = require('express')
const router = express.Router()

const { solveProblem } = require('../controllers/problemController')

// POST /api/problems/solve
router.post('/problems/solve', solveProblem)

module.exports = router
