const express = require('express');
const prisma = require('../config/db');

const router = express.Router();

// No Redis check anymore -- just Postgres (via Prisma/Supabase) connectivity.
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'unreachable' });
  }
});

module.exports = router;
