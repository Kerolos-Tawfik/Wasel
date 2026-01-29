import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Lock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Features.module.css";

const Features = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      title: t("offer.items.verified.title"),
      desc: t("offer.items.verified.desc"),
      icon: <ShieldCheck size={32} />,
    },
    {
      number: "02",
      title: t("offer.items.secure.title"),
      desc: t("offer.items.secure.desc"),
      icon: <Lock size={32} />,
    },
    {
      number: "03",
      title: t("offer.items.fast.title"),
      desc: t("offer.items.fast.desc"),
      icon: <Zap size={32} />,
    },
  ];

  return (
    <section className={styles.section} id="why-choose-us">
      {/* Background decoration */}
      <div className={styles.bgDecoration}></div>

      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="sub-tag">{t("offer.sub_tag")}</div>
        <h2 className={styles.title}>{t("offer.title")}</h2>
        <p className={styles.subtitle}>{t("offer.subtitle")}</p>
      </motion.div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {steps.map((item, index) => (
            <motion.div
              key={index}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className={styles.stepNumber}>{item.number}</div>
              <div className={styles.iconWrapper}>{item.icon}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>

              {index < steps.length - 1 && (
                <div className={styles.connector}>
                  <svg width="100" height="20" viewBox="0 0 100 20" fill="none">
                    <path
                      d="M0 10C30 10 70 10 100 10"
                      stroke="var(--primary-color)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.3"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
