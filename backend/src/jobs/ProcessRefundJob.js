const pool = require("../db");
const {
  getRefundById,
  markRefundProcessed
} = require("../models/Refund");
const { enqueueWebhookJob } = require("../services/queueService");

async function ProcessRefundJob({ refundId, paymentId, merchantId, amount }) {

  const TEST_MODE = process.env.TEST_MODE === "true";
  const DELAY = Number(process.env.TEST_PROCESSING_DELAY || 1000);

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // emit immediate refund.created webhook
  await enqueueWebhookJob({
    merchantId,
    event: "refund.created",
    data: { id: refundId, paymentId, amount }
  });

  if (TEST_MODE) {
    await sleep(DELAY);
  } else {
    await sleep(1500 + Math.random() * 2000);
  }

  // mark refund processed
  await markRefundProcessed(refundId);

  // emit refund.processed webhook
  await enqueueWebhookJob({
    merchantId,
    event: "refund.processed",
    data: { id: refundId, paymentId, amount }
  });

  return { refundId, status: "processed" };
}

module.exports = ProcessRefundJob;
