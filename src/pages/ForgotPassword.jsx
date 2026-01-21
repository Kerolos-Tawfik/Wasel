import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { getAuthErrorMessage } from "../../../Wasel/src/lib/errorHelpers";
import { toastConfig } from "../../../Wasel/src/lib/toastConfig";
import styles from "./Auth.module.css";
import { Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://waselp.com/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to send reset email");

      // DEV ONLY: Show current token in toast to copy
      if (data.token) {
        toast.info(
          <div>
            Reset Token (Click URL in real app): <br />
            <strong>{data.token}</strong>
          </div>,
          { ...toastConfig, autoClose: false, closeOnClick: false }
        );
      }

      toast.success(t("auth.reset_email_sent"), toastConfig);
    } catch (error) {
      toast.error(error.message, toastConfig);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("auth.forgot_password")}</h1>
        <p
          className={styles.subtitle}
          style={{
            marginBottom: "1.5rem",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          {t("auth.forgot_password_desc")}
        </p>

        <form className={styles.form} onSubmit={handleReset}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t("auth.email")}</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <Loader2 size={20} className={styles.spinner} />
            ) : (
              t("auth.send_reset_link")
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>
            {t("auth.back_to_login")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
