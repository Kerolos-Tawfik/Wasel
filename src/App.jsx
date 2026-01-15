import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authAPI, profileAPI, workRequestAPI } from "./lib/apiService";
import { toastConfig } from "./lib/toastConfig";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import Home from "./pages/Home.jsx";
import Join from "./pages/Join.jsx";
import Login from "./pages/Login.jsx";
import UpdatePassword from "./pages/UpdatePassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import FindWork from "./pages/FindWork.jsx";
import AddWork from "./pages/AddWork.jsx";
import EmailVerified from "./pages/EmailVerified.jsx";
import VerifyError from "./pages/VerifyError.jsx";
import Messages from "./pages/Messages.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Profile from "./pages/Profile.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import styles from "./App.module.css";
import { LoaderCircle } from "lucide-react";
import { AuthProvider } from "./context/AuthContext.jsx";

export default function App() {
  const { i18n, t } = useTranslation();
  const [service, setService] = useState("local");
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  const fetchWorkRequests = async () => {
    try {
      const response = await workRequestAPI.getAllWorkRequests();
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch work requests");

      setFormData(data.workRequests || []);
    } catch (error) {
      console.error("Error fetching work requests:", error);
      toast.error(error.message || t("errors.default"), toastConfig);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const response = await profileAPI.getProfile(userId);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch profile");

      setUserProfile(data.profile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(error.message || t("errors.default"), toastConfig);
    }
  };

  const refreshProfile = () => {
    const userId = user?.id;
    if (userId) {
      fetchUserProfile(userId);
    }
  };

  useEffect(() => {
    fetchWorkRequests();
  }, []);

  useEffect(() => {
    if (user) {
      `${window.location.origin}/profile`;
    }
  }, [user]);

  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  // Check for current session
  async function getCurrentSession() {
    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");

      if (!token) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch current user");

      if (data.user) {
        setUser(data.user);
        await fetchUserProfile(data.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.log("Error fetching current session:", error);
    } finally {
      setLoading(false);
    }
  }

  // turn on the session check on component mount
  useEffect(() => {
    getCurrentSession();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <LoaderCircle className={styles.animate_spin} size={48} />
      </div>
    );
  }

  // Check if user needs onboarding (no role selected yet)
  const needsOnboarding = user && !userProfile?.user_role;

  return (
    <AuthProvider>
      <ToastContainer />
      <Router>
        <div className="app-container">
          <Header user={user} userProfile={userProfile} />
          <Routes>
            <Route
              path="/"
              element={<Home user={user} selectedRole={selectedRole} />}
            />
            <Route
              path="/login"
              element={
                <GuestRoute user={user}>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/join"
              element={
                <GuestRoute user={user}>
                  <Join />
                </GuestRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestRoute user={user}>
                  <ForgotPassword />
                </GuestRoute>
              }
            />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/verify-error" element={<VerifyError />} />

            <Route
              path="/findwork"
              element={
                <ProtectedRoute user={user}>
                  {needsOnboarding ? (
                    <Onboarding
                      user={user}
                      selectedRole={selectedRole}
                      setSelectedRole={setSelectedRole}
                      refreshProfile={refreshProfile}
                    />
                  ) : (
                    <FindWork
                      savedData={formData}
                      service={service}
                      setService={setService}
                      user={user}
                    />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/addwork"
              element={
                <ProtectedRoute user={user}>
                  {needsOnboarding ? (
                    <Onboarding
                      user={user}
                      selectedRole={selectedRole}
                      setSelectedRole={setSelectedRole}
                      onComplete={refreshProfile}
                    />
                  ) : (
                    <AddWork user={user} onComplete={fetchWorkRequests} />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-requests"
              element={
                <ProtectedRoute user={user}>
                  <MyRequests user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute user={user}>
                  <Messages user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <Profile
                    user={user}
                    userProfile={userProfile}
                    onProfileUpdate={refreshProfile}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute user={user}>
                  <Profile
                    user={user}
                    userProfile={userProfile}
                    onProfileUpdate={refreshProfile}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer user={user} />
        </div>
      </Router>
    </AuthProvider>
  );
}

// onComplete={refreshProfile}
