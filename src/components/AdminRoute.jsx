import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = ["head_admin", "admin", "support"];
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
