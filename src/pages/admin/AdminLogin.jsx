import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./AdminLogin.module.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        // Also refresh the app state if possible, or simple redirect
        window.location.href = "/admin/dashboard"; // Force reload to pick up auth context
      } else {
        // Force generic localized error for login failure to ensure translation
        setError(t("admin.login.failed"));
      }
    } catch (err) {
      setError(t("errors.default"));
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t("admin.login.title")}</h2>
          <p className={styles.subtitle}>{t("admin.login.subtitle")}</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.formGroup}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {t("admin.login.email_label")}
            </label>
            <input
              type="email"
              className={styles.input}
              placeholder={t("admin.login.email_placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {t("admin.login.password_label")}
            </label>
            <input
              type="password"
              className={styles.input}
              placeholder={t("admin.login.password_placeholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            {t("admin.login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
