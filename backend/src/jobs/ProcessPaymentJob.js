const pool = require("../db");
const { enqueueWebhookJob } = require("../services/queueService");
const { decideOutcome, processingDelay } = require("../services/paymentService");

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ProcessPaymentJob({ paymentId, method, merchantId }) {

  /* 1️⃣ Emit pending webhook */
  await enqueueWebhookJob({
    merchantId,
    event: "payment.pending",
    data: { id: paymentId }
  });

  /* 2️⃣ Simulate processing delay */
  await sleep(processingDelay());

  /* 3️⃣ Decide success or failure */
  const { status, reason } = decideOutcome(method);

  /* 4️⃣ Update DB */
  await pool.query(
    `
    UPDATE payments
    SET status=$1,
        error_code=$2,
        updated_at=NOW()
    WHERE id=$3
    `,
    [status, reason, paymentId]
  );

  /* 5️⃣ Emit final webhook */
  await enqueueWebhookJob({
    merchantId,
    event: status === "success" ? "payment.success" : "payment.failed",
    data: {
      id: paymentId,
      reason
    }
  });

  return { paymentId, status };
}

module.exports = ProcessPaymentJob;