import React from "react";
import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({
  children,
  allowIncompleteProfile = false,
  allowChangeSettings = false,
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in but hasn't completed onboarding, and this route requires it
  if (!allowIncompleteProfile && (!profile || !profile.onboarding_completed)) {
    return <Navigate to="/onboarding" replace />;
  }

  // Allow users to change settings (go back to onboarding)
  if (allowChangeSettings && profile?.onboarding_completed) {
    return children;
  }

  return children;
};

export default ProtectedRoute;
