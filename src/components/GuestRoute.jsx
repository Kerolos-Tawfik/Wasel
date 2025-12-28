import React from "react";
import { Navigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

const GuestRoute = ({ user, children }) => {

  if (user) {
    return <Navigate to="/findwork" replace />;
  }

  return children;
};

export default GuestRoute;
