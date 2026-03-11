import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import WebhookLogs from "./pages/WebhookLogs";
import WebhookConfig from "./pages/WebhookConfig";
import ApiDocs from "./pages/ApiDocs";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/webhooks" element={<WebhookLogs />} />
        <Route path="/webhook-config" element={<WebhookConfig />} />
        <Route path="/docs" element={<ApiDocs />} />
      </Routes>
    </HashRouter>
  );
}
