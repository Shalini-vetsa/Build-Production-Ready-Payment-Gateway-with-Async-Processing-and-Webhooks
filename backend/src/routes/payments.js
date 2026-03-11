const express = require("express");
const pool = require("../db");
const generateId = require("../utils/idGenerator");
const errorResponse = require("../utils/errors");
const {
  isValidVPA,
  luhnCheck,
  cardNetwork,
  isExpired
} = require("../services/validationService");
const { enqueuePaymentJob } = require("../services/queueService");
const idempotencyMiddleware = require("../middleware/idempotency");

const router = express.Router();

/* POST /api/v1/payments */
router.post("/", idempotencyMiddleware, async (req, res) => {
  try {
    const { order_id, method, vpa, card } = req.body;

    if (!order_id || !method) {
      return res
        .status(400)
        .json(errorResponse("BAD_REQUEST_ERROR", "order_id and method are required"));
    }

    const order = await pool.query(
      "SELECT * FROM orders WHERE id=$1 AND merchant_id=$2",
      [order_id, req.merchant.id]
    );

    if (order.rowCount === 0) {
      return res
        .status(404)
        .json(errorResponse("NOT_FOUND_ERROR", "Order not found"));
    }

    const paymentId = generateId("pay_");
    let cardNet = null;
    let last4 = null;

    /* ---------------- VALIDATION ---------------- */

    if (method === "upi") {
      if (!isValidVPA(vpa)) {
        return res
          .status(400)
          .json(errorResponse("INVALID_VPA", "Invalid VPA"));
      }
    }

    if (method === "card") {
      const { number, exp_month, exp_year, cvv } = card || {};

      if (!number || !exp_month || !exp_year || !cvv || !luhnCheck(number)) {
        return res
          .status(400)
          .json(errorResponse("INVALID_CARD", "Invalid card details"));
      }

      if (isExpired(exp_month, exp_year)) {
        return res
          .status(400)
          .json(errorResponse("EXPIRED_CARD", "Card expired"));
      }

      cardNet = cardNetwork(number);
      last4 = number.slice(-4);
    }

    /* ---------------- CREATE PAYMENT ---------------- */

    await pool.query(
      `
      INSERT INTO payments
      (id, order_id, merchant_id, amount, currency, method, status, error_code, vpa, card_network, card_last4, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,'processing',NULL,$7,$8,$9, NOW(), NOW())
      `,
      [
        paymentId,
        order_id,
        req.merchant.id,
        order.rows[0].amount,
        order.rows[0].currency,
        method,
        vpa || null,
        cardNet,
        last4
      ]
    );

    /* ---------------- ASYNC PROCESSING ---------------- */

    await enqueuePaymentJob({
      paymentId,
      method,
      merchantId: req.merchant.id
    });

    const response = {
      id: paymentId,
      status: "processing"
    };

    if (req.idempotencyKey) {
      await req.saveIdempotentResponse(response);
    }

    return res.status(201).json(response);

  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    return res
      .status(500)
      .json(errorResponse("PAYMENT_FAILED", "Payment processing failed"));
  }
});

/* POST /api/v1/payments/:id/capture */
router.post("/:id/capture", async (req, res) => {
  const { id } = req.params;

  const payment = await pool.query(
    "SELECT * FROM payments WHERE id=$1 AND merchant_id=$2",
    [id, req.merchant.id]
  );

  if (payment.rowCount === 0) {
    return res.status(404).json(errorResponse("NOT_FOUND_ERROR", "Payment not found"));
  }

  if (payment.rows[0].status !== "success") {
    return res
      .status(400)
      .json(errorResponse("BAD_REQUEST_ERROR", "Payment not in capturable state"));
  }

  await pool.query(
    "UPDATE payments SET captured=true, updated_at=NOW() WHERE id=$1",
    [id]
  );

  return res.json({ id, status: "success", captured: true });
});

/* GET /api/v1/payments */
router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM payments WHERE merchant_id=$1 ORDER BY created_at DESC",
    [req.merchant.id]
  );
  res.json(result.rows);
});

/* GET /api/v1/payments/:payment_id */
router.get("/:payment_id", async (req, res) => {
  const { payment_id } = req.params;

  const result = await pool.query(
    "SELECT * FROM payments WHERE id=$1 AND merchant_id=$2",
    [payment_id, req.merchant.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json(errorResponse("NOT_FOUND_ERROR", "Payment not found"));
  }

  res.json(result.rows[0]);
});

module.exports = router;