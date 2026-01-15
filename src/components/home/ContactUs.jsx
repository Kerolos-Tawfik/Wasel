import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { toastConfig } from "../../lib/toastConfig";
import styles from "./ContactUs.module.css";

const ContactUs = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://waselp.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("contact.success") || "Message sent!", toastConfig);
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error(
          data.message || t("contact.error") || "Failed to send",
          toastConfig
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(t("contact.error"), toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.type === "email" ? "email" : e.target.name || "message"]:
        e.target.value,
    });
  };

  // Explicit handle change helper slightly safer for textarea vs input
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className={styles.section} id="contact">
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.title}>
            {t("contact.title") || "Get in Touch"}
          </h2>
          <p className={styles.subtitle}>
            {t("contact.subtitle") ||
              "Have questions? We'd love to hear from you."}
          </p>
        </motion.div>

        <div className={styles.content}>
          <motion.div
            className={styles.infoCard}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <Mail size={24} />
              </div>
              <div className={styles.infoContent}>
                <h3>{t("contact.email") || "Email Us"}</h3>
                <p>support@wasel.com</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <Phone size={24} />
              </div>
              <div className={styles.infoContent}>
                <h3>{t("contact.phone") || "Call Us"}</h3>
                <p dir="ltr">+966 50 000 0000</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <MapPin size={24} />
              </div>
              <div className={styles.infoContent}>
                <h3>{t("contact.address") || "Visit Us"}</h3>
                <p>Riyadh, Saudi Arabia</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={styles.formCard}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t("contact.name") || "Your Name"}
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder={t("contact.name_placeholder") || "John Doe"}
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t("contact.email_label") || "Email Address"}
                </label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t("contact.message") || "Message"}
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder={
                    t("contact.message_placeholder") || "How can we help you?"
                  }
                  value={formData.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    {t("common.loading") || "Loading..."}{" "}
                    <Loader2 className="animate-spin" size={18} />
                  </>
                ) : (
                  <>
                    {t("contact.send") || "Send Message"} <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
