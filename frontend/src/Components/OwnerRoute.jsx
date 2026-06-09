import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

/**
 * OwnerRoute — only lets venue owners through.
 * Reads token from Redux (consistent with the rest of the app).
 *   - No token     → /login
 *   - role "user"  → /
 *   - role "owner" → render children
 */
const OwnerRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const { role } = jwtDecode(token);
    if (role === "owner") return children;
    return <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

export default OwnerRoute;