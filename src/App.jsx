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
import { supabase } from "./lib/supabaseClient.js";
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
      const { data, error } = await supabase
        .from("work_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFormData(data || []);
    } catch (error) {
      console.error("Error fetching work requests from catch block:", error);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        return;
      }
      setUserProfile(data || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
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
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      // check for data.session and will be null if no user is logged in
      if (data.session?.user) {
        setUser(data?.session);
        await fetchUserProfile(data.session.user.id);
      }

      // Listen for changes to auth state (logged in, logged out, etc.)
      supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
    } catch (error) {
      console.log("error from catch block" + error);
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
