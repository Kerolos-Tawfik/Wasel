import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const fetchProfile = async (userId) => {
    setProfileLoading(true);
    try {
      // Use maybeSingle to avoid 406 errors when PostgREST content-negotiation
      // cannot return an object (e.g. zero rows or unexpected response).
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // If PostgREST returns 406 Not Acceptable (content negotiation issue),
      // retry without expecting an object to get raw rows and pick the first.
      if (error && error.status === 406) {
        console.warn(
          "Received 406 from profiles endpoint, retrying without maybeSingle():",
          error
        );
        const res = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId);
        if (res.error) {
          console.error("Retry fetch profile error:", res.error);
          setProfile(null);
          return;
        }
        data = Array.isArray(res.data) ? res.data[0] ?? null : res.data;
        error = null;
      }

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        setProfile(null);
        return;
      }

      setProfile(data || null);
    } catch (error) {
      console.error("Error:", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Verify session is still valid on the server
    const verifySession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log("User no longer exists, signing out...");
          await supabase.auth.signOut();
          if (mounted) {
            setUser(null);
            setProfile(null);
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
              if (key.startsWith("sb-")) {
                localStorage.removeItem(key);
              }
            });
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser(user);
          fetchProfile(user.id);
          setLoading(false);
        }
      } catch (err) {
        console.error("Session verification error:", err);
        if (mounted) setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);

      if (event === "PASSWORD_RECOVERY") {
        if (mounted) {
          setIsPasswordRecovery(true);
          setUser(session?.user ?? null);
          setLoading(false);
        }
        return;
      }

      if (event === "SIGNED_OUT") {
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
        return;
      }

      if (mounted) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Use setTimeout to avoid blocking and potential race conditions
          setTimeout(() => {
            if (mounted) fetchProfile(currentUser.id);
          }, 0);
        } else {
          setProfile(null);
        }

        // Always stop loading after auth state is determined
        setLoading(false);
      }
    });

    verifySession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: async () => {
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (error) {
        console.error("Sign out error:", error);
      }
      setUser(null);
      setProfile(null);
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("sb-")) {
          localStorage.removeItem(key);
        }
      });
    },
    user,
    profile,
    profileLoading,
    isPasswordRecovery,
    refreshProfile: () => user && fetchProfile(user.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <div className="loading-spinner">Loading...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
