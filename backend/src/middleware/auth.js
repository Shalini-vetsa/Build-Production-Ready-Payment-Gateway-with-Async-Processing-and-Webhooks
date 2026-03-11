const pool = require("../db");
const errorResponse = require("../utils/errors");

module.exports = async function auth(req, res, next) {
  const apiKey = req.header("X-Api-Key");
  const apiSecret = req.header("X-Api-Secret");

  if (!apiKey || !apiSecret) {
    return res.status(401).json(
      errorResponse("AUTHENTICATION_ERROR", "Invalid API credentials")
    );
  }

  const result = await pool.query(
    "SELECT * FROM merchants WHERE api_key=$1 AND api_secret=$2 AND is_active=true",
    [apiKey, apiSecret]
  );

  if (result.rowCount === 0) {
    return res.status(401).json(
      errorResponse("AUTHENTICATION_ERROR", "Invalid API credentials")
    );
  }

  req.merchant = result.rows[0];
  next();
};
