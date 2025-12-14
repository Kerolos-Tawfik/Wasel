import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Lock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Features.module.css";

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <ShieldCheck size={40} />,
      title: t("offer.items.verified.title"),
      desc: t("offer.items.verified.desc"),
    },
    {
      icon: <Lock size={40} />,
      title: t("offer.items.secure.title"),
      desc: t("offer.items.secure.desc"),
    },
    {
      icon: <Zap size={40} />,
      title: t("offer.items.fast.title"),
      desc: t("offer.items.fast.desc"),
    },
  ];

  return (
    <section className={styles.section} id="why-choose-us">
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={styles.title}>{t("offer.title")}</h2>
        <p className={styles.subtitle}>{t("offer.subtitle")}</p>
      </motion.div>

      <div className={styles.grid}>
        {features.map((item, index) => (
          <motion.div
            key={index}
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className={styles.iconWrapper}>{item.icon}</div>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDesc}>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
