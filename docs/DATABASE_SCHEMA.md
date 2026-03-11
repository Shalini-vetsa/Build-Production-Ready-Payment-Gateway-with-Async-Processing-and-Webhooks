#  Database Schema Documentation

This document describes the PostgreSQL schema used in the Production-Ready Payment Gateway.

---

#  Overview

The system consists of the following tables:

- merchants
- orders
- payments
- refunds
- webhook_logs
- idempotency_keys

---

#  merchants

Stores merchant configuration and authentication details.

| Column          | Type           | Description |
|---------------|----------------|-------------|
| id             | UUID (PK)      | Merchant unique ID |
| name           | VARCHAR(255)   | Merchant name |
| email          | VARCHAR(255)   | Unique merchant email |
| api_key        | VARCHAR(64)    | Public API key |
| api_secret     | VARCHAR(64)    | Secret API key |
| webhook_url    | TEXT           | Merchant webhook endpoint URL |
| webhook_secret | VARCHAR(64)    | Secret used for webhook HMAC signing |
| is_active      | BOOLEAN        | Merchant active status |
| created_at     | TIMESTAMP      | Created timestamp |
| updated_at     | TIMESTAMP      | Updated timestamp |

### Notes:
- Webhook URL is configured via Dashboard UI.
- Webhook secret is generated via "Generate Secret" button.

---

#  orders

Represents merchant orders created before payment.

| Column       | Type          | Description |
|-------------|--------------|-------------|
| id           | VARCHAR(64) (PK) | Order ID |
| merchant_id  | UUID (FK → merchants.id) | Linked merchant |
| amount       | INTEGER       | Amount in paise (minimum 100) |
| currency     | VARCHAR(3)    | Currency (default INR) |
| receipt      | VARCHAR(255)  | Optional receipt identifier |
| notes        | JSONB         | Additional metadata |
| status       | VARCHAR(20)   | Order status (default: created) |
| created_at   | TIMESTAMP     | Created timestamp |
| updated_at   | TIMESTAMP     | Updated timestamp |

---

#  payments

Stores payment attempts and status.

| Column            | Type            | Description |
|------------------|----------------|-------------|
| id               | VARCHAR(64) (PK) | Payment ID |
| order_id         | VARCHAR(64) (FK → orders.id) | Linked order |
| merchant_id      | UUID (FK → merchants.id) | Merchant |
| amount           | INTEGER        | Payment amount |
| currency         | VARCHAR(3)     | Currency |
| method           | VARCHAR(20)    | upi / card |
| status           | VARCHAR(20)    | processing / success / failed |
| vpa              | VARCHAR(255)   | UPI ID (if UPI payment) |
| card_network     | VARCHAR(20)    | Visa / Mastercard etc |
| card_last4       | VARCHAR(4)     | Last 4 digits of card |
| error_code       | VARCHAR(50)    | Failure reason code |
| error_description| TEXT           | Detailed error |
| captured         | BOOLEAN        | Capture status |
| created_at       | TIMESTAMP      | Created timestamp |
| updated_at       | TIMESTAMP      | Updated timestamp |

---

#  refunds

Stores refund lifecycle data.

| Column        | Type            | Description |
|--------------|----------------|-------------|
| id           | VARCHAR(64) (PK) | Refund ID |
| payment_id   | VARCHAR(64) (FK → payments.id) | Linked payment |
| merchant_id  | UUID (FK → merchants.id) | Merchant |
| amount       | INTEGER        | Refund amount |
| reason       | TEXT           | Refund reason |
| status       | VARCHAR(20)    | pending / processed |
| created_at   | TIMESTAMP      | Created timestamp |
| processed_at | TIMESTAMP      | Processed timestamp |

---

#  webhook_logs

Tracks webhook delivery attempts and retry behavior.

| Column          | Type            | Description |
|---------------|----------------|-------------|
| id             | UUID (PK)      | Webhook log ID |
| merchant_id    | UUID (FK → merchants.id) | Merchant |
| event          | VARCHAR(50)    | Event name |
| payload        | JSONB          | Delivered payload |
| status         | VARCHAR(20)    | pending / success / failed |
| attempts       | INTEGER        | Number of attempts |
| last_attempt_at| TIMESTAMP      | Last delivery attempt time |
| next_retry_at  | TIMESTAMP      | Scheduled retry time |
| response_code  | INTEGER        | HTTP response status |
| response_body  | TEXT           | HTTP response body |
| created_at     | TIMESTAMP      | Created timestamp |

### Notes:
- Retry logic updates `attempts`
- Failed deliveries show "Retry" option in dashboard

---

#  idempotency_keys

Ensures safe retry of API requests.

| Column       | Type           | Description |
|-------------|---------------|-------------|
| key          | VARCHAR(255) (PK) | Idempotency key |
| merchant_id  | UUID (FK → merchants.id) | Merchant |
| response     | JSONB         | Stored response body |
| created_at   | TIMESTAMP     | Created timestamp |
| expires_at   | TIMESTAMP     | Expiry timestamp |

### Used For:
- Payment creation
- Refund creation

Prevents duplicate operations when the same key is reused.

---

#  Relationships

```
merchants
   │
   ├── orders
   │     └── payments
   │           └── refunds
   │
   ├── webhook_logs
   └── idempotency_keys
```

---

#  Indexes

Optimized indexes exist for:

- orders.merchant_id
- payments.order_id
- payments.status
- refunds.payment_id
- webhook_logs.merchant_id
- webhook_logs.status
- webhook_logs.next_retry_at

---

#  Design Considerations

- UUID used for merchants for global uniqueness
- JSONB used for extensible metadata
- Webhook logs designed for retry scheduling
- Idempotency table prevents financial duplication
- Refund lifecycle supports async processing

---

#  Conclusion

This schema supports:

- Multi-merchant architecture
- Async payment processing
- Webhook retry system
- Secure signature validation
- Refund lifecycle
- Idempotent API behavior

Designed to simulate real-world payment gateway infrastructure.

---