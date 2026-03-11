import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const key = sessionStorage.getItem("apiKey");
  const secret = sessionStorage.getItem("apiSecret");

  if (!key || !secret) {
    return <Navigate to="/" replace />;
  }

  return children;
}
