import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  MessageSquare,
  Bell,
} from "lucide-react";

import styles from "./Header.module.css";
import { toast } from "react-toastify";
import { toastConfig } from "../../lib/toastConfig.js";
import { notificationAPI } from "../../lib/apiService";

const Header = ({ user, userProfile }) => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    let interval;
    const startPolling = () => {
      if (user?.id && document.visibilityState === "visible") {
        fetchNotifications();
        if (!interval) {
          interval = setInterval(fetchNotifications, 60000);
        }
      } else {
        clearInterval(interval);
        interval = null;
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", startPolling);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", startPolling);
    };
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
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

    window.location.href = "/";
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
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

  const isHeadAdmin = user?.role === "head_admin";

  // Open Platform: Everyone can Add Work and Find Work
  // We can show "Add Work" as primary action
  const actionTo = "/addwork";
  const actionLabel = t("header.add_work");
  const ActionIcon = PlusCircle;

  const scrollToSection = (id) => {
    setIsMenuOpen(false); // Close mobile menu
    if (location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };

  return (
    <header className={styles.header}>
      <Link to="/">
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
              <button
                onClick={() => scrollToSection("why-choose-us")}
                className={styles.navLinkBtn}
              >
                {t("header.why_choose_us")}
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("services")}
                className={styles.navLinkBtn}
              >
                {t("header.services")}
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("contact")}
                className={styles.navLinkBtn}
              >
                {t("header.contact")}
              </button>
            </li>
          </ul>
        </nav>
      )}

      <div className={styles.desktopRight}>
        {user && (
          <div className={styles.notifContainer} ref={notifRef}>
            <button
              className={styles.notifBtn}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className={styles.notifBadge}>{unreadCount}</span>
              )}
            </button>

            {isNotifOpen && (
              <div className={styles.notifDropdown}>
                <div className={styles.notifHeader}>
                  <h3>{t("notifications.title") || "Notifications"}</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className={styles.markAllBtn}
                    >
                      {t("notifications.mark_all") || "Mark all as read"}
                    </button>
                  )}
                </div>
                <div className={styles.notifList}>
                  {notifications.length === 0 ? (
                    <div className={styles.emptyNotif}>
                      {t("notifications.empty") || "No notifications"}
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`${styles.notifItem} ${
                          !notif.read_at ? styles.unread : ""
                        }`}
                        onClick={() => {
                          handleMarkAsRead(notif.id);
                          if (notif.type === "new_message") {
                            navigate("/messages");
                          } else if (
                            notif.type === "status_update" ||
                            notif.type === "status_pending" ||
                            notif.type === "status_confirmed" ||
                            notif.type === "status_rejected"
                          ) {
                            const target = "/my-requests";
                            navigate(target, {
                              state: {
                                workRequestId: notif.data?.work_request_id,
                                notificationType: notif.type,
                              },
                            });
                          }
                          setIsNotifOpen(false);
                        }}
                      >
                        <div className={styles.notifText}>
                          <p className={styles.notifTitle}>
                            {notif.title === "New Message"
                              ? t("notifications.new_message_title")
                              : t(notif.title, notif.data)}
                          </p>
                          <p className={styles.notifMessage}>
                            {notif.message &&
                            notif.message.includes(
                              "You have a new message from",
                            )
                              ? t("notifications.new_message_body", {
                                  sender_name:
                                    notif.data?.sender_name ||
                                    notif.message.split("from ")[1] ||
                                    "User",
                                })
                              : t(notif.message, notif.data)}
                          </p>
                          <span className={styles.notifTime}>
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {!notif.read_at && <div className={styles.unreadDot} />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
                {isHeadAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`${styles.dropdownItem} ${styles.adminItem}`} // Add appropriate style if needed
                      onClick={() => setIsDropdownOpen(false)}
                      style={{ color: "#e11d48", fontWeight: "bold" }}
                    >
                      <Briefcase size={16} /> {/* Or simpler icon */}
                      {t("admin.layout.dashboard") || "Dashboard"}
                    </Link>
                    <div className={styles.dropdownDivider}></div>
                  </>
                )}

                <Link
                  to="/addwork"
                  className={`${styles.dropdownItem} ${styles.actionItem}`}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <PlusCircle size={16} />
                  {t("header.add_work")}
                </Link>

                <Link
                  to="/findwork"
                  className={styles.dropdownItem}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Search size={16} />
                  {t("header.browse_work")}
                </Link>

                <Link
                  to="/messages"
                  className={styles.dropdownItem}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <MessageSquare size={16} />
                  {t("header.messages") || "Messages"}
                </Link>

                <Link
                  to="/my-requests"
                  className={styles.dropdownItem}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Briefcase size={16} />
                  {t("header.my_requests") || "My Requests"}
                </Link>

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

      {user && (
        <div className={styles.mobileHeaderNotif} ref={notifRef}>
          <button
            className={styles.notifBtn}
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>{unreadCount}</span>
            )}
          </button>

          {isNotifOpen && (
            <div
              className={`${styles.notifDropdown} ${styles.mobileNotifDropdown}`}
            >
              <div className={styles.notifHeader}>
                <h3>{t("notifications.title") || "Notifications"}</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className={styles.markAllBtn}
                  >
                    {t("notifications.mark_all") || "Mark all as read"}
                  </button>
                )}
              </div>
              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotif}>
                    {t("notifications.empty") || "No notifications"}
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`${styles.notifItem} ${
                        !notif.read_at ? styles.unread : ""
                      }`}
                      onClick={() => {
                        handleMarkAsRead(notif.id);
                        if (notif.type === "new_message") {
                          navigate("/messages");
                        } else if (
                          notif.type === "status_update" ||
                          notif.type === "status_pending" ||
                          notif.type === "status_confirmed" ||
                          notif.type === "status_rejected"
                        ) {
                          const target =
                            userProfile?.user_role === "client"
                              ? "/my-requests"
                              : "/findwork";
                          navigate(target, {
                            state: {
                              workRequestId: notif.data?.work_request_id,
                              notificationType: notif.type,
                              notificationId: notif.id,
                            },
                          });
                        }
                        setIsNotifOpen(false);
                      }}
                    >
                      <div className={styles.notifText}>
                        <p className={styles.notifTitle}>
                          {notif.title === "New Message"
                            ? t("notifications.new_message_title")
                            : t(notif.title, notif.data)}
                        </p>
                        <p className={styles.notifMessage}>
                          {notif.message &&
                          notif.message.includes("You have a new message from")
                            ? t("notifications.new_message_body", {
                                sender_name:
                                  notif.data?.sender_name ||
                                  notif.message.split("from ")[1] ||
                                  "User",
                              })
                            : t(notif.message, notif.data)}
                        </p>
                        <span className={styles.notifTime}>
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {!notif.read_at && <div className={styles.unreadDot} />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
              </div>
            </div>

            {isHeadAdmin && (
              <Link
                to="/admin/dashboard"
                className={styles.mobileMenuItem}
                onClick={closeMenu}
                style={{ color: "#e11d48" }}
              >
                <Briefcase size={18} />
                {t("admin.layout.dashboard") || "Dashboard"}
              </Link>
            )}

            <Link
              to="/addwork"
              className={`${styles.mobileMenuItem} ${styles.actionLink}`}
              onClick={closeMenu}
            >
              <PlusCircle size={18} />
              {t("header.add_work")}
            </Link>

            <Link
              to="/findwork"
              className={styles.mobileMenuItem}
              onClick={closeMenu}
            >
              <Search size={18} />
              {t("header.browse_work")}
            </Link>

            <Link
              to="/messages"
              className={styles.mobileMenuItem}
              onClick={closeMenu}
            >
              <MessageSquare size={18} />
              {t("header.messages") || "Messages"}
            </Link>

            <Link
              to="/my-requests"
              className={styles.mobileMenuItem}
              onClick={closeMenu}
            >
              <Briefcase size={18} />
              {t("header.my_requests") || "My Requests"}
            </Link>

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
          <ul className={styles.mobileNavList}>
            <li>
              <Link to="/" onClick={closeMenu}>
                {t("header.home")}
              </Link>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("why-choose-us")}
                className={styles.mobileNavLinkBtn}
              >
                {t("header.why_choose_us")}
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("services")}
                className={styles.mobileNavLinkBtn}
              >
                {t("header.services")}
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("contact")}
                className={styles.mobileNavLinkBtn}
              >
                {t("header.contact")}
              </button>
            </li>
          </ul>
        )}

        {!user && (
          <div className={styles.mobileAuthButtons}>
            <Link to="/login" onClick={closeMenu}>
              <button className={styles.loginBtn}>{t("header.login")}</button>
            </Link>
            <Link to="/join" onClick={closeMenu}>
              <button className={styles.joinBtn}>{t("header.join")}</button>
            </Link>
          </div>
        )}

        <button onClick={toggleLanguage} className={styles.mobileLangBtn}>
          {i18n.language === "ar" ? "English" : "العربية"}
        </button>
      </div>
    </header>
  );
};

export default Header;
