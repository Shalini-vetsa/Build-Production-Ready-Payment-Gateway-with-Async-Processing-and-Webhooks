import { useState } from "react";

export default function CheckoutForm() {
  const url = new URL(window.location.href);
  const orderId = url.searchParams.get("order_id");
  const key = url.searchParams.get("key");

  const [method, setMethod] = useState("upi");
  const [vpa, setVpa] = useState("");
  const [card, setCard] = useState({ number: "", exp: "", cvv: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);

    const body = { order_id: orderId, method };
    if (method === "upi") body.vpa = vpa;
    if (method === "card") body.card = card;

    const res = await fetch("/api/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": key
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    setLoading(false);

    if (data.id) {
      window.parent.PaymentGatewayInstance.poll(data.id);
    } else {
      setError(data.message || "Payment failed");
    }
  }

  return (
    <div className="pg-form">
      <h3>Complete Payment</h3>

      <select value={method} onChange={e => setMethod(e.target.value)}>
        <option value="upi">UPI</option>
        <option value="card">Card</option>
      </select>

      {method === "upi" && (
        <input className="pg-input" placeholder="UPI ID" value={vpa}
          onChange={e => setVpa(e.target.value)} />
      )}

      {method === "card" && (
        <>
          <input className="pg-input" placeholder="Card Number"
            onChange={e => setCard({...card, number: e.target.value })}/>
          <input className="pg-input" placeholder="MM/YY"
            onChange={e => setCard({...card, exp: e.target.value })}/>
          <input className="pg-input" placeholder="CVV"
            onChange={e => setCard({...card, cvv: e.target.value })}/>
        </>
      )}

      {error && <div style={{color:"red"}}>{error}</div>}

      <button className="pg-button" onClick={submit} disabled={loading}>
        {loading ? "Processing..." : "Pay"}
      </button>
    </div>
  );
}
