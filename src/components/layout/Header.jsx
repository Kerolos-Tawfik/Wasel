import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Briefcase,
  Wrench,
  PlusCircle,
  Search,
} from "lucide-react";

import styles from "./Header.module.css";
import { toast } from "react-toastify";
import { toastConfig } from "../../lib/toastConfig.js";

const Header = ({ user, userProfile }) => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      const token = localStorage.getItem("authToken");
      await fetch("http://localhost:8000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        credentials: "include",
      });
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    } catch (err) {
      console.error("Logout error:", err);
    }
    toast.success(t("header.logout_success"), toastConfig);
    
    // Reload the page to clear all state
    window.location.href = "/";
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const closeMenu = () => setIsMenuOpen(false);

  // User info
  const userName = user?.full_name
    ? user.full_name
    : user?.email
    ? user.email.split("@")[0]
    : t("header.user");

  const isClient = userProfile?.user_role === "client";
  const isProvider = userProfile?.user_role === "provider";
  const providerSubtype = userProfile?.provider_type;

  const roleLabel = isClient
    ? t("header.role_client")
    : isProvider
    ? providerSubtype
      ? `${t("header.role_provider")} (${t(
          "profile.provider_type_" + providerSubtype
        )})`
      : t("header.role_provider")
    : null;
  const RoleIcon = isClient ? Briefcase : isProvider ? Wrench : null;

  const actionTo = isClient ? "/addwork" : isProvider ? "/findwork" : null;
  const actionLabel = isClient
    ? t("header.add_work")
    : isProvider
    ? t("header.browse_work")
    : null;
  const ActionIcon = isClient ? PlusCircle : isProvider ? Search : null;

  return (
    <header className={styles.header}>
      <Link
        to={
          user
            ? isProvider
              ? "/findwork"
              : isClient
              ? "/addwork"
              : "/"
            : "/"
        }
      >
        <img
          className={styles.logo}
          src="/assets/images/Wasel-Logo-Without-Slogan.svg"
          alt="logo"
        />
      </Link>

      {!user && (
        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            <li>
              <Link to="/">{t("header.home")}</Link>
            </li>
            <li>
              <a href="#why-choose-us">{t("header.why_choose_us")}</a>
            </li>
            <li>
              <a href="#services">{t("header.services")}</a>
            </li>
            <li>
              <a href="#contact">{t("header.contact")}</a>
            </li>
          </ul>
        </nav>
      )}

      <div className={styles.desktopRight}>
        <button onClick={toggleLanguage} className={styles.langBtn}>
          {i18n.language === "ar" ? "English" : "العربية"}
        </button>

        {user ? (
          <div className={styles.userDropdown} ref={dropdownRef}>
            <button
              className={styles.userDropdownBtn}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className={styles.userAvatar}>
                <User size={18} />
              </div>
              <span className={styles.userName}>{userName}</span>
              <ChevronDown
                size={16}
                className={`${styles.chevron} ${
                  isDropdownOpen ? styles.chevronOpen : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {roleLabel && RoleIcon && (
                  <>
                    <div className={styles.dropdownRole}>
                      <RoleIcon size={16} />
                      <span>{roleLabel}</span>
                    </div>
                    <div className={styles.dropdownDivider}></div>
                  </>
                )}

                {actionTo && ActionIcon && (
                  <Link
                    to={actionTo}
                    className={`${styles.dropdownItem} ${styles.actionItem}`}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <ActionIcon size={16} />
                    {actionLabel}
                  </Link>
                )}

                <Link
                  to="/profile"
                  className={styles.dropdownItem}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User size={16} />
                  {t("header.profile")}
                </Link>

                <div className={styles.dropdownDivider}></div>

                <button
                  onClick={handleLogout}
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                >
                  <LogOut size={16} />
                  {t("header.logout")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.authButtons}>
            <Link to="/login">
              <button className={styles.loginBtn}>{t("header.login")}</button>
            </Link>
            <Link to="/join">
              <button className={styles.joinBtn}>{t("header.join")}</button>
            </Link>
          </div>
        )}
      </div>

      <button
        className={styles.menuBtn}
        onClick={() => setIsMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {isMenuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}

      <div
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <button className={styles.closeMenuBtn} onClick={closeMenu}>
          <X size={24} />
        </button>

        {user && (
          <div className={styles.mobileUserSection}>
            <div className={styles.mobileUserInfo}>
              <div className={styles.mobileAvatar}>
                <User size={20} />
              </div>
              <div className={styles.mobileUserDetails}>
                <span className={styles.mobileUserName}>{userName}</span>
                {roleLabel && RoleIcon && (
                  <span className={styles.mobileUserRole}>
                    <RoleIcon size={14} />
                    {roleLabel}
                  </span>
                )}
              </div>
            </div>

            {actionTo && ActionIcon && (
              <Link
                to={actionTo}
                className={`${styles.mobileMenuItem} ${styles.actionLink}`}
                onClick={closeMenu}
              >
                <ActionIcon size={18} />
                {actionLabel}
              </Link>
            )}

            <Link
              to="/profile"
              className={styles.mobileMenuItem}
              onClick={closeMenu}
            >
              <User size={18} />
              {t("header.profile")}
            </Link>

            <button
              onClick={handleLogout}
              className={`${styles.mobileMenuItem} ${styles.logoutItemMobile}`}
            >
              <LogOut size={18} />
              {t("header.logout")}
            </button>
          </div>
        )}

        {!user && (
          <>
            <ul className={styles.mobileNavList}>
              <li>
                <Link to="/" onClick={closeMenu}>
                  {t("header.home")}
                </Link>
              </li>
              <li>
                <a href="#why-choose-us" onClick={closeMenu}>
                  {t("header.why_choose_us")}
                </a>
              </li>
              <li>
                <a href="#services" onClick={closeMenu}>
                  {t("header.services")}
                </a>
              </li>
              <li>
                <a href="#contact" onClick={closeMenu}>
                  {t("header.contact")}
                </a>
              </li>
            </ul>

            <div className={styles.mobileAuthButtons}>
              <Link to="/login" onClick={closeMenu}>
                <button className={styles.loginBtn}>{t("header.login")}</button>
              </Link>
              <Link to="/join" onClick={closeMenu}>
                <button className={styles.joinBtn}>{t("header.join")}</button>
              </Link>
            </div>
          </>
        )}

        <button onClick={toggleLanguage} className={styles.mobileLangBtn}>
          {i18n.language === "ar" ? "English" : "العربية"}
        </button>
      </div>
    </header>
  );
};

export default Header;
