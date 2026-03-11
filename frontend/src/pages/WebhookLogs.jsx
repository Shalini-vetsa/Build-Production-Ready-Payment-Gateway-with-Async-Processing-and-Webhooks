import { useEffect, useState } from "react";

export default function WebhookLogs({ apiKey, apiSecret }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("Now I am trying fetch")
fetch("http://localhost:8000/api/v1/webhooks?limit=20", {
  headers: {
    "X-Api-Key": localStorage.getItem("apiKey"),
    "X-Api-Secret": localStorage.getItem("apiSecret")
  }
}).then(r => r.text()).then(console.log)


  async function load() {
    setLoading(true);
    const res = await fetch("http://localhost:8000/api/v1/webhooks?limit=20", {
      headers: {
        "X-Api-Key": localStorage.getItem("apiKey"),
        "X-Api-Secret": localStorage.getItem("apiSecret")
      }
    });
    const data = await res.json();
    console.log(data)
    setLogs(data);
    setLoading(false);
  }

  async function retry(id) {
    await fetch(`http://localhost:8000/api/v1/webhooks/${id}/retry`, {
      method: "POST",
      headers: {
        "X-Api-Key": localStorage.getItem("apiKey"),
        "X-Api-Secret": localStorage.getItem("apiSecret")
      }
    });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Webhook Logs</h2>

      {loading && <div>Loading…</div>}

      {!loading && logs.length === 0 && <div>No logs found.</div>}

      {!loading && logs.length > 0 && (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Payment Id</th>
              <th>Event</th>
              <th>Delivery_Status</th>
              <th>Response Code</th>
              <th>Attempts</th>
              <th>Retry</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.payload.data.id}</td>
                <td>{log.event}</td>
                <td>{log.status}</td>
                <td>{log.attempts}</td>
                <td>{log.response_code || "-"}</td>
                <td>
                  {log.status === "failed" ? (
                    <button onClick={() => retry(log.id)}>Retry</button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
