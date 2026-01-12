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

  const [targetWorkRequestId, setTargetWorkRequestId] = useState(null);
  const [targetNotificationId, setTargetNotificationId] = useState(null);
  const [targetNotificationType, setTargetNotificationType] = useState(null);

  useEffect(() => {
    if (location.state?.workRequestId) {
      setTargetWorkRequestId(location.state.workRequestId);
      setTargetNotificationId(location.state.notificationId);
      setTargetNotificationType(location.state.notificationType);

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (!loading && requests.length > 0 && targetWorkRequestId) {
      const work = requests.find(
        (r) => String(r.id) === String(targetWorkRequestId)
      );
      if (work) {
        if (
          targetNotificationType === "status_pending" &&
          !work.pending_status
        ) {
        }

        setSelectedWork(work);
        setIsModalOpen(true);
      }
    }
  }, [loading, requests, targetWorkRequestId, targetNotificationType]);

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
                    {request.service_type === "local" && (
                      <div className={styles.metaItem}>
                        <MapPin size={16} />
                        <span>
                          {t(`cities.${request.city}`) ||
                            request.city ||
                            t("findWork.city_not_specified")}
                        </span>
                      </div>
                    )}
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
              setTargetWorkRequestId(null); // Clear target so it doesn't reopen
              fetchMyRequests();
            }}
            currentUser={user}
            notificationId={targetNotificationId}
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

const DetailModal = ({
  work,
  onUpdate,
  onClose,
  currentUser,
  notificationId,
}) => {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(work.status);

  // Client only REQUESTS status change (no confirm/reject)
  const handleStatusChangeRequest = async (newStatus) => {
    setIsUpdating(true);
    try {
      const response = await workStatusAPI.updateStatus(work.id, {
        status: newStatus,
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentStatus(data.work_request.status); 
        toast.info(
          t("findWork.status_request_sent") || "Status change requested",
          toastConfig
        );
        onUpdate();
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update status", toastConfig);
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
          {/* Project Info */}
          <div className={styles.projectInfo}>
            <div className={styles.infoRow}>
              <strong>{t("findWork.modal.description")}: </strong>
              <p>{work.work_description}</p>
            </div>
            {work.service_type === "local" && (
              <div className={styles.infoRow}>
                <MapPin size={16} />
                <span>
                  {t(`cities.${work.city}`) ||
                    work.city ||
                    t("findWork.city_not_specified")}
                </span>
              </div>
            )}
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

            {/* If pending status exists, Client sees 'Waiting for confirmation' */}
            {work.pending_status && (
              <div className={styles.waitingNotice}>
                <p>
                  {t("findWork.waiting_confirmation", {
                    status: t(`findWork.status.${work.pending_status}`),
                  }) ||
                    `Waiting for provider to confirm change to ${work.pending_status}.`}
                </p>
              </div>
            )}

            {/* Dropdown - Disabled if pending status exists or no provider assigned */}
            <select
              value={work.pending_status || currentStatus}
              onChange={(e) => handleStatusChangeRequest(e.target.value)}
              disabled={
                isUpdating ||
                work.pending_status || // Block if pending
                !work.provider_id // Block if no provider assigned (unless status is 'new' and we want to allow, but keep strict for now)
              }
              title={
                !work.provider_id
                  ? t("findWork.assign_provider_first") ||
                    "Please assign a provider first"
                  : work.pending_status
                  ? "Waiting for confirmation"
                  : ""
              }
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
