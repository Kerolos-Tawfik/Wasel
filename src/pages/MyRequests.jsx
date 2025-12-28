import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  MapPin,
  Settings2,
  LoaderCircle,
} from "lucide-react";
import { workStatusAPI, workRequestAPI } from "../lib/apiService";
import { toast } from "react-toastify";
import { toastConfig } from "../lib/toastConfig";
import ModalPortal from "../components/common/ModalPortal";
import ClientsCard from "../components/findwork/ClientsCard";
import ReviewModal from "../components/reviews/ReviewModal";
import styles from "./MyRequests.module.css";

const MyRequests = ({ user }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [revieweeId, setRevieweeId] = useState(null);

  const initialWorkRequestId = location.state?.workRequestId;
  const notificationType = location.state?.notificationType;

  useEffect(() => {
    if (!loading && requests.length > 0 && initialWorkRequestId) {
      const workId = initialWorkRequestId;
      const work = requests.find((r) => String(r.id) === String(workId));
      if (work) {
        // If it's a pending status notification, only open if there IS a pending status
        if (notificationType === "status_pending" && !work.pending_status) {
          return;
        }

        setSelectedWork(work);
        setIsModalOpen(true);
        // Clear state to prevent modal from reopening on every refresh/interaction
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [
    loading,
    requests,
    initialWorkRequestId,
    navigate,
    location.pathname,
    notificationType,
  ]);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await workRequestAPI.getMyRequests();
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
      } else {
        toast.error(data.message || "Failed to fetch requests", toastConfig);
      }
    } catch (error) {
      console.error("Error fetching my requests:", error);
      toast.error(
        "An error occurred while fetching your requests",
        toastConfig
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <LoaderCircle size={40} className="animate-spin" />
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className={styles.myRequestsPage}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <Briefcase className={styles.titleIcon} size={32} />
          {t("findWork.filters.my_requests") || "My Requests"}
        </h1>

        {requests.length === 0 ? (
          <div className={styles.empty}>
            <Briefcase size={64} opacity={0.2} />
            <h2>{t("findWork.no_requests")}</h2>
            <p>{t("findWork.add_request_prompt")}</p>
          </div>
        ) : (
          <div className={styles.requestsGrid}>
            {requests.map((request) => (
              <div key={request.id} className={styles.requestCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.workTitle}>{request.work_title}</h3>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status-${request.status}`]
                    }`}
                  >
                    {t(`findWork.status.${request.status}`) || request.status}
                  </span>
                </div>

                <p className={styles.cardBody}>
                  {request.work_description.length > 200
                    ? request.work_description.substring(0, 200) + "..."
                    : request.work_description}
                </p>

                <div className={styles.cardFooter}>
                  <div className={styles.metaInfo}>
                    <div className={styles.metaItem}>
                      <MapPin size={16} />
                      <span>
                        {t(`cities.${request.city}`) ||
                          request.city ||
                          t("findWork.city_not_specified")}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <Calendar size={16} />
                      <span>
                        {request.expected_date ||
                          t("findWork.date_not_specified")}
                      </span>
                    </div>
                    {request.budget_max && (
                      <div className={styles.metaItem}>
                        <span>
                          {request.budget_min ? `${request.budget_min} - ` : ""}
                          {request.budget_max}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.manageBtn}
                      onClick={() => {
                        setSelectedWork(request);
                        setIsModalOpen(true);
                      }}
                    >
                      <Settings2 size={16} />
                      {t("findWork.modal.manage") || "Manage"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reuse ClientsCard's modal logic for detailed view and status management */}
      {isModalOpen && selectedWork && (
        <ModalPortal>
          <DetailModal
            work={selectedWork}
            onUpdate={() => {
              fetchMyRequests();
            }}
            onClose={() => {
              setIsModalOpen(false);
              fetchMyRequests();
            }}
            currentUser={user}
          />
        </ModalPortal>
      )}

      {showReviewModal && selectedWork && (
        <ModalPortal>
          <ReviewModal
            workRequestId={selectedWork.id}
            revieweeId={revieweeId}
            onClose={() => setShowReviewModal(false)}
            onReviewSubmitted={() => {
              fetchMyRequests();
            }}
          />
        </ModalPortal>
      )}
    </div>
  );
};

// Internal component to handle the detailed view and status update
// We'll extract this from ClientsCard or just use a simplified version here
const DetailModal = ({ work, onUpdate, onClose, currentUser }) => {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(work.status);

  const handleStatusChange = async (
    newStatus,
    confirm = false,
    reject = false
  ) => {
    setIsUpdating(true);
    try {
      const response = await workStatusAPI.updateStatus(work.id, {
        status: newStatus,
        confirm: confirm,
        reject: reject,
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentStatus(data.work_request.status);
        toast.success(
          confirm
            ? t("findWork.status_confirmed")
            : reject
            ? t("findWork.status_rejected") || "Status change rejected"
            : t("findWork.status_request_sent"),
          toastConfig
        );
        onUpdate(); // refresh parent
        onClose(); // Auto close modal
      } else {
        toast.error(
          t("findWork.status_error") || "Failed to update status",
          toastConfig
        );
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Error updating status", toastConfig);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{work.work_title}</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {work.pending_status &&
            work.pending_status_changed_by !== currentUser?.id && (
              <div className={styles.pendingNotice}>
                <p>
                  {t("findWork.pending_status_notice", {
                    status: t(`findWork.status.${work.pending_status}`),
                  }) ||
                    `The other party requested to change status to ${work.pending_status}.`}
                </p>
                <div className={styles.pendingActions}>
                  <button
                    onClick={() =>
                      handleStatusChange(work.pending_status, true)
                    }
                    className={styles.confirmBtn}
                  >
                    {t("common.confirm") || "Confirm"}
                  </button>
                  <button
                    onClick={() => handleStatusChange(work.status, false, true)}
                    className={styles.rejectBtn}
                  >
                    {t("common.reject") || "Reject"}
                  </button>
                </div>
              </div>
            )}
          <div className={styles.projectInfo}>
            <div className={styles.infoRow}>
              <strong>{t("findWork.modal.description")}: </strong>
              <p>{work.work_description}</p>
            </div>
            <div className={styles.infoRow}>
              <MapPin size={16} />
              <span>
                {t(`cities.${work.city}`) ||
                  work.city ||
                  t("findWork.city_not_specified")}
              </span>
            </div>
            <div className={styles.infoRow}>
              <Calendar size={16} />
              <span>
                {work.expected_date || t("findWork.date_not_specified")}
              </span>
            </div>
            {work.budget_max && (
              <div className={styles.infoRow}>
                <strong>{t("findWork.modal.budget")}: </strong>
                <span>
                  {work.budget_min ? `${work.budget_min} - ` : ""}
                  {work.budget_max}
                </span>
              </div>
            )}
            {work.duration && (
              <div className={styles.infoRow}>
                <strong>{t("findWork.modal.duration")}: </strong>
                <span>{work.duration}</span>
              </div>
            )}
          </div>

          <div className={styles.statusSection}>
            <h3>{t("findWork.modal.update_status") || "Update Status"}</h3>

            {work.pending_status &&
              work.pending_status_changed_by === currentUser?.id && (
                <div className={styles.waitingNotice}>
                  <p>
                    {t("findWork.waiting_confirmation", {
                      status: t(`findWork.status.${work.pending_status}`),
                    }) ||
                      `Waiting for the other party to confirm status change to ${work.pending_status}.`}
                  </p>
                </div>
              )}

            <select
              value={work.pending_status || currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className={`${styles.statusSelect} ${
                work.pending_status ? styles.hasPending : ""
              }`}
            >
              <option value="new">{t("findWork.status.new")}</option>
              <option value="in_progress">
                {t("findWork.status.in_progress")}
              </option>
              <option value="pending_payment">
                {t("findWork.status.pending_payment")}
              </option>
              <option value="completed">
                {t("findWork.status.completed")}
              </option>
              <option value="delayed">{t("findWork.status.delayed")}</option>
            </select>
          </div>

          {currentStatus === "completed" && (
            <div className={styles.reviewPrompt}>
              <p>
                {t("reviews.can_rate_now") ||
                  "Project completed! You can now rate the service provider."}
              </p>
              <button
                className={styles.rateBtn}
                onClick={() => {
                  // In a real app, we'd need to know who the provider is.
                  // For now, let's assume we have a way to get the revieweeId (e.g. from the task assignment)
                  // We'll look for the last 'engaged' person in chat or similar if not explicitly assigned.
                  toast.info("Select a provider to rate");
                }}
              >
                {t("reviews.rate_now") || "Rate Now"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import { X } from "lucide-react";

export default MyRequests;
