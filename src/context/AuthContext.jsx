import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, profileAPI } from "../lib/apiService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signIn = async (userData, token) => {
    setUser(userData);
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(userData));
  };

  const signUp = async (userData, token) => {
    setUser(userData);
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(userData));
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    
    setProfileLoading(true);
    try {
      const response = await profileAPI.getProfile(user.id);
      const data = await response.json();
      
      if (response.ok && data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    profile,
    setProfile,
    profileLoading,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

