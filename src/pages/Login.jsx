import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { getAuthErrorMessage } from "../lib/errorHelpers";
import { toastConfig } from "../lib/toastConfig";
import styles from "./Auth.module.css";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  // const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (user) {
  //     navigate(location.state?.from?.pathname || "/listings", {
  //       replace: true,
  //     });
  //   }
  // }, [user, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/findwork");
      console.log("login successful");
    } catch (error) {
      const errorKey = getAuthErrorMessage(error);
      toast.error(t(errorKey), toastConfig);
   
      console.error("login error from catch block:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("auth.login_title")}</h1>

        <form className={styles.form} onSubmit={handleLogin}>
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

          <div className={styles.inputGroup}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label className={styles.label}>{t("auth.password")}</label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "0.8rem",
                  color: "#3b82f6",
                  textDecoration: "none",
                }}
              >
                {t("auth.forgot_password_link")}
              </Link>
            </div>
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
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <Loader2 size={20} className={styles.spinner} />
            ) : (
              t("auth.submit_login")
            )}
          </button>
        </form>

        <div className={styles.footer}>
          {t("auth.no_account")}
          <Link to="/join" className={styles.link}>
            {t("auth.join_link")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
