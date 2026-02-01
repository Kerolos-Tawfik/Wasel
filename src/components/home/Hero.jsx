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
  const { t } = useTranslation();
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
            <span className={styles.decorative}>
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

          <div className={styles.trustSignals}>
            <div className={styles.avatars}>
              <img src="https://i.pravatar.cc/40?u=1" alt="user" />
              <img src="https://i.pravatar.cc/40?u=2" alt="user" />
              <img src="https://i.pravatar.cc/40?u=3" alt="user" />
              <div className={styles.avatarMore}>+12k</div>
            </div>
            <p>
              {t("hero.trust_text") || "Joined by 12,000+ experts and clients"}
            </p>
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
      </div>
    </section>
  );
};

export default Hero;
