import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!apiKey || !apiSecret) {
      alert("Enter API Key and API Secret");
      return;
    }

    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("apiSecret", apiSecret);

    console.log("Login successful, redirecting...");
    navigate("/dashboard");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Merchant Login</h2>

      <input
        placeholder="API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="API Secret"
        type="password"
        value={apiSecret}
        onChange={(e) => setApiSecret(e.target.value)}
      />
      <br /><br />

      <button type="button" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
