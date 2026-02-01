import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./AdminDashboard.module.css";
import { adminAPI } from "../../lib/adminApiService";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = React.useState({
    total_users: "--",
    pending_requests: "--",
    active_providers: "--", // This is actually providers count based on controller
    completed_requests: "--",
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats();
        if (response.ok) {
          const data = await response.json();
          setStats({
            total_users: data.total_users,
            total_published_requests: data.total_published_requests,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.gridContainer}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>{t("admin.dashboard.total_users")}</h3>
        <p className={styles.cardValue}>{stats.total_users}</p>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          {t("admin.dashboard.total_published_requests") ||
            "Published Requests"}
        </h3>
        <p className={styles.cardValue}>
          {
            stats.total_published_requests ||
              stats.active_providers /* fallback just in case data key differs, but controller sends total_published_requests */
          }
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
