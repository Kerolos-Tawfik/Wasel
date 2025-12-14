import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
import styles from "./Footer.module.css";

const Footer = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id) => {
    // if (location.pathname !== "/") {
    //   navigate("/");
    //   setTimeout(() => {
    //     const element = document.getElementById(id);
    //     if (element) element.scrollIntoView({ behavior: "smooth" });
    //   }, 100);
    // } else {
    //   const element = document.getElementById(id);
    //   if (element) element.scrollIntoView({ behavior: "smooth" });
    // }
  };

  return (
    <footer className={styles.footer} id="footer">
      {/* Logo Section - Top Center */}
      <div className={styles.logoSection}>
        <img
          className={styles.logo}
          src="/assets/images/Wasel-Logo-Without-Slogan.svg"
          alt="Wasel"
        />
      </div>

      {/* Main Footer Content */}
      <div className={styles.mainContent}>
        {/* About */}
        <div className={styles.brandArea}>
          <p className={styles.tagline}>{t("footer.about_desc")}</p>
        </div>

        <div className={styles.linksArea}>
          <div className={styles.linkGroup}>
            <h5>{t("footer.quick_links")}</h5>
            {user ? (
              <>
                <button onClick={() => scrollToSection("add-work")}>
                  {t("header.add_work")}
                </button>
                <button onClick={() => scrollToSection("browse-work")}>
                  {t("header.browse_work")}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => scrollToSection("home")}>
                  {t("header.home")}
                </button>
                <button onClick={() => scrollToSection("why-choose-us")}>
                  {t("header.why_choose_us")}
                </button>
                <button onClick={() => scrollToSection("services")}>
                  {t("header.services")}
                </button>
              </>
            )}
          </div>

          {/* Contact */}
          <div className={styles.linkGroup}>
            <h5>{t("footer.contact")}</h5>
            <a href="mailto:info@wasel.com">info@wasel.com</a>
            <a href="tel:+966123456789">+966 12 345 6789</a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContent}>
          <p>{t("footer.rights")}</p>

          <div className={styles.socialIcons}>
            <a href="#" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="Youtube">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
