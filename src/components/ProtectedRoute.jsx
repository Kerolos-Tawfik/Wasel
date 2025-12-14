import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ user, children }) => {
  if (user) {
    // window.location.href = "/login";
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;
