const BASE_URL = "http://localhost:8000/api/v1";

function headers() {
  return {
    "Content-Type": "application/json",
    "X-Api-Key": localStorage.getItem("apiKey"),
    "X-Api-Secret": localStorage.getItem("apiSecret"),
  };
}

export async function fetchOrders() {
  const res = await fetch(`${BASE_URL}/orders`, { headers: headers() });
  return res.json();
}

export async function fetchPayments() {
  const res = await fetch(`${BASE_URL}/payments`, { headers: headers() });
  return res.json();
}

/** WEBHOOK CONFIG - GET */
export async function getWebhookConfig() {
  const res = await fetch(`${BASE_URL}/webhooks/config`, {
    headers: headers()
  });
  return res.json();
}

/** WEBHOOK CONFIG - SAVE URL */
export async function saveWebhookConfig(url) {
  const res = await fetch(`${BASE_URL}/webhooks/config`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ url })
  });
  return res.json();
}

/** WEBHOOK CONFIG - REGENERATE SECRET */
export async function regenerateWebhookSecret() {
  const res = await fetch(`${BASE_URL}/webhooks/secret`, {
    method: "POST",
    headers: headers()
  });
  return res.json();
}

export async function fetchWebhookLogs(limit = 20) {
  const res = await fetch(
    `${BASE_URL}/webhooks?limit=${limit}`,
    {
      method: "GET",
      headers: headers()
    }
  );

  return res.json();
}
