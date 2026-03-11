import { useEffect, useState } from "react";
import { fetchPayments } from "../services/api";

export default function Transactions() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments().then(setPayments);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Transactions</h2>

      <ul>
        {payments.length === 0 && <li>No transactions yet</li>}

        {payments.map(p => (
          <li key={p.id}>
            {p.id} — {p.method.toUpperCase()} — {p.status}
            {p.status === "failed" && p.error_code && (
              <span style={{ color: "red" }}>
                {" "}({p.error_code})
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
