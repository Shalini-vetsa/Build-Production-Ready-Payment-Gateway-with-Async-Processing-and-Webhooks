const pool = require("../db");

async function createRefund({ refundId, paymentId, merchantId, amount, reason }) {
  await pool.query(
    `
    INSERT INTO refunds (id, payment_id, merchant_id, amount, reason, status, created_at)
    VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
    `,
    [refundId, paymentId, merchantId, amount, reason || null]
  );
}

async function getRefundById(refundId) {
  const result = await pool.query(
    `
    SELECT *
    FROM refunds
    WHERE id=$1
    `,
    [refundId]
  );

  if (result.rowCount === 0) return null;
  return result.rows[0];
}

async function getRefundsByPaymentId(paymentId) {
  const result = await pool.query(
    `
    SELECT *
    FROM refunds
    WHERE payment_id=$1
    `,
    [paymentId]
  );
  return result.rows;
}

async function markRefundProcessed(refundId) {
  await pool.query(
    `
    UPDATE refunds
    SET status='processed', processed_at=NOW()
    WHERE id=$1
    `,
    [refundId]
  );
}

module.exports = {
  createRefund,
  getRefundById,
  getRefundsByPaymentId,
  markRefundProcessed
};
