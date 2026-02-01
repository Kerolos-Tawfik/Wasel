import { useTranslation } from "react-i18next";
import {
  Search,
  Compass,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styles from "./hero.module.css";

const Hero = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className={styles.hero} id="home">
      <div className={styles.shape1}></div>
      <div className={styles.shape2}></div>

      <div className={styles.heroContainer}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="sub-tag">
            <Compass size={14} style={{ marginRight: "8px" }} />
            <span>
              {t("hero.badge") || "Professional Services Marketplace"}
            </span>
          </div>
          <h1 className={styles.title}>
            {t("hero.title_part1") || "Connect with the best"}{" "}
            <span
              className={`${styles.decorative} ${
                i18n.language === "en" ? styles.blockDecorative : ""
              }`}
            >
              {t("hero.title_decorative") || "Freelance Excellence"}
            </span>{" "}
            {t("hero.title_part2") || "for your projects"}
          </h1>
          <p className={styles.subtitle}>{t("hero.subtitle")}</p>

          <div className={styles.originalFeatures}>
            <div className={styles.featureItem}>
              <CheckCircle size={18} className={styles.checkIcon} />
              <span>{t("hero.features.quality")}</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle size={18} className={styles.checkIcon} />
              <span>{t("hero.features.budget")}</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle size={18} className={styles.checkIcon} />
              <span>{t("hero.features.protected")}</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle size={18} className={styles.checkIcon} />
              <span>{t("hero.features.support")}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              onClick={() => navigate("/join")}
            >
              {t("hero.cta_get_started") || "Get Started"}{" "}
              <ArrowRight size={18} />
            </button>
            <button className={styles.btnSecondary}>
              {t("hero.cta_learn_more") || "Learn More"}
            </button>
          </div>
        </motion.div>

        <motion.div
          className={styles.imageGrid}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.imageWrapper}>
            <img
              className={styles.heroImage}
              src="../../assets/images/photo.png"
              alt="heroImage"
            />

            {/* Floating Stats Card */}
            <motion.div
              className={`${styles.floatingStats} ${styles.stat1}`}
              animate={{ y: [0, 15, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <div className={styles.statIcon}>
                <Users size={20} />
              </div>
              <div className={styles.statContent}>
                <h4>4k+</h4>
                <p>{t("hero.stats.freelancers")}</p>
              </div>
            </motion.div>

            {/* Verified Badge */}
            <motion.div
              className={styles.verifiedBadge}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className={styles.check}>✓</div>
              <span>{t("hero.stats.verified")}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Logo Footer integrated at bottom of container */}
        <div className={styles.heroFooter}>
          <div className={styles.logoGrid}>
            {[
              {
                name: "VISA",
                url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
              },
              {
                name: "PayPal",
                url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
              },
              {
                name: "Apple Pay",
                url: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg",
              },
              {
                name: "Stripe",
                url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
              },
            ].map((logo, index) => (
              <div key={index} className={styles.logoWrapper}>
                <img src={logo.url} alt={logo.name} className={styles.logo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
