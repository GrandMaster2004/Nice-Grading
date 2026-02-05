import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../utils/api.js";

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = getToken();
  const userRole = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
