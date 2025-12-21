import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ id: 1, name: "Test User" }); // بيانات dummy
  const [profile, setProfile] = useState({ id: 1, bio: "This is a test profile" });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const value = {
    signUp: async (data) => console.log("signUp called", data),
    signIn: async (data) => console.log("signIn called", data),
    signOut: async () => {
      console.log("signOut called");
      setUser(null);
      setProfile(null);
    },
    user,
    profile,
    profileLoading,
    isPasswordRecovery,
    refreshProfile: () => console.log("refreshProfile called"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
