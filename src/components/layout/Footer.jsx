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
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandColumn}>
            <img
              className={styles.logo}
              src="/assets/images/Wasel_footer.png"
              alt="Wasel"
            />
            <p className={styles.tagline}>
              {t("footer.about_desc") ||
                "Connecting talent with opportunity across the kingdom and beyond."}
            </p>
            <div className={styles.socialIcons}>
              <a href="#" className={styles.socialLink}>
                <Facebook size={18} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Twitter size={18} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Instagram size={18} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div className={styles.linksGrid}>
            <div className={styles.linkColumn}>
              <h5>{t("footer.platform_label") || "Platform"}</h5>
              <button onClick={() => scrollToSection("home")}>
                {t("header.home")}
              </button>
              <button onClick={() => scrollToSection("services")}>
                {t("header.services")}
              </button>
              <button onClick={() => scrollToSection("why-choose-us")}>
                {t("header.why_choose_us")}
              </button>
            </div>
            <div className={styles.linkColumn}>
              <h5>{t("footer.support_label") || "Support"}</h5>
              <button onClick={() => scrollToSection("faq")}>
                {t("faq.title") || "Help Center"}
              </button>
              <button onClick={() => scrollToSection("footer")}>
                {t("footer.contact")}
              </button>
              <a href="mailto:info@wasel.com">info@wasel.com</a>
            </div>
            <div className={styles.linkColumn}>
              <h5>{t("footer.legal_label") || "Legal"}</h5>
              <button>{t("footer.privacy_policy") || "Privacy Policy"}</button>
              <button>
                {t("footer.terms_of_service") || "Terms of Service"}
              </button>
              <button>{t("footer.cookies") || "Cookies"}</button>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>{t("footer.rights") || "© 2026 Wasel. All rights reserved."}</p>
          <div className={styles.bottomLinks}>
            <span>
              {t("footer.saudi_made") || "Proudly Made in Saudi Arabia 🇸🇦"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
