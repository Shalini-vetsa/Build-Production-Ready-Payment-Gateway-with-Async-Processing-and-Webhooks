import { useEffect, useState } from "react";
import {
  getWebhookConfig,
  saveWebhookConfig,
  regenerateWebhookSecret
} from "../services/api";
import LogoutButton from "../components/LogoutButton";

export default function WebhookConfig() {
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const cfg = await getWebhookConfig();
    setUrl(cfg.url || "");
    setSecret(cfg.secret || null);
    setLoading(false);
  }

  async function save() {
    await saveWebhookConfig(url);
    alert("Saved!");
  }

  async function regen() {
    const r = await regenerateWebhookSecret();
    setSecret(r.secret);
    alert("New secret generated!");
  }

  return (
    <div style={{ padding: 40 }}>
      <LogoutButton />
      <h2>Webhook Configuration</h2>

      {loading && <p>Loading...</p>}

      <div>
        <label>Webhook URL</label><br />
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{ width: 400 }}
        />
        <br /><br />
        <button onClick={save}>Save</button>
      </div>

      <br />

      <div>
        <b>Webhook Secret:</b><br />
        {secret || "Not set"}<br /><br />
        <button onClick={regen}>Regenerate Secret</button>
      </div>
    </div>
  );
}
