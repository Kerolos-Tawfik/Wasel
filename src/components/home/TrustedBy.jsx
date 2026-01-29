import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import styles from "./TrustedBy.module.css";

const TrustedBy = () => {
  const { t } = useTranslation();

  const logos = [
    {
      name: "Partner 1",
      url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    },
    {
      name: "Partner 2",
      url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    },
    {
      name: "Partner 3",
      url: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    },
    {
      name: "Partner 4",
      url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    },
    {
      name: "Partner 5",
      url: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.label}>
            {t("trusted.label") || "Trusted by over 500+ companies worldwide:"}
          </span>
          <div className={styles.logoGrid}>
            <div className={styles.logoTrack}>
              {logos.concat(logos).map((logo, index) => (
                <div key={index} className={styles.logoWrapper}>
                  <img src={logo.url} alt={logo.name} className={styles.logo} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;
