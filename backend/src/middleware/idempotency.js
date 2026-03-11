const { findKey, storeKey } = require("../models/IdempotencyKey");

module.exports = async function idempotencyMiddleware(req, res, next) {
  const key = req.headers["idempotency-key"];
  req.idempotencyKey = null;

  // If no key, proceed normally
  if (!key) return next();

  req.idempotencyKey = key;

  // Check if cached response exists
  const cached = await findKey(key, req.merchant.id);

  if (cached) {
    console.log(`Idempotency HIT for key: ${key}`);
    return res.status(201).json(cached);
  }

  // attach helper so route can store result later
  req.saveIdempotentResponse = async response => {
    await storeKey(key, req.merchant.id, response);
  };

  console.log(`Idempotency MISS for key: ${key}`);
  next();
};
