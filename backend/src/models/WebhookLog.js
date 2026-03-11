const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

async function createWebhookLog({ merchantId, event, payload }) {
  const id = uuidv4();
  await pool.query(
    `
    INSERT INTO webhook_logs
    (id, merchant_id, event, payload, status, attempts, created_at)
    VALUES ($1, $2, $3, $4, 'pending', 0, NOW())
    `,
    [id, merchantId, event, payload]
  );
  return id;
}

async function updateWebhookLog(id, { status, attempts, responseCode, responseBody, nextRetryAt }) {
  await pool.query(
    `
    UPDATE webhook_logs
    SET status=$1,
        attempts=$2,
        response_code=$3,
        response_body=$4,
        last_attempt_at=NOW(),
        next_retry_at=$5
    WHERE id=$6
    `,
    [status, attempts, responseCode, responseBody, nextRetryAt, id]
  );
}

async function getWebhookLogs(merchantId, { limit = 10, offset = 0 }) {
  const result = await pool.query(
    `
    SELECT *
    FROM webhook_logs
    WHERE merchant_id=$1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [merchantId, limit, offset]
  );
  return result.rows;
}

async function getWebhookLogById(id) {
  const result = await pool.query(
    `
    SELECT *
    FROM webhook_logs
    WHERE id=$1
    `,
    [id]
  );
  if (result.rowCount === 0) return null;
  return result.rows[0];
}

async function resetWebhookLog(id) {
  await pool.query(
    `
    UPDATE webhook_logs
    SET status='pending', attempts=0, next_retry_at=NULL
    WHERE id=$1
    `,
    [id]
  );
}

module.exports = {
  createWebhookLog,
  updateWebhookLog,
  getWebhookLogs,
  getWebhookLogById,
  resetWebhookLog
};
