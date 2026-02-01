import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styles from "./Categories.module.css";
import { apiFetch } from "../../lib/apiService";

const defaultImages = [
  // Tech & Office
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600", // Coding
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600", // Writing
  // Creative
  "https://images.unsplash.com/photo-1626785774573-4b799314346d?auto=format&fit=crop&q=80&w=600", // Graphic Design
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600", // Camera
  // Trades & Manual
  "https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&q=80&w=600", // Repair/Plumbing
  "https://images.unsplash.com/photo-1621905476059-5f3360e755a2?auto=format&fit=crop&q=80&w=600", // Electrical
  "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=600", // Carpentry
  // Home Services
  "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=600", // Cleaning
  "https://images.unsplash.com/photo-1632823471565-1ec2a1ad4015?auto=format&fit=crop&q=80&w=600", // Painting/Decor
  // General/Business
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600", // Consulting/Business
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=600", // Meeting
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=600", // Teamwork
];

const Categories = () => {
  const { t, i18n } = useTranslation();
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiFetch("/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCardClick = () => {
    navigate("/login");
  };

  return (
    <section className={styles.section} id="services">
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="sub-tag">{t("categories.sub_tag")}</div>
          <h2 className={styles.title}>{t("categories.title")}</h2>
          <p className={styles.subtitle}>{t("categories.subtitle")}</p>
        </motion.div>

        <div className={styles.carouselWrapper}>
          <motion.div
            className={styles.carousel}
            ref={carouselRef}
            drag="x"
            dragConstraints={
              isRTL ? { right: 2000, left: 0 } : { right: 0, left: -2000 }
            }
            whileTap={{ cursor: "grabbing" }}
          >
            {loading ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  width: "100%",
                  color: "#64748b",
                }}
              >
                {t("common.loading")}
              </div>
            ) : (
              categories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  className={styles.card}
                  whileHover={{ y: -10 }}
                >
                  <div
                    className={styles.cardImage}
                    style={{
                      backgroundImage: `url(${cat.icon || defaultImages[index % defaultImages.length]})`,
                    }}
                  />
                  <div className={styles.imageOverlay} />

                  {/* Optional: Show count if available */}
                  {/* <div className={styles.countBadge}>
                  {cat.work_requests_count || 0} {t("categories.listings_label")}
                </div> */}

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>
                      {isRTL ? cat.name_ar : cat.name_en}
                    </h3>
                    <p
                      className={styles.cardLink}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick();
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {t("categories.view_all")} <ArrowRight size={16} />
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
