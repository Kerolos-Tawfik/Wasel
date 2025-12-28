import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Star, LoaderCircle } from "lucide-react";
import { reviewAPI } from "../../lib/apiService";
import { toast } from "react-toastify";
import { toastConfig } from "../../lib/toastConfig";
import styles from "./ReviewModal.module.css";

const ReviewModal = ({
  workRequestId,
  revieweeId,
  initialReview = null,
  onClose,
  onReviewSubmitted,
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning("Please select a rating", toastConfig);
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (initialReview) {
        response = await reviewAPI.updateReview(initialReview.id, {
          rating,
          comment,
        });
      } else {
        response = await reviewAPI.submitReview({
          work_request_id: workRequestId,
          reviewee_id: revieweeId,
          rating,
          comment,
        });
      }

      if (response.ok) {
        toast.success(
          initialReview
            ? t("reviews.rating_saved")
            : "Review submitted successfully",
          toastConfig
        );
        if (onReviewSubmitted) onReviewSubmitted();
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to submit review", toastConfig);
      }
    } catch (error) {
      console.error("Review operation error:", error);
      toast.error("An error occurred", toastConfig);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className={styles.title}>
          {initialReview
            ? t("reviews.edit_review")
            : t("reviews.rate_provider")}
        </h2>
        <p className={styles.subtitle}>
          {initialReview ? "" : t("reviews.rate_subtitle")}
        </p>

        <div className={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={styles.starBtn}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                size={36}
                className={`${styles.starIcon} ${
                  (hoverRating || rating) >= star ? styles.starActive : ""
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          className={styles.textarea}
          placeholder={t("reviews.comment_placeholder")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <LoaderCircle className="animate-spin" size={20} />
          ) : (
            t("reviews.submit")
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;
