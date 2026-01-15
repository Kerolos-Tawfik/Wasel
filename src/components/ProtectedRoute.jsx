import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }) => {
  // If NO user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // If user exists, show the protected content
  return children;
};

export default ProtectedRoute;
