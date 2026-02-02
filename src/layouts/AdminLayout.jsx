import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdDashboard, MdList, MdPeople, MdChatBubble } from "react-icons/md";
import { HiMenuAlt3, HiLogout } from "react-icons/hi";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  // We need to fetch the current user to know the role
  // Assuming we can get it from localStorage or context. For now, let's use a placeholder or check localStorage if available.
  const [userRole, setUserRole] = useState("admin"); // Default to admin for safety, but real implementation needs check

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { authAPI } = await import("../lib/apiService");
        const response = await authAPI.getCurrentUser();
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user?.role || "user");
        }
      } catch (error) {
        console.error("Error fetching user role", error);
      }
    };
    fetchUserRole();
  }, []);

  const handleLogout = () => {
    // Just navigate back to the main site without logging out
    navigate("/");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <h1
            className={styles.title}
            style={{ display: !isSidebarOpen ? "none" : "block" }}
          >
            {t("admin.layout.title")}
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={styles.menuButton}
          >
            <HiMenuAlt3 size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {(userRole === "admin" || userRole === "head_admin") && (
              <>
                <li>
                  <Link to="/admin/dashboard" className={styles.navItem}>
                    <MdDashboard size={22} />
                    <span
                      className={styles.navText}
                      style={{ display: !isSidebarOpen ? "none" : "block" }}
                    >
                      {t("admin.layout.dashboard")}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/requests" className={styles.navItem}>
                    <MdList size={22} />
                    <span
                      className={styles.navText}
                      style={{ display: !isSidebarOpen ? "none" : "block" }}
                    >
                      {t("admin.layout.requests")}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" className={styles.navItem}>
                    <MdPeople size={22} />
                    <span
                      className={styles.navText}
                      style={{ display: !isSidebarOpen ? "none" : "block" }}
                    >
                      {t("admin.layout.users") || "Users"}
                    </span>
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link to="/admin/support" className={styles.navItem}>
                <MdChatBubble size={22} />
                <span
                  className={styles.navText}
                  style={{ display: !isSidebarOpen ? "none" : "block" }}
                >
                  {t("admin.layout.support") || "Support"}
                </span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.logoutWrapper}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <HiLogout size={22} />
            <span
              className={styles.navText}
              style={{ display: !isSidebarOpen ? "none" : "block" }}
            >
              {t("admin.layout.logout")}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={styles.mobileMenuBtn}
            >
              <HiMenuAlt3 size={24} />
            </button>
            <h2 className={styles.headerTitle}>{t("admin.dashboard.title")}</h2>
          </div>
          <div
            className="flex items-center gap-4"
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <button
              onClick={toggleLanguage}
              className={styles.langBtn}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                backgroundColor: "#e5e7eb",
                cursor: "pointer",
                border: "none",
              }}
            >
              {i18n.language === "ar" ? "English" : "العربية"}
            </button>
            <div className={styles.userInfo}>
              <span className={styles.userRole}>{t("admin.layout.role")}</span>
              <div className={styles.avatar}></div>
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
