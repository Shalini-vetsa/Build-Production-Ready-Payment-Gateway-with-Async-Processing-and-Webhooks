const {
  createWebhookLog,
  updateWebhookLog
} = require("../models/WebhookLog");
const pool = require("../db");

// fetch webhook config for merchant
async function getMerchantWebhook(merchantId) {
  const result = await pool.query(
    `
    SELECT webhook_url, webhook_secret
    FROM merchants
    WHERE id=$1
    `,
    [merchantId]
  );
  if (result.rowCount === 0) return null;
  return result.rows[0];
}

// record webhook attempt result
async function recordWebhookAttempt({ merchantId, event, payload, statusCode, responseBody, success }) {
  // find matching log or create
  const id = await createWebhookLog({ merchantId, event, payload });

  const attempts = success ? 1 : 1;

  const nextRetryAt = success
    ? null
    : new Date(Date.now() + (
        process.env.WEBHOOK_RETRY_INTERVALS_TEST
          ? 5000
          : 60000
      ));

  await updateWebhookLog(id, {
    status: success ? "success" : "failed",
    attempts,
    responseCode: statusCode,
    responseBody,
    nextRetryAt
  });
}

module.exports = {
  getMerchantWebhook,
  recordWebhookAttempt
};
