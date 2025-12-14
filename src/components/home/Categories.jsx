import React from "react";
import { useTranslation } from "react-i18next";
import {
  Droplets,
  Zap,
  Camera,
  Sparkles,
  Hammer,
  Home,
  HardHat,
  Car,
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Categories.module.css";

const Categories = () => {
  const { t } = useTranslation();

  const categories = [
    { id: "plumbing", icon: <Droplets size={40} /> },
    { id: "electrical", icon: <Zap size={40} /> },
    { id: "photography", icon: <Camera size={40} /> },
    { id: "cleaning", icon: <Sparkles size={40} /> },
    { id: "carpentry", icon: <Hammer size={40} /> },
    { id: "interior_design", icon: <Home size={40} /> },
    { id: "contracting", icon: <HardHat size={40} /> },
    { id: "car_services", icon: <Car size={40} /> },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className={styles.section} id="services">
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={styles.title}>{t("categories.title")}</h2>
        <p className={styles.subtitle}>{t("categories.subtitle")}</p>
      </motion.div>

      <motion.div
        className={styles.grid}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {categories.map((cat) => (
          <motion.div key={cat.id} className={styles.card} variants={item}>
            <div className={styles.icon}>{cat.icon}</div>
            <h3 className={styles.cardTitle}>
              {t(`categories.items.${cat.id}`)}
            </h3>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Categories;
