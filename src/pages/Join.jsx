import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import PasswordStrength from "../components/auth/PasswordStrength";
import { toastConfig } from "../lib/toastConfig";
import styles from "./Auth.module.css";

const Join = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [loading, setLoading] = useState(false);

  const isPasswordValid = (pass) => {
    return (
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /[a-z]/.test(pass) &&
      /[0-9]/.test(pass)
    );
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("handleJoin started");

    if (!isPasswordValid(password)) {
      toast.error(t("auth.errors.weak_password"), toastConfig);
      return;
    }

    const infoSignUp = {
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phoneNum,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    };

    try {
      const { data, error } = await supabase.auth.signUp(infoSignUp);

      if (error) throw error;

      // Check if user already exists (Supabase returns user with identities = [] for existing emails)
      if (data?.user?.identities?.length === 0) {
        console.log("User already registered (identities empty)");
        toast.error(t("auth.errors.user_already_registered"), toastConfig);
        return;
      }

      console.log("Sign up successful");
      toast.success(t("auth.join_success"), toastConfig);
    } catch (error) {
      console.error("Sign up error from catch block:", error);
      toast.error(t("errors.default"), toastConfig);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("auth.join_title")}</h1>

        <form className={styles.form} onSubmit={handleJoin}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t("auth.full_name")}</label>
            <input
              type="text"
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال احمد محمد "
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>{t("auth.email")}</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t("auth.phone")}</label>
            <input
              type="tel"
              onChange={(e) => setPhoneNum(e.target.value)}
              className={styles.input}
              value={phoneNum}
              placeholder="123-456-789"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>{t("auth.password")}</label>
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
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <Loader2 size={20} className={styles.spinner} />
            ) : (
              t("auth.submit_join")
            )}
          </button>
        </form>

        <div className={styles.footer}>
          {t("auth.have_account")}
          <Link to="/login" className={styles.link}>
            {t("auth.login_link")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Join;
