import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star, TrendingUp, User } from "lucide-react";
import { reviewAPI } from "../../lib/apiService";
import styles from "./ProfileRating.module.css";

const ProfileRating = ({ profile, user }) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchReviews = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const response = await reviewAPI.getUserReviews(profile.id);
      if (response.ok) {
        const data = await response.json();
        setReviews(data || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [profile?.id]);

  const rating =
    reviews.length > 0
      ? reviews.reduce((acc, rev) => acc + Number(rev.rating), 0) /
        reviews.length
      : 0;
  const totalReviews = reviews.length;
  const completedJobs = profile?.completed_jobs || 0;

  const renderStars = (val, size = 20) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={size}
          className={
            i <= Math.floor(val) ? styles.starFilled : styles.starEmpty
          }
          fill={i <= Math.floor(val) ? "#f59e0b" : "none"}
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
        <div className={styles.mainRating}>
          <span className={styles.ratingNumber}>{rating.toFixed(1)}</span>
          <div className={styles.starsContainer}>{renderStars(rating)}</div>
          <span className={styles.reviewCount}>
            {totalReviews} {t("profile.reviews")}
          </span>
        </div>

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

        {/* Reviews List */}
        <div className={styles.reviewsList}>
          <h3>{t("profile.recent_reviews") || "Recent Reviews"}</h3>
          {loading ? (
            <p className={styles.noReviews}>Loading...</p>
          ) : reviews.length === 0 ? (
            <p className={styles.noReviews}>
              {t("profile.no_reviews") || "No reviews yet"}
            </p>
          ) : (
            reviews.slice(0, 3).map((review) => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerAvatar}>
                    <User size={14} />
                  </div>
                  <div className={styles.reviewerMeta}>
                    <div className={styles.reviewerTop}>
                      <span className={styles.reviewerName}>
                        {review.reviewer?.full_name || "User"}
                      </span>
                      {Number(review.reviewer_id) === Number(user?.id) && (
                        <button
                          className={styles.editReviewBtn}
                          onClick={() => {
                            setSelectedReview(review);
                            setShowEditModal(true);
                          }}
                        >
                          {t("common.edit")}
                        </button>
                      )}
                    </div>
                    <div className={styles.reviewStars}>
                      {renderStars(review.rating, 14)}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className={styles.reviewComment}>"{review.comment}"</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showEditModal && selectedReview && (
        <ReviewModal
          initialReview={selectedReview}
          onClose={() => {
            setShowEditModal(false);
            setSelectedReview(null);
          }}
          onReviewSubmitted={() => {
            fetchReviews();
          }}
        />
      )}
    </section>
  );
};

import ReviewModal from "../reviews/ReviewModal";

export default ProfileRating;
