import React, { useState } from "react";
import { Link } from "react-router-dom";
import { XCircle, RefreshCcw, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { authAPI } from "../lib/apiService"; // Assuming we might add resend logic later
import { toast } from "react-toastify";
import styles from "./Verification.module.css";

const VerifyError = () => {
  const { t } = useTranslation();
  // We can add logic here to resend verification email if needed,
  // but for now, we'll keep it simple as per request.

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={`${styles.iconWrapper} ${styles.errorBg}`}>
          <XCircle size={48} strokeWidth={2} />
        </div>

        <h1 className={styles.title}>{t("auth.verify_error_title")}</h1>

        <p className={styles.message}>{t("auth.verify_error_message")}</p>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <Link to="/login" className={styles.button}>
            {t("auth.verify_error_button")}
          </Link>

          <Link to="/" className={`${styles.button} ${styles.secondaryButton}`}>
            <Home size={18} />
            {t("auth.verify_error_home")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyError;
