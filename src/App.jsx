import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import Home from "./pages/Home.jsx";
import Join from "./pages/Join.jsx";
import Login from "./pages/Login.jsx";
import UpdatePassword from "./pages/UpdatePassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import FindWork from "./pages/FindWork.jsx";
import AddWork from "./pages/AddWork.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import styles from "./App.module.css";
import { LoaderCircle } from "lucide-react";

export default function App() {
  const { i18n } = useTranslation();
  const [service, setService] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  const fetchWorkRequests = async () => {
  try {
    const response = await fetch("/api/work-requests");
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to fetch work requests");

    setFormData(data.workRequests || []);
  } catch (error) {
    console.error("Error fetching work requests:", error);
    toast.error(error.message || t("errors.default"), toastConfig);
  }
};

  const fetchUserProfile = async (userId) => {
  try {
    const response = await fetch(`/api/profile/${userId}`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to fetch profile");

    setUserProfile(data.profile || null);
  } catch (error) {
    console.error("Error fetching profile:", error);
    toast.error(error.message || t("errors.default"), toastConfig);
  }
};

  const refreshProfile = () => {
    const userId = user?.user?.id;
    if (userId) {
      fetchUserProfile(userId);
    }
  };

  useEffect(() => {
    fetchWorkRequests();
  }, []);

  useEffect(() => {
    if (user) {
      ` ${window.location.origin}/profile`;
    }
  }, [user]);

  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  // Check for current session
 async function getCurrentSession() {
  try {
    setLoading(true);

    // افترض إنك مخزن token في localStorage أو تستخدم cookies
    const token = localStorage.getItem("authToken");

    if (!token) {
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/user/current", {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to fetch current user");

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
    <>
      <ToastContainer />
      <Router>
        <div className="app-container">
          <Header user={user} userProfile={userProfile} />
          <Routes>
            <Route
              path="/"
              element={<Home user={user} selectedRole={selectedRole} />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />

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
                    <AddWork user={user} />
                  )}
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
          </Routes>
          <Footer user={user} />
        </div>
      </Router>
    </>
  );
}

// onComplete={refreshProfile}
