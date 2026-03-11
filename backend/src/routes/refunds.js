const express = require("express");
const errorResponse = require("../utils/errors");
const idempotencyMiddleware = require("../middleware/idempotency");
const { getRefundById } = require("../models/Refund");
const { createRefundRequest } = require("../services/refundService");

const router = express.Router();

/* POST /api/v1/payments/:id/refunds */
router.post(
  "/payments/:id/refunds",
  idempotencyMiddleware,
  async (req, res) => {
    const { id: paymentId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json(
        errorResponse("BAD_REQUEST_ERROR", "Refund amount required")
      );
    }

    try {
      const refundId = await createRefundRequest(
        paymentId,
        req.merchant.id,
        amount,
        reason
      );

      const response = {
        id: refundId,
        status: "pending"
      };

      // 🔥 IMPORTANT: Save response for idempotency
      if (req.idempotencyKey) {
        await req.saveIdempotentResponse(response);
      }

      return res.status(201).json(response);

    } catch (err) {
      if (err.type === "NOT_FOUND") {
        return res.status(404).json(
          errorResponse("NOT_FOUND_ERROR", err.message)
        );
      }

      if (err.type === "BAD_REQUEST") {
        return res.status(400).json(
          errorResponse("BAD_REQUEST_ERROR", err.message)
        );
      }

      console.error("REFUND ERROR:", err);
      return res.status(500).json(
        errorResponse("REFUND_ERROR", "Refund creation failed")
      );
    }
  }
);

/* GET /api/v1/refunds/:id */
router.get("/refunds/:id", async (req, res) => {
  const { id } = req.params;

  const refund = await getRefundById(id);

  if (!refund) {
    return res.status(404).json(
      errorResponse("NOT_FOUND_ERROR", "Refund not found")
    );
  }

  return res.json(refund);
});

module.exports = router;