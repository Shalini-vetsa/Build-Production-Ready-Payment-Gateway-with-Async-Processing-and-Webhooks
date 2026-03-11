const express = require("express");
const pool = require("../db");
const crypto = require("crypto");
const errorResponse = require("../utils/errors");

const router = express.Router();

/**
 * GET /api/v1/merchant/webhook
 * Returns webhook_url + webhook_secret for dashboard config
 */
router.get("/merchant/webhook", async (req, res) => {
  const result = await pool.query(
    `
    SELECT webhook_url, webhook_secret
    FROM merchants
    WHERE id=$1
    `,
    [req.merchant.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json(
      errorResponse("NOT_FOUND_ERROR", "Merchant not found")
    );
  }

  return res.json(result.rows[0]);
});

/**
 * POST /api/v1/merchant/webhook
 * Updates webhook_url (secret unchanged)
 */
router.post("/merchant/webhook", async (req, res) => {
  const { webhook_url } = req.body;

  await pool.query(
    `
    UPDATE merchants
    SET webhook_url=$1, updated_at=NOW()
    WHERE id=$2
    `,
    [webhook_url || null, req.merchant.id]
  );

  return res.json({ success: true });
});

/**
 * POST /api/v1/merchant/webhook/secret/regen
 * Generates new HMAC secret (64 hex chars)
 */
router.post("/merchant/webhook/secret/regen", async (req, res) => {
  const newSecret = crypto.randomBytes(32).toString("hex");

  await pool.query(
    `
    UPDATE merchants
    SET webhook_secret=$1, updated_at=NOW()
    WHERE id=$2
    `,
    [newSecret, req.merchant.id]
  );

  return res.json({
    success: true,
    webhook_secret: newSecret     // Returning once for dashboard
  });
});

module.exports = router;
