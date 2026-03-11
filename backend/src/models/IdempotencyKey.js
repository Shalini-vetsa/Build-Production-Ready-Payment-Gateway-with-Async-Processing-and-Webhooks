const pool = require("../db");

async function findKey(key, merchantId) {
  const result = await pool.query(
    `
    SELECT response, expires_at
    FROM idempotency_keys
    WHERE key=$1 AND merchant_id=$2
    `,
    [key, merchantId]
  );

  if (result.rowCount === 0) return null;

  const row = result.rows[0];

  const expired = new Date(row.expires_at) < new Date();
  if (expired) return null;

  return row.response;
}

async function storeKey(key, merchantId, response) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query(
    `
    INSERT INTO idempotency_keys (key, merchant_id, response, created_at, expires_at)
    VALUES ($1, $2, $3, NOW(), $4)
    ON CONFLICT (key) DO UPDATE
    SET response=EXCLUDED.response, expires_at=EXCLUDED.expires_at
    `,
    [key, merchantId, response, expires]
  );
}

module.exports = {
  findKey,
  storeKey
};
