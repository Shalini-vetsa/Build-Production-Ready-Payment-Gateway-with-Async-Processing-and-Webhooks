// const fetch = require("node-fetch");
const pool = require("../db");
const crypto = require("crypto");
const { recordWebhookAttempt, getMerchantWebhook } = require("../services/webhookService");

async function DeliverWebhookJob({ merchantId, event, data }) {

  const merchant = await getMerchantWebhook(merchantId);
  if (!merchant || !merchant.webhook_url || !merchant.webhook_secret) {
    // console.log(merchant)
    console.log("No webhook configured, skipping delivery.");
    return;
  }

  const payload = JSON.stringify({
    event,
    timestamp: Date.now(),
    data
  });

  const signature = crypto
    .createHmac("sha256", merchant.webhook_secret)
    .update(payload)
    .digest("hex");

  const headers = {
    "Content-Type": "application/json",
    "X-Webhook-Signature": signature
  };

  let response;
  let statusCode;
  let responseBody;

  try {
    const res = await fetch(merchant.webhook_url, {
      method: "POST",
      headers,
      body: payload
    });

    statusCode = res.status;
    responseBody = await res.text();

  } catch (e) {
    statusCode = 0;
    responseBody = e.message;
  }

  const success = statusCode >= 200 && statusCode < 300;

  await recordWebhookAttempt({
    merchantId,
    event,
    payload,
    statusCode,
    responseBody,
    success
  });

  if (!success) {
    throw new Error("Webhook delivery failed, triggering retry");
  }

  return { delivered: true };
}

module.exports = DeliverWebhookJob;
