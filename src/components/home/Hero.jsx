import { useTranslation } from "react-i18next";
import { Search, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./hero.module.css";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className={styles.hero} id="home">
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className={styles.title}>{t("hero.title")}</h1>
        <p className={styles.subtitle}>{t("hero.subtitle")}</p>

        <div className={styles.features}>
          <div className={styles.featureItem}>
            <CheckCircle size={20} className={styles.checkIcon} />
            <span>{t("hero.features.quality")}</span>
          </div>
          <div className={styles.featureItem}>
            <CheckCircle size={20} className={styles.checkIcon} />
            <span>{t("hero.features.budget")}</span>
          </div>
          <div className={styles.featureItem}>
            <CheckCircle size={20} className={styles.checkIcon} />
            <span>{t("hero.features.protected")}</span>
          </div>
          <div className={styles.featureItem}>
            <CheckCircle size={20} className={styles.checkIcon} />
            <span>{t("hero.features.support")}</span>
          </div>
        </div>
      </motion.div>
      <motion.div
        className={styles.imageGrid}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img
          className={styles.heroImage}
          src="../../assets/images/photo.png"
          alt="heroImage"
        />
      </motion.div>
    </section>
  );
};

export default Hero;
