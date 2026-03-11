const express = require("express");
const pool = require("../db");
const generateId = require("../utils/idGenerator");
const errorResponse = require("../utils/errors");

const router = express.Router();

router.post("/", async (req, res) => {
  const { amount, receipt, notes } = req.body;

  if (!amount || amount < 100) {
    return res.status(400).json(
      errorResponse("BAD_REQUEST_ERROR", "Amount must be at least 100")
    );
  }

  const orderId = generateId("order_");

  await pool.query(
    `
    INSERT INTO orders
    (id, merchant_id, amount, currency, receipt, notes, status)
    VALUES ($1,$2,$3,'INR',$4,$5,'created')
    `,
    [orderId, req.merchant.id, amount, receipt || null, notes || {}]
  );

  res.status(201).json({
    id: orderId,
    merchant_id: req.merchant.id,
    amount,
    currency: "INR",
    receipt: receipt || null,
    notes: notes || {},
    status: "created"
  });
});

router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM orders WHERE merchant_id=$1 ORDER BY created_at DESC",
    [req.merchant.id]
  );
  res.json(result.rows);
});

module.exports = router;
