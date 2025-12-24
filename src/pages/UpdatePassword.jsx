import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import PasswordStrength from "../../../Wasel/src/components/auth/PasswordStrength";
import { toastConfig } from "../../../Wasel/src/lib/toastConfig";
import styles from "./Auth.module.css";
// import { useAuth } from "../../context/AuthContext"; // Assuming you have AuthContext

const UpdatePassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const { user } = useAuth(); // If available
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if we are in Reset Mode (from email link) or Update Mode (logged in)
  const resetToken = searchParams.get("token");
  const email = searchParams.get("email");
  const isResetMode = !!(resetToken && email);

  // In a real app, you might want to verify the user is logged in if !isResetMode
  // const user = JSON.parse(localStorage.getItem("user")); 

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
      toast.error(t("auth.password_requirements_error") || "Password requirements not met", toastConfig);
      setLoading(false);
      return;
    }

    try {
      let url, body, method;

      if (isResetMode) {
        // Reset Password Flow
        url = "http://localhost:8000/api/reset-password";
        method = "POST";
        body = { token: resetToken, email, password };
      } else {
        // Update Password Flow (Logged In)
        // Retrieve user from storage if context not available
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) throw new Error("User not found or logged out");

        url = `http://localhost:8000/api/user/update-password/${user.id}`;
        method = "PUT";
        body = { password };
      }

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to update password");

      toast.success(t("auth.password_updated_success"), toastConfig);
      
      // If reset, redirect to login. If update, maybe stay or go profile.
      if (isResetMode) {
        navigate("/login");
      } else {
        // Optional: Logout user after password change or just redirect
        navigate("/profile"); 
      }

    } catch (error) {
      console.error("Password update error:", error);
      toast.error(error.message || t("errors.default"), toastConfig);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {isResetMode ? t("auth.reset_password_title") || "Reset Password" : t("auth.update_password")}
        </h1>

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
              isResetMode ? "Reset Password" : t("auth.update_password_btn")
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
