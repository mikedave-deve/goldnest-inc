// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../api";

/**
 * AdminRoute - Requires user to be logged in AND be an admin
 * Redirects to /login if not authenticated
 * Redirects to /PostDashboard if authenticated but not admin
 */
const AdminRoute = ({ children }) => {
  // Check if user is logged in
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  if (!isAdmin()) {
    // User is logged in but not admin - redirect to user dashboard
    return <Navigate to="/PostDashboard" replace />;
  }

  // User is logged in and is admin - allow access
  return children;
};

export default AdminRoute;