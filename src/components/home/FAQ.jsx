import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import styles from "./FAQ.module.css";

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(null);
  const isRTL = i18n.language === "ar";

  const faqs = [
    { id: 1, question: t("faq.q1"), answer: t("faq.a1") },
    { id: 2, question: t("faq.q2"), answer: t("faq.a2") },
    { id: 3, question: t("faq.q3"), answer: t("faq.a3") },
    { id: 4, question: t("faq.q4"), answer: t("faq.a4") },
    { id: 5, question: t("faq.q5"), answer: t("faq.a5") },
  ];

  return (
    <section className={styles.section} id="faq">
      <div className={styles.container}>
        <div className={styles.sideContent}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.tagline}>
              {t("faq.sub_tag") || "Talk to support"}
            </span>
            <h2 className={styles.title}>
              {t("faq.title") || "Frequently asked questions"}
            </h2>
            <p className={styles.subtitle}>
              {t("faq.subtitle") ||
                "Find answers to your questions instantly. Need more guidance? Dive into our extensive documentation for all your queries."}
            </p>
            <button className={styles.contactBtn}>
              {t("faq.contact_cta") || "Contact Our Team"}
            </button>
          </motion.div>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              className={`${styles.faqItem} ${activeIndex === index ? styles.active : ""}`}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                className={styles.question}
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
              >
                <span>{faq.question}</span>
                <div className={styles.iconWrapper}>
                  {activeIndex === index ? (
                    <Minus size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    className={styles.answerWrapper}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.answer}>{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
