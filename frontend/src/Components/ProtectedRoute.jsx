import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute — blocks unauthenticated users.
 * Use only for routes that truly require a login (e.g. booking flow).
 * Home page does NOT need this — guests can browse.
 */
const ProtectedRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;