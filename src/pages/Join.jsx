import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, ChevronDown } from "lucide-react";
import { authAPI } from "../lib/apiService";
import PasswordStrength from "../../../Wasel/src/components/auth/PasswordStrength";
import { toastConfig } from "../../../Wasel/src/lib/toastConfig";
import { arabCountries, validatePhone } from "../lib/phoneUtils";
import styles from "./Auth.module.css";

const Join = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(arabCountries[0]); // Default Saudi Arabia
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    if (!isPasswordValid(password)) {
      toast.error(t("auth.errors.weak_password"), toastConfig);
      setLoading(false);
      return;
    }

    if (!validatePhone(phoneNum, selectedCountry.code)) {
      toast.error(t("auth.errors.phone_invalid"), toastConfig);
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        email,
        password,
        full_name: fullName,
        phone: selectedCountry.dial_code + phoneNum, // Send full number
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || t("errors.default"), toastConfig);
        return;
      }

      console.log("Sign up successful");
      toast.success(t("auth.join_success"), toastConfig);
      navigate("/login");
    } catch (error) {
      console.error("Sign up error:", error);
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
            <div className={styles.phoneInputContainer}>
              {/* Country Dropdown */}
              <div className={styles.countrySelect}>
                <button
                  type="button"
                  className={styles.countryBtn}
                  onClick={() => setShowCountryMenu(!showCountryMenu)}
                >
                  <span className={styles.flag}>{selectedCountry.flag}</span>
                  <span className={styles.dialCode}>
                    {selectedCountry.dial_code}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {showCountryMenu && (
                  <div className={styles.countryMenu}>
                    {arabCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        className={styles.countryOption}
                        onClick={() => {
                          setSelectedCountry(country);
                          setShowCountryMenu(false);
                        }}
                      >
                        <span className={styles.flag}>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className={styles.dialCode}>
                          {country.dial_code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Number Input */}
              <input
                type="tel"
                onChange={(e) => setPhoneNum(e.target.value)}
                className={styles.phoneInput}
                value={phoneNum}
                placeholder={selectedCountry.placeholder || "05xxxxxxxx"}
                required
                dir="ltr"
              />
            </div>
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
