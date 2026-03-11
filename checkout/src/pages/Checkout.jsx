import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8000/api/v1";

export default function Checkout() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");

  const [method, setMethod] = useState("upi");
  const [vpa, setVpa] = useState("");
  const [card, setCard] = useState({
    number: "",
    exp_month: "",
    exp_year: "",
    cvv: ""
  });

  const [paymentId, setPaymentId] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  /** MEMOIZED HEADERS */
  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    "X-Api-Key": localStorage.getItem("apiKey") || "key_test_abc123",
    "X-Api-Secret": localStorage.getItem("apiSecret") || "secret_test_xyz789"
  }), []);

  const pay = async () => {
    if (!orderId) return alert("Order ID missing");

    let payload = { order_id: orderId, method };

    if (method === "upi") {
      if (!vpa) return alert("Enter UPI ID");
      payload.vpa = vpa;
    }

    if (method === "card") {
      const { number, exp_month, exp_year, cvv } = card;
      if (!number || !exp_month || !exp_year || !cvv) {
        return alert("Enter complete card details");
      }
      payload.card = card;
    }

    setStatus("processing");
    setError("");

    const res = await fetch(`${API_BASE}/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setPaymentId(data.id);
  };

  /** BULLETPROOF POLLING */
  useEffect(() => {
    if (!paymentId) return;

    let active = true;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/payments/${paymentId}`,
          { headers }
        );

        const data = await res.json();

        if (!active) return;

        if (data.status === "success") {
          setStatus("success");
          clearInterval(interval);
        }

        if (data.status === "failed") {
          setStatus("failed");
          setError(data.error_code || "Payment failed");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [paymentId, headers]);

  return (
    <div style={{ padding: 40, maxWidth: 420 }}>
      <h2>Checkout</h2>
      <p><b>Order:</b> {orderId}</p>

      <label>
        <input
          type="radio"
          checked={method === "upi"}
          onChange={() => setMethod("upi")}
        />{" "}
        UPI
      </label>

      <label style={{ marginLeft: 20 }}>
        <input
          type="radio"
          checked={method === "card"}
          onChange={() => setMethod("card")}
        />{" "}
        Card
      </label>

      <br /><br />

      {method === "upi" && (
        <input
          placeholder="test@upi"
          value={vpa}
          onChange={e => setVpa(e.target.value)}
        />
      )}

      {method === "card" && (
        <>
          <input
            placeholder="4111111111111111"
            onChange={e => setCard({ ...card, number: e.target.value })}
          /><br />
          <input
            placeholder="MM"
            onChange={e => setCard({ ...card, exp_month: e.target.value })}
          /><br />
          <input
            placeholder="YYYY"
            onChange={e => setCard({ ...card, exp_year: e.target.value })}
          /><br />
          <input
            placeholder="CVV"
            onChange={e => setCard({ ...card, cvv: e.target.value })}
          />
        </>
      )}

      <br /><br />
      <button disabled={status === "processing"} onClick={pay}>
        {status === "processing" ? "Processing..." : "Pay"}
      </button>

      <br /><br />
      {status === "processing" && <p>⏳ Processing payment...</p>}
      {status === "success" && <p style={{ color: "green" }}>✅ Payment Successful</p>}
      {status === "failed" && <p style={{ color: "red" }}>❌ Payment Failed ({error})</p>}
    </div>
  );
}
