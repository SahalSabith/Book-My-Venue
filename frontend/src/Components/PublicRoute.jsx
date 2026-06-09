import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

/**
 * PublicRoute — for auth pages (login, register, forgot-password).
 * If the user is already logged in, send them to the right place:
 *   - owners  → /venue-owner
 *   - users   → /
 */
const PublicRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);

  if (token) {
    try {
      const { role } = jwtDecode(token);
      return <Navigate to={role === "owner" ? "/venue-owner" : "/"} replace />;
    } catch {
      // Bad token — let them through to login/register
    }
  }

  return children;
};

export default PublicRoute;