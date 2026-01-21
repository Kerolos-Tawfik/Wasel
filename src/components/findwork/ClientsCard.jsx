import { useState, useEffect } from "react";

import {
  User,
  Timer,
  NotebookPen,
  Earth,
  Phone,
  Calendar,
  ArrowRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  MapPin,
} from "lucide-react";
import styles from "./ClientsCard.module.css";
import { useTranslation } from "react-i18next";
import ChatWindow from "../chat/ChatWindow";
import { workStatusAPI } from "../../lib/apiService";
import { toast } from "react-toastify";
import ModalPortal from "../common/ModalPortal";

const ITEMS_PER_PAGE = 4;

function ClientsCard({
  savedData,
  service,
  selectedCategory,
  selectedCity,
  searchQuery = "",
  currentUser,
  showMyRequestsOnly,
  initialWorkRequestId,
  notificationType,
  notificationId,
}) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWork, setSelectedWork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchSpecificWork = async () => {
      if (initialWorkRequestId) {
        try {
          // Always fetch fresh data to ensure status is up to date (handling notifications)
          const { workRequestAPI } = await import("../../lib/apiService");
          const response =
            await workRequestAPI.getWorkRequestById(initialWorkRequestId);
          if (response.ok) {
            const data = await response.json();
            const work = data.work_request;

            // If it's a pending status notification, only open if there IS a pending status
            if (notificationType === "status_pending" && !work.pending_status) {
              return;
            }
            setSelectedWork(work);
            setIsModalOpen(true);
          } else {
            // Fallback to searching savedData if fetch fails? Or just log error.
            console.error("Failed to fetch fresh work request");
          }
        } catch (error) {
          console.error("Error fetching specific work request", error);
        }
      }
    };

    fetchSpecificWork();
  }, [initialWorkRequestId, notificationType]);

  // Check if current user is the developer/provider of this work
  const isEngagedProvider = (work) => {
    if (!currentUser || !work) return false;
    if (Number(currentUser.id) === Number(work.user_id)) return false; // Is owner
    // If work has a provider_id and it matches current user
    if (work.provider_id && Number(work.provider_id) === Number(currentUser.id))
      return true;
    // If work has pending_status_changed_by and it's NOT current user,
    // it means the owner or someone else requested it from current user (if they are the provider)
    // Actually, if there is a pending_status and it wasn't changed by me,
    // and I'm the one viewing it (as a provider candidate), I should be able to see it.
    if (
      work.pending_status &&
      work.pending_status_changed_by &&
      Number(work.pending_status_changed_by) !== Number(currentUser.id)
    ) {
      // If I'm already the provider, or if I'm engaged in chat (already handled by modal visibility usually)
      return true;
    }

    if (
      work.pending_status_changed_by &&
      Number(work.pending_status_changed_by) === Number(currentUser.id)
    )
      return true;
    return false;
  };

  const handleViewDetails = (work) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWork(null);
  };

  // Filter data whenever dependencies change
  useEffect(() => {
    let currentFilteredData = savedData.filter((data) => {
      // 1. Filter by Service Type
      const isServiceMatch =
        !service || service === "all" || data.service_type === service;

      // 2. Filter by Category
      const isCategoryMatch =
        !selectedCategory ||
        selectedCategory === "all" ||
        data.category === selectedCategory ||
        (Array.isArray(data.category_ids) &&
          data.category_ids.map(String).includes(String(selectedCategory))) ||
        String(data.category_id) === String(selectedCategory);

      // 3. Filter by City (only if service is local)
      const isCityMatch =
        !selectedCity ||
        selectedCity === "all" ||
        service !== "local" ||
        String(data.city).toLowerCase() === String(selectedCity).toLowerCase();

      // 4. Filter by Search Query (search in title and category name)
      const searchLower = searchQuery?.toLowerCase() || "";

      const isSearchMatch =
        !searchQuery ||
        data.work_title?.toLowerCase().includes(searchLower) ||
        data.work_description?.toLowerCase().includes(searchLower);

      return isServiceMatch && isCategoryMatch && isCityMatch && isSearchMatch;
    });

    // 5. Current User filter (My Requests)
    if (showMyRequestsOnly && currentUser) {
      currentFilteredData = currentFilteredData.filter(
        (item) => item.user_id === currentUser.id,
      );
    }

    setFilteredData(currentFilteredData);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [
    savedData,
    service,
    selectedCategory,
    selectedCity,
    searchQuery,
    showMyRequestsOnly,
    currentUser,
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of results
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={styles.resultsContainer}>
      {/* Results Count */}
      <h4 className={styles.resultsCount}>
        {filteredData.length} {t("findWork.card.results")}
      </h4>

      <div className={styles.cardsGrid}>
        {paginatedData.length > 0 ? (
          paginatedData.map((data, i) => (
            <article key={i} className={styles.card}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.serviceTag}>
                  <Briefcase size={14} />
                  <span>{t(`findWork.filters.${data.service_type}`)}</span>
                </div>
                <span
                  className={`${styles.statusTag} ${
                    styles[`status_${data.status || "new"}`]
                  }`}
                >
                  {t(`findWork.status.${data.status || "new"}`)}
                </span>
              </div>

              {/* Card Title */}
              <h3 className={styles.cardTitle}>{data.work_title}</h3>

              {/* Card Description */}
              <p className={styles.cardDescription}>{data.work_description}</p>

              {/* Card Meta Info */}
              <div className={styles.cardMeta}>
                <div className={styles.metaItem}>
                  <User size={16} />
                  <span>{data.full_name}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className={styles.cardFooter}>
                <button
                  className={styles.viewButton}
                  onClick={() => handleViewDetails(data)}
                >
                  {t("findWork.card.view_details")}
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>{t("findWork.card.no_match")}</h3>
            <p>{t("findWork.card.try_different")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationArrow}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
          </button>

          <div className={styles.paginationNumbers}>
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className={styles.paginationEllipsis}
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`${styles.paginationNumber} ${
                    currentPage === page ? styles.paginationActive : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          <button
            className={styles.paginationArrow}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={20} />
          </button>

          <span className={styles.paginationInfo}>
            {t("findWork.pagination.page")} {currentPage}{" "}
            {t("findWork.pagination.of")} {totalPages}
          </span>
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedWork && (
        <ModalPortal>
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <div className={styles.statusContainer}>
                    <div
                      className={`
                      ${styles.serviceTag} 
                      ${
                        selectedWork.service_type === "freelance"
                          ? styles.freelanceTag
                          : styles.localTag
                      }
                    `}
                    >
                      {selectedWork.service_type === "freelance" ? (
                        <Briefcase size={14} />
                      ) : (
                        <User size={14} />
                      )}
                      <span>
                        {t(`findWork.filters.${selectedWork.service_type}`)}
                      </span>
                    </div>
                    <span
                      className={`${styles.statusTag} ${
                        styles[`status_${selectedWork.status || "new"}`]
                      }`}
                    >
                      {t(`findWork.status.${selectedWork.status || "new"}`)}
                    </span>
                  </div>
                  <h3>{selectedWork.work_title}</h3>
                </div>
                <button onClick={handleCloseModal} className={styles.closeBtn}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalSection}>
                  <h4 className={styles.modalSubtitle}>
                    {t("findWork.modal.description") || "Description"}
                  </h4>
                  <p className={styles.modalText}>
                    {selectedWork.work_description}
                  </p>
                </div>

                <div className={styles.modalGrid}>
                  <div className={styles.modalInfoItem}>
                    <User size={18} />
                    <div>
                      <span className={styles.modalLabel}>
                        {t("findWork.modal.client") || "Client"}
                      </span>
                      <p>{selectedWork.full_name}</p>
                    </div>
                  </div>

                  {selectedWork.city && (
                    <div className={styles.modalInfoItem}>
                      <MapPin size={18} />
                      <div>
                        <span className={styles.modalLabel}>
                          {t("findWork.modal.location") || "Location"}
                        </span>
                        <p>
                          {t(`cities.${selectedWork.city}`) ||
                            selectedWork.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedWork.budget_min !== null && (
                    <div className={styles.modalInfoItem}>
                      <Sparkles size={18} />
                      <div>
                        <span className={styles.modalLabel}>
                          {t("findWork.modal.budget") || "Budget"}
                        </span>
                        <p>
                          {selectedWork.budget_min} - {selectedWork.budget_max}{" "}
                          SR
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedWork.duration && (
                    <div className={styles.modalInfoItem}>
                      <Timer size={18} />
                      <div>
                        <span className={styles.modalLabel}>
                          {t("findWork.modal.duration") || "Duration"}
                        </span>
                        <p>{selectedWork.duration}</p>
                      </div>
                    </div>
                  )}

                  {selectedWork.created_at && (
                    <div className={styles.modalInfoItem}>
                      <Calendar size={18} />
                      <div>
                        <span className={styles.modalLabel}>
                          {t("findWork.modal.posted") || "Posted"}
                        </span>
                        <p>
                          {new Date(
                            selectedWork.created_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.timelineContainer}>
                  <h4 className={styles.timelineTitle}>
                    <Timer size={18} />
                    {t("findWork.modal.status_history") || "Status History"}
                  </h4>
                  <div className={styles.timeline}>
                    {selectedWork.logs && selectedWork.logs.length > 0 ? (
                      selectedWork.logs.map((log, index) => (
                        <div key={index} className={styles.timelineItem}>
                          <div className={styles.timelineDot}></div>
                          <div className={styles.timelineContent}>
                            <div className={styles.timelineMeta}>
                              <span className={styles.timelineUser}>
                                {log.changed_by?.full_name || "System"}
                              </span>
                              <span>
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className={styles.statusChange}>
                              <span
                                className={`${styles.statusTag} ${
                                  styles[`status_${log.old_status}`]
                                }`}
                              >
                                {t(
                                  `findWork.status.${log.old_status || "new"}`,
                                )}
                              </span>
                              <ArrowRight
                                size={14}
                                className={styles.arrowIcon}
                              />
                              <span
                                className={`${styles.statusTag} ${
                                  styles[`status_${log.new_status}`]
                                }`}
                              >
                                {t(`findWork.status.${log.new_status}`)}
                              </span>
                            </div>
                            {log.notes && (
                              <p className={styles.timelineNotes}>
                                {log.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.timelineItem}>
                        <div className={styles.timelineDot}></div>
                        <div className={styles.timelineContent}>
                          <p className={styles.timelineText}>
                            {t("findWork.modal.no_history") ||
                              "No history available yet."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                {currentUser?.id === selectedWork.user_id ? (
                  // OWNER VIEW: Request Status Change
                  <div className={styles.ownerActions}>
                    <label>
                      {t("findWork.modal.update_status") || "Update Status"}
                    </label>

                    {selectedWork.pending_status && (
                      <div className={styles.waitingNotice}>
                        <p>
                          {t("findWork.waiting_confirmation", {
                            status: t(
                              `findWork.status.${selectedWork.pending_status}`,
                            ),
                          })}
                        </p>
                      </div>
                    )}

                    <select
                      className={`${styles.statusSelect} ${
                        selectedWork.pending_status ? styles.hasPending : ""
                      }`}
                      disabled={selectedWork.pending_status} // Block if pending
                      value={
                        selectedWork.pending_status ||
                        selectedWork.status ||
                        "new"
                      }
                      onChange={async (e) => {
                        try {
                          const newStatus = e.target.value;
                          const response = await workStatusAPI.updateStatus(
                            selectedWork.id,
                            {
                              status: newStatus,
                              notes: "Status change requested",
                            },
                          );
                          if (response.ok) {
                            const data = await response.json();
                            setSelectedWork(data.work_request);
                            toast.success(t("findWork.status_request_sent"));
                          } else {
                            const data = await response.json();
                            toast.error(data.message);
                          }
                        } catch (error) {
                          toast.error(
                            t("findWork.status_error") ||
                              "Failed to update status",
                          );
                        }
                      }}
                    >
                      <option value="new">{t("findWork.status.new")}</option>
                      <option value="in_progress">
                        {t("findWork.status.in_progress")}
                      </option>
                      <option value="pending_payment">
                        {t("findWork.status.pending_payment")}
                      </option>
                      <option value="delayed">
                        {t("findWork.status.delayed")}
                      </option>
                      <option value="completed">
                        {t("findWork.status.completed")}
                      </option>
                    </select>
                  </div>
                ) : isEngagedProvider(selectedWork) ||
                  (currentUser &&
                    selectedWork.provider_id &&
                    Number(selectedWork.provider_id) ===
                      Number(currentUser.id)) ? (
                  // PROVIDER VIEW: Confirm/Reject ONLY
                  <div className={styles.ownerActions}>
                    {selectedWork.pending_status ? (
                      <div className={styles.pendingActionsContainer}>
                        <p className={styles.actionPrompt}>
                          {t("findWork.client_requested_status", {
                            status: t(
                              `findWork.status.${selectedWork.pending_status}`,
                            ),
                          }) ||
                            `Client requested to change status to ${selectedWork.pending_status}`}
                        </p>
                        <div className={styles.pendingActions}>
                          <button
                            className={styles.confirmBtn}
                            onClick={async () => {
                              const response = await workStatusAPI.updateStatus(
                                selectedWork.id,
                                {
                                  status: selectedWork.pending_status,
                                  confirm: true,
                                },
                              );
                              if (response.ok) {
                                const data = await response.json();
                                setSelectedWork(data.work_request);
                                toast.success(t("findWork.status_confirmed"));

                                if (notificationId) {
                                  try {
                                    const { notificationAPI } =
                                      await import("../../lib/apiService");
                                    await notificationAPI.markAsRead(
                                      notificationId,
                                    );
                                  } catch (e) {
                                    console.error(
                                      "Failed to mark notification read",
                                      e,
                                    );
                                  }
                                }
                                // Close modal or update UI?
                              }
                            }}
                          >
                            {t("common.confirm")}
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={async () => {
                              const response = await workStatusAPI.updateStatus(
                                selectedWork.id,
                                {
                                  status: selectedWork.status || "new",
                                  reject: true,
                                },
                              );
                              if (response.ok) {
                                const data = await response.json();
                                setSelectedWork(data.work_request);
                                toast.success(
                                  t("findWork.status_rejected") ||
                                    "Status change rejected",
                                );

                                if (notificationId) {
                                  try {
                                    const { notificationAPI } =
                                      await import("../../lib/apiService");
                                    await notificationAPI.markAsRead(
                                      notificationId,
                                    );
                                  } catch (e) {
                                    console.error(
                                      "Failed to mark notification read",
                                      e,
                                    );
                                  }
                                }
                              }
                            }}
                          >
                            {t("common.reject") || "Reject"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.readOnlyStatus}>
                        <span>
                          {t("findWork.current_status")}:{" "}
                          {t(`findWork.status.${selectedWork.status}`)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className={styles.contactBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsChatOpen(true);
                    }}
                  >
                    <Phone size={18} />
                    {t("findWork.modal.contact") || "Contact Client"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {isChatOpen && selectedWork && (
        <ModalPortal>
          <ChatWindow
            workRequestId={selectedWork.id}
            receiverId={selectedWork.user_id}
            otherUser={{
              id: selectedWork.user_id,
              full_name: selectedWork.full_name,
              avatar_url: selectedWork.avatar_url,
            }}
            currentUser={currentUser}
            workRequestInit={selectedWork}
            onClose={() => setIsChatOpen(false)}
          />
        </ModalPortal>
      )}
    </div>
  );
}

export default ClientsCard;
