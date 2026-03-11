const pool = require("../db");
const generateId = require("../utils/idGenerator");
const {
  getRefundsByPaymentId,
  createRefund
} = require("../models/Refund");
const { enqueueRefundJob } = require("./queueService");

async function createRefundRequest(paymentId, merchantId, amount, reason) {
  const paymentRes = await pool.query(
    `
    SELECT * FROM payments
    WHERE id=$1 AND merchant_id=$2
    `,
    [paymentId, merchantId]
  );

  if (paymentRes.rowCount === 0) {
    throw { type: "NOT_FOUND", message: "Payment not found" };
  }

  const payment = paymentRes.rows[0];

  if (payment.status !== "success") {
    throw { type: "BAD_REQUEST", message: "Payment not refundable" };
  }

  const pastRefunds = await getRefundsByPaymentId(paymentId);
  const refundedAmount = pastRefunds.reduce((sum, r) => sum + r.amount, 0);

  const remaining = payment.amount - refundedAmount;

  if (amount > remaining) {
    throw { type: "BAD_REQUEST", message: "Refund amount exceeds remaining balance" };
  }

  const refundId = generateId("rfnd_");

  await createRefund({
    refundId,
    paymentId,
    merchantId,
    amount,
    reason
  });

  // enqueue async processing
  await enqueueRefundJob({
    refundId,
    paymentId,
    merchantId,
    amount
  });

  return refundId;
}

module.exports = {
  createRefundRequest
};
