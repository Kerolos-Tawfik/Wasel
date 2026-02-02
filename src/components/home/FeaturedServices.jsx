import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, Heart, CheckCircle2 } from "lucide-react";
import styles from "./FeaturedServices.module.css";

const FeaturedServices = () => {
  const { t } = useTranslation();

  const services = [
    {
      id: 1,
      category: "Prog",
      author: "Alex Moore",
      authorImage: "https://i.pravatar.cc/150?u=alex",
      title: t("featured.services.s1.title"),
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
      location: t("featured.services.s1.location"),
      price: 250,
      rating: 0,
      verified: true,
    },
    {
      id: 2,
      category: "AI",
      author: "Yuki Tanaka",
      authorImage: "https://i.pravatar.cc/150?u=yuki",
      title: t("featured.services.s2.title"),
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600",
      location: t("featured.services.s2.location"),
      price: 1200,
      rating: 0,
      verified: true,
    },
    {
      id: 3,
      category: "AI",
      author: "Sara Miller",
      authorImage: "https://i.pravatar.cc/150?u=sara",
      title: t("featured.services.s3.title"),
      image:
        "https://images.unsplash.com/photo-1531746790731-6c087fdecce3?auto=format&fit=crop&q=80&w=600",
      location: t("featured.services.s3.location"),
      price: 1000,
      rating: 0,
      verified: true,
    },
    {
      id: 4,
      category: "Design",
      author: "Ava Anderson",
      authorImage: "https://i.pravatar.cc/150?u=ava",
      title: t("featured.services.s4.title"),
      image:
        "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=600",
      location: t("featured.services.s4.location"),
      price: 450,
      rating: 0,
      verified: true,
    },
    {
      id: 5,
      category: "Marketing",
      author: "Lisa Johnson",
      authorImage: "https://i.pravatar.cc/150?u=lisa",
      title: t("featured.services.s5.title"),
      image:
        "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c1d8?auto=format&fit=crop&q=80&w=600",
      location: t("featured.services.s5.location"),
      price: 150,
      rating: 0,
      verified: true,
    },
    {
      id: 6,
      category: "Prog",
      author: "Jane Doe",
      authorImage: "https://i.pravatar.cc/150?u=jane",
      title: t("featured.services.s6.title"),
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
      location: t("featured.services.s6.location"),
      price: 300,
      rating: 0,
      verified: true,
    },
  ];

  return (
    <section className={styles.section} id="featured-services">
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className={styles.tagline}>{t("featured.tagline")}</span>
          <h2 className={styles.title}>{t("featured.title")}</h2>
          <p className={styles.subtitle}>{t("featured.subtitle")}</p>
        </motion.div>

        <motion.div className={styles.grid} layout>
          <AnimatePresence mode="popLayout">
            {services.map((service) => (
              <motion.div
                key={service.id}
                className={styles.card}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.imageOverlay}>
                  <img
                    src={service.image}
                    alt={service.title}
                    className={styles.serviceImage}
                  />
                  <button className={styles.heartBtn}>
                    <Heart size={18} />
                  </button>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.authorInfo}>
                    <img
                      src={service.authorImage}
                      alt={service.author}
                      className={styles.authorAvatar}
                    />
                    <span className={styles.authorName}>
                      {service.author}
                      {service.verified && (
                        <CheckCircle2 size={14} className={styles.verified} />
                      )}
                    </span>
                  </div>

                  <h3 className={styles.serviceTitle}>{service.title}</h3>

                  <div className={styles.ratingRow}>
                    <div className={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < service.rating ? "currentColor" : "none"}
                          className={
                            i < service.rating ? styles.starFilled : ""
                          }
                        />
                      ))}
                    </div>
                    <span className={styles.ratingText}>
                      {service.rating.toFixed(1)}/5.0{" "}
                      {t("featured.user_review")}
                    </span>
                  </div>

                  <div className={styles.location}>
                    <MapPin size={14} />
                    <span>{service.location}</span>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.priceLabel}>
                      {t("featured.starting_from")}
                    </span>
                    <span className={styles.priceValue}>
                      ${service.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedServices;
