const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({
      status: "healthy",
      database: "connected"
    });
  } catch (err) {
    return res.status(500).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

module.exports = router;
