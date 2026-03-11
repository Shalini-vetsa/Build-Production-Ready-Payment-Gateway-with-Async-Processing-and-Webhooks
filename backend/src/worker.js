const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const path = require("path");

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

// Load job processors dynamically
const paymentProcessor = require("./jobs/ProcessPaymentJob");
const refundProcessor = require("./jobs/ProcessRefundJob");
const webhookProcessor = require("./jobs/DeliverWebhookJob");

console.log("Worker process started...");

// PAYMENT WORKER
new Worker(
  "payment-queue",
  job => paymentProcessor(job.data),
  { connection: redis }
);

// REFUND WORKER
new Worker(
  "refund-queue",
  job => refundProcessor(job.data),
  { connection: redis }
);

// WEBHOOK WORKER
new Worker(
  "webhook-queue",
  job => webhookProcessor(job.data),
  { connection: redis }
);
