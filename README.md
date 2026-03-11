#  Production-Ready Payment Gateway  
### Async Processing + Webhooks + Idempotency + Refunds

A fully functional **production-style payment gateway** built with:

- Node.js (Express)
- PostgreSQL
- Redis (Job Queue)
- Worker Service (Async Processing)
- Hosted Checkout UI
- Dashboard UI
- Webhook Delivery + Retry System
- Idempotency Support
- Dockerized Multi-Service Architecture

---

#  Architecture Overview

## Services

| Service        | Description                    |
|----------------|--------------------------------|
| gateway_api    | Main REST API                  |
| gateway_worker | Background async job processor |
| pg_gateway     | PostgreSQL database            |
| redis_gateway  | Job queue (Bull/Redis-based)   |
| checkout_ui    | Hosted checkout page           |
| dashboard_ui   | Admin dashboard                |

---

#  Async Processing Flow

1. Merchant creates an order
2. Customer completes payment via hosted checkout
3. Payment job is queued in Redis
4. Worker processes payment asynchronously
5. Webhook is sent to merchant
6. Retry system handles delivery failures

---

#  Tech Stack

- Node.js + Express
- PostgreSQL
- Redis
- Docker & Docker Compose
- HMAC SHA256 webhook signing
- RESTful API design

---

#  Quick Start

## 1️ Clone Repository

```bash
git clone https://github.com/SRINIJA-PULLIPUDI/Build-Production-Ready-Payment-Gateway-with-Async-Processing-and-Webhooks.git
cd Build-Production-Ready-Payment-Gateway-with-Async-Processing-and-Webhooks.git
```

---

## 2️ Start All Services

```bash
docker-compose up -d --build
```

---

## 3️ Access Services

| Service      |          URL          |
|--------------|-----------------------|
| API          | http://localhost:8000 |
| Checkout UI  | http://localhost:3001 |
| Dashboard UI | http://localhost:3000 |

### Dashboard UI contains three main pages

- http://localhost:3000/#/webhook-config
- http://localhost:3000/#/webhooks
- http://localhost:3000/#/docs

---

#  Webhook Configuration

Webhook configuration is managed through the **Dashboard UI**.

### Step 1: Open Dashboard and navigate to webhook-config page

Visit:

```
http://localhost:3000/#/webhook-config
```

---

### Step 2: Configure Webhook URL

1. Visit https://webhook.site
2. Copy the generated webhook URL
3. Paste it into the **Webhook URL** input field in the http://localhost:3000/#/webhook-config
4. Click **Save**

---

### Step 3: Generate Webhook Secret

1. Click **Generate Secret**
2. A webhook secret will be created and stored
3. Use this secret to verify webhook signatures

---

### Step 4: Trigger Events

- Create order
- Complete payment via checkout
- Observe webhook events on webhook.site and webhooks page

---

#  Webhook Logs Page

The dashboard includes a **Webhook Logs page** http://localhost:3000/#/webhooks which displays:

- Payment ID
- Event Type
- Delivery Status (success / failed)
- Response Code
- Retry button (if failed)

---

## Retry Behavior

- If webhook delivery fails (non-2xx response)
- Status becomes `failed`
- Retry button appears
- Clicking Retry re-queues the webhook delivery job

---

#  Authentication

All API requests must include:

```
x-api-key: key_test_abc123
X-Api-Secret: secret_test_xyz789
```

---

#  API Documentation

## Create Order

```
POST /api/v1/orders
```

**Headers:**
```
x-api-key: key_test_abc123
X-Api-Secret: secret_test_xyz789
```

**Body:**
```json
{
  "amount": 5000
}
```

---

## Create Payment

```
POST /api/v1/payments
```

**Headers:**
```
x-api-key: key_test_abc123
X-Api-Secret: secret_test_xyz789
Idempotency-Key: payment-key-123
```

**Body:**
```json
{
  "order_id": "order_123",
  "method": "upi",
  "vpa": "name@upi"
}
```

---

## Capture Payment

```
POST /api/v1/payments/:id/capture
```

---

## Refund Payment

```
POST /api/v1/payments/:id/refunds
```

**Headers:**
```
x-api-key: key_test_abc123
X-Api-Secret: secret_test_xyz789
Idempotency-Key: refund-key-123
```

**Body:**
```json
{
  "amount": 1000,
  "reason": "customer_requested"
}
```

---

#  Webhook System

## Webhook Events

- payment.pending
- payment.success
- payment.failed
- refund.created
- refund.processed

---

## Webhook Signature

Each webhook includes:

```
X-Webhook-Signature
```

Signature is generated using:

```
HMAC_SHA256(raw_body, webhook_secret)
```

### Example Verification (Node.js)

```js
const crypto = require("crypto");

const expected = crypto
  .createHmac("sha256", webhookSecret)
  .update(rawBody)
  .digest("hex");

if (expected !== signatureFromHeader) {
  throw new Error("Invalid webhook signature");
}
```

---

#  Idempotency Support

Idempotency is supported for:

- Payment creation
- Refund creation

Prevents duplicate operations if client retries request.

---

#  Database Schema

Includes:

- merchants
- orders
- payments
- refunds
- webhook_logs
- idempotency_keys

---

#  Testing via Curl

## Create Order

```bash
curl -X POST http://localhost:8000/api/v1/orders \
-H "Content-Type: application/json" \
-H "x-api-key: key_test_abc123" \
-H "X-Api-Secret: secret_test_xyz789" \
-d '{"amount":5000}'
```

## Refund

```bash
curl -X POST http://localhost:8000/api/v1/payments/:id/refunds \
-H "Content-Type: application/json" \
-H "x-api-key: key_test_abc123" \
-H "X-Api-Secret: secret_test_xyz789" \
-H "Idempotency-Key: refund-test-123" \
-d '{
  "amount": 500,
  "reason": "customer_requested"
}'
```

## Capture

```bash
curl -X POST http://localhost:8000/api/v1/payments/:id/capture \
-H "Content-Type: application/json" \
-H "x-api-key: key_test_abc123" \
-H "X-Api-Secret: secret_test_xyz789"
```

---

#  Environment Variables

See `.env.example` for configuration:

- DATABASE_URL
- REDIS_URL
- TEST_MODE
- TEST_PROCESSING_DELAY
- WEBHOOK_RETRY_INTERVALS_TEST

---

#  Stop Application

```bash
docker-compose down
```

---

#  Key Features Implemented

- Asynchronous payment processing
- Redis-backed job queue
- Worker service architecture
- Webhook retry mechanism
- Webhook signature verification
- Idempotency middleware
- Refund & capture support
- Dockerized microservices architecture
- Hosted checkout page
- Dashboard UI

---

#  Design Principles

- Event-driven architecture
- Reliable async processing
- Secure HMAC-based webhook validation
- Retry-safe idempotent API design
- Production-style microservice separation

---

#  Evaluation Checklist Coverage

✔ All API endpoints implemented  
✔ Async worker processing  
✔ Redis queue integration  
✔ Database schema matches requirements  
✔ Webhook delivery + retry  
✔ Idempotency keys  
✔ Docker-compose based startup  

---

#  Conclusion

This project simulates a real-world payment gateway system with:

- Async processing
- Secure webhooks
- Retry logic
- Refund lifecycle
- Idempotent API design
- Containerized infrastructure

Designed to mirror production-grade payment gateway architecture.

---