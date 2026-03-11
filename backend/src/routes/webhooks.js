const express = require("express");
const router = express.Router();
const pool = require("../db");
const errorResponse = require("../utils/errors");

// GET /api/v1/webhooks/config
router.get("/config", async (req, res) => {
  const result = await pool.query(
    "SELECT webhook_url, webhook_secret FROM merchants WHERE id=$1",
    [req.merchant.id]
  );

  const row = result.rows[0];

  return res.json({
    url: row?.webhook_url || "",
    secret: row?.webhook_secret || null
  });
});

// PUT /api/v1/webhooks/config
router.put("/config", async (req, res) => {
  const { url } = req.body;

  await pool.query(
    "UPDATE merchants SET webhook_url=$1, updated_at=NOW() WHERE id=$2",
    [url, req.merchant.id]
  );

  return res.json({ saved: true });
});

// POST /api/v1/webhooks/secret
router.post("/secret", async (req, res) => {
  const newSecret = require("crypto").randomBytes(32).toString("hex");

  await pool.query(
    "UPDATE merchants SET webhook_secret=$1, updated_at=NOW() WHERE id=$2",
    [newSecret, req.merchant.id]
  );

  return res.json({ secret: newSecret });
});

// GET /api/v1/webhooks?limit=20
router.get("/", async (req, res) => {
  const limit = Number(req.query.limit || 50);

  const result = await pool.query(
    `
    SELECT id, event, payload, status, attempts, response_code, response_body, next_retry_at, created_at
    FROM webhook_logs
    WHERE merchant_id = $1
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [req.merchant.id, limit]
  );

  return res.json(result.rows);
});




module.exports = router;
