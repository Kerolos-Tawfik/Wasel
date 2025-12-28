import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./Verification.module.css";

const EmailVerified = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={`${styles.iconWrapper} ${styles.successBg}`}>
          <CheckCircle size={48} strokeWidth={2} />
        </div>

        <h1 className={styles.title}>{t("auth.email_verified_title")}</h1>

        <p className={styles.message}>{t("auth.email_verified_message")}</p>

        <Link to="/login" className={styles.button}>
          {t("auth.email_verified_button")}
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
};

export default EmailVerified;
