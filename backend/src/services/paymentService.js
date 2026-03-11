function decideOutcome(method) {
  const r = Math.random();

  // 60% success, 40% failure overall
  if (r < 0.6) {
    return { status: "success", reason: null };
  }

  // Failures
  if (method === "card") {
    const cardFailures = [
      "CARD_DECLINED",
      "INSUFFICIENT_FUNDS"
    ];
    const reason =
      cardFailures[Math.floor(Math.random() * cardFailures.length)];
    return { status: "failed", reason };
  }

  if (method === "upi") {
    const upiFailures = [
      "UPI_DECLINED",
      "INSUFFICIENT_FUNDS"
    ];
    const reason =
      upiFailures[Math.floor(Math.random() * upiFailures.length)];
    return { status: "failed", reason };
  }

  return { status: "failed", reason: "UNKNOWN_ERROR" };
}

function processingDelay() {
  return Number(process.env.TEST_PROCESSING_DELAY || 1500);
}

module.exports = { decideOutcome, processingDelay };