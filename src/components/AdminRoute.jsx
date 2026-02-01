import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "head_admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
