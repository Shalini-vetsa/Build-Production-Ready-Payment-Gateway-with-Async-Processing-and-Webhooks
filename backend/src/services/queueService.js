const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

// Queues
const paymentQueue = new Queue("payment-queue", { connection: redis });
const refundQueue = new Queue("refund-queue", { connection: redis });
const webhookQueue = new Queue("webhook-queue", { connection: redis });

// Enqueue payment async
async function enqueuePaymentJob(data) {
  await paymentQueue.add("processPayment", data);
}

// Enqueue refund async
async function enqueueRefundJob(data) {
  await refundQueue.add("processRefund", data);
}

// Enqueue webhook delivery
async function enqueueWebhookJob({ merchantId, event, data }, opts = {}) {
  await webhookQueue.add(
    "deliverWebhook",
    { merchantId, event, data },
    {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: process.env.WEBHOOK_RETRY_INTERVALS_TEST ? 5000 : 60000
      },
      ...opts
    }
  );
}

module.exports = {
  enqueuePaymentJob,
  enqueueRefundJob,
  enqueueWebhookJob
};
