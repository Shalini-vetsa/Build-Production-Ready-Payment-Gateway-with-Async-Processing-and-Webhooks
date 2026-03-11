const API_BASE = "http://localhost:8000/api/v1";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Api-Key": localStorage.getItem("apiKey") || "key_test_abc123",
    "X-Api-Secret": localStorage.getItem("apiSecret") || "secret_test_xyz789"
  };
}

export async function createPayment(payload) {
  const res = await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Payment creation failed");
  }

  return res.json();
}

export async function getPayment(paymentId) {
  const res = await fetch(`${API_BASE}/payments/${paymentId}`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    throw new Error("Failed to fetch payment status");
  }

  return res.json();
}

export async function getOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    throw new Error("Order not found");
  }

  return res.json();
}
