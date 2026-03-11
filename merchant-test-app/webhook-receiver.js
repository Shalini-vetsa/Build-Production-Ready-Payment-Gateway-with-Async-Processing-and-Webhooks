const express = require('express');
const crypto = require('crypto');

const app = express();

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const rawBody = req.rawBody;

  const secret = 'whsec_test_abc123'; 

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (!signature || signature !== expectedSignature) {
    console.log('❌ Invalid signature');
    return res.status(401).send('Invalid signature');
  }

  console.log('✅ Webhook verified:', req.body.event);
  console.log('Payment/Refund ID:', req.body.data.id);

  res.status(200).send('OK');
});

app.listen(4000, () => {
  console.log('Merchant webhook receiver running on port 4000');
});