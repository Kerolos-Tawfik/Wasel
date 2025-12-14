import { useTranslation } from "react-i18next";
import { Star, TrendingUp } from "lucide-react";
import styles from "./ProfileRating.module.css";

const ProfileRating = ({ profile }) => {
  const { t } = useTranslation();

  const rating = profile?.rating || 0;
  const totalReviews = profile?.total_reviews || 0;
  const completedJobs = profile?.completed_jobs || 0;

  // Generate stars
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={20}
          className={
            i <= Math.floor(rating) ? styles.starFilled : styles.starEmpty
          }
          fill={i <= Math.floor(rating) ? "#f59e0b" : "none"}
        />
      );
    }
    return stars;
  };

  return (
    <section className={styles.ratingSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Star size={20} />
          <h2>{t("profile.rating_title")}</h2>
        </div>
      </div>

      <div className={styles.ratingContent}>
        {/* Main Rating */}
        <div className={styles.mainRating}>
          <span className={styles.ratingNumber}>{rating.toFixed(1)}</span>
          <div className={styles.starsContainer}>{renderStars()}</div>
          <span className={styles.reviewCount}>
            {totalReviews} {t("profile.reviews")}
          </span>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <TrendingUp size={18} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{completedJobs}</span>
              <span className={styles.statLabel}>
                {t("profile.completed_jobs")}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Bars */}
        <div className={styles.ratingBars}>
          <div className={styles.ratingBar}>
            <span className={styles.barLabel}>5</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${totalReviews > 0 ? 70 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.ratingBar}>
            <span className={styles.barLabel}>4</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${totalReviews > 0 ? 20 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.ratingBar}>
            <span className={styles.barLabel}>3</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${totalReviews > 0 ? 5 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.ratingBar}>
            <span className={styles.barLabel}>2</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${totalReviews > 0 ? 3 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.ratingBar}>
            <span className={styles.barLabel}>1</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${totalReviews > 0 ? 2 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileRating;
