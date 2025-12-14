import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import PasswordStrength from "../components/auth/PasswordStrength";
import { getAuthErrorMessage } from "../lib/errorHelpers";
import { toastConfig } from "../lib/toastConfig";
import styles from "./Auth.module.css";

const UpdatePassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // useEffect(() => {
  //   let isMounted = true;

  //   // Listen for auth state changes
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     console.log("UpdatePassword auth event:", event, session);

  //     if (!isMounted) return;

  //     if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
  //       setIsValidSession(true);
  //       setCheckingSession(false);
  //       // Clear the URL params/hash for security
  //       window.history.replaceState(null, "", window.location.pathname);
  //       return;
  //     }
  //   });

  //   // Check for existing session (user was redirected here after code exchange)
  //   const checkSession = async () => {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();

  //     if (!isMounted) return;

  //     if (session) {
  //       setIsValidSession(true);
  //       setCheckingSession(false);
  //     } else {
  //       // No session - redirect to forgot password
  //       toast.error(t("auth.session_expired"), toastConfig);
  //       navigate("/forgot-password");
  //     }
  //   };

  //   return () => {
  //     isMounted = false;
  //     subscription.unsubscribe();
  //     clearTimeout(timer);
  //   };
  // }, [navigate, t]);

  // if (checkingSession) {
  //   return (
  //     <div className={styles.container}>
  //       <div className={styles.card}>
  //         <div className={styles.loadingState}>
  //           <Loader2 size={32} className={styles.spinner} />
  //           <p>{t("common.loading")}</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isValidSession) {
  //   return null;
  // }

  const isPasswordValid = (pass) => {
    return (
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /[a-z]/.test(pass) &&
      /[0-9]/.test(pass)
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!isPasswordValid(password)) {
      toast.error(t("auth.password_requirements"), toastConfig);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      toast.success(t("auth.password_updated_success"), toastConfig);
      navigate("/login");
    } catch (error) {
      const errorKey = getAuthErrorMessage(error);
      toast.error(t(errorKey), toastConfig);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("auth.update_password")}</h1>

        <form onSubmit={handleUpdate} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t("auth.new_password")}</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <Loader2 size={20} className={styles.spinner} />
            ) : (
              t("auth.update_password_btn")
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
