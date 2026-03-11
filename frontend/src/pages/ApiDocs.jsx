export default function ApiDocs({
  apiKey = "key_test_abc123",
  apiSecret = "secret_test_xyz789"
}) {
  const apiBase = "http://localhost:8000";
  const checkoutUrl = "http://localhost:3001";

  return (
    <div style={{ padding: 20 }}>
      <h2>Integration Docs</h2>

      <h3>Base API URL</h3>
      <pre>{apiBase}</pre>

      <h3>Authentication</h3>
      <pre>{`
All API requests must include:

x-api-key: ${apiKey}
X-Api-Secret: ${apiSecret}
`}</pre>

      <h3>1. Create Order</h3>
      <pre>{`
POST ${apiBase}/api/v1/orders
Headers:
  Content-Type: application/json
  x-api-key: ${apiKey}
  X-Api-Secret: ${apiSecret}

Body:
{
  "amount": 5000
}
`}</pre>

      <h3>2. Redirect Customer to Hosted Checkout</h3>
      <pre>{`
After creating order, redirect customer to:

${checkoutUrl}/?order_id=order_123

Example:

window.location.href =
  "${checkoutUrl}/?order_id=order_123";
`}</pre>

      <h3>3. Capture Payment</h3>
      <pre>{`
POST ${apiBase}/api/v1/payments/:id/capture
Headers:
  x-api-key: ${apiKey}
  X-Api-Secret: ${apiSecret}
`}</pre>

      <h3>4. Refund Payment</h3>
      <pre>{`
POST ${apiBase}/api/v1/payments/:id/refunds
Headers:
  Content-Type: application/json
  x-api-key: ${apiKey}
  X-Api-Secret: ${apiSecret}
  Idempotency-Key: refund-key-123

Body:
{
  "amount": 1000,
  "reason": "customer_requested"
}
`}</pre>

      <h3>5. Webhook Signature Verification</h3>
      <pre>{`
Header:
  X-Webhook-Signature: <generated_signature>

Signature formula:
  HMAC_SHA256(raw_body, webhook_secret)

Node Example:

const crypto = require("crypto");

const expected = crypto
  .createHmac("sha256", "your_webhook_secret")
  .update(rawBody)
  .digest("hex");

if (expected !== signatureFromHeader) {
  throw new Error("Invalid webhook signature");
}
`}</pre>

      <h3>6. Webhook Events</h3>
      <ul>
        <li>payment.pending</li>
        <li>payment.success</li>
        <li>payment.failed</li>
        <li>refund.created</li>
        <li>refund.processed</li>
      </ul>

      <h3>7. Integration Flow Summary</h3>
      <pre>{`
1. Merchant creates order
2. Redirect user to hosted checkout
3. User completes payment
4. Merchant receives webhook
5. Merchant verifies signature
6. Merchant updates order status
`}</pre>
    </div>
  );
}
