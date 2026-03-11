const express = require("express");
const router = express.Router();

router.post("/test/toggle", async (req, res) => {
  const { success, failure, delay } = req.body;

  if (success !== undefined) {
    process.env.TEST_PAYMENT_SUCCESS = success ? "true" : "false";
    process.env.TEST_FORCE_FAILURE = success ? "false" : process.env.TEST_FORCE_FAILURE;
  }

  if (failure !== undefined) {
    process.env.TEST_FORCE_FAILURE = failure ? "true" : "false";
    process.env.TEST_PAYMENT_SUCCESS = failure ? "false" : process.env.TEST_PAYMENT_SUCCESS;
  }

  if (delay !== undefined) {
    process.env.TEST_PROCESSING_DELAY = delay.toString();
  }

  return res.json({
    TEST_MODE: process.env.TEST_MODE,
    TEST_PAYMENT_SUCCESS: process.env.TEST_PAYMENT_SUCCESS,
    TEST_FORCE_FAILURE: process.env.TEST_FORCE_FAILURE,
    TEST_PROCESSING_DELAY: process.env.TEST_PROCESSING_DELAY
  });
});

module.exports = router;
