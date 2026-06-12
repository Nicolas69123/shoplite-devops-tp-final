const express = require("express");
const db = require("../db");

const router = express.Router();

// Readiness : l'API est-elle PRETE a recevoir du trafic ?
// Difference avec /health (liveness) : /ready repond 503 tant que la
// dependance critique (PostgreSQL) n'est pas joignable. C'est sur cette
// route que s'appuient les healthchecks Compose.
router.get("/", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ready: true, timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({
      ready: false,
      reason: "database unreachable",
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
