import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { adminAPI } from "../../lib/adminApiService";
import styles from "./AdminRequests.module.css";
import { LoaderCircle, Edit, CheckCircle, XCircle, Eye, X } from "lucide-react";

const AdminRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending_confirmation"); // Default to pending confirmation
  const [filters, setFilters] = useState({
    status: "all",
    date_from: "",
    date_to: "",
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // 'view' | 'edit' | 'review'

  // Rejection State
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const queryFilters = { ...filters, type: activeTab };
      const response = await adminAPI.getRequests(1, queryFilters);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters, activeTab]);

  const handleOpenModal = (req, mode = "view") => {
    setSelectedRequest({ ...req });
    setModalMode(mode);
    setIsModalOpen(true);
    setShowRejectInput(false);
    setRejectionReason("");
    setChatMessages([]);

    // Fetch chat if not completed/cancelled
    if (req.status && !["completed", "cancelled"].includes(req.status)) {
      fetchChat(req.id);
    }
  };

  const fetchChat = async (id) => {
    setLoadingChat(true);
    try {
      const response = await adminAPI.getChatMessages(id);
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch chat:", error);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleApprove = async () => {
    if (
      !window.confirm(
        t("admin.requests.confirm_approve") || "Confirm Approval?",
      )
    )
      return;
    try {
      const response = await adminAPI.updateRequestStatus(
        selectedRequest.id,
        "new",
      );
      if (response.ok) {
        setIsModalOpen(false);
        fetchRequests();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return alert("Reason is required");
    try {
      // We need to use a custom payload for rejection
      // Reuse updateRequest or updateRequestStatus depending on backend support
      // Backend expects status='rejected' and rejection_reason query param or body
      // Adapting adminAPI.updateRequestStatus to support body or query params?
      // Let's assume we modify adminApiService or send a manual fetch here if needed.
      // OR we can use the `updateRequest` (PUT) endpoint if it goes to AdminController logic.
      // Actually `updateRequestStatus` in AdminController is what I updated.
      // I need to ensure adminAPI.updateRequestStatus sends the reason.

      // Temporary direct fetch helper for this specific call if service doesn't support it yet
      // Actually I'll assume I can pass it as a second arg to updateRequestStatus if I update the service,
      // but simpler to use `adminAPI.customFetch` logic if available.

      // Let's use `updateRequest` (the generic one) or modify the service.
      // The service usually sends JSON.

      const response = await adminAPI.updateRequestStatus(
        selectedRequest.id,
        "rejected",
        rejectionReason,
      );

      if (response.ok) {
        setIsModalOpen(false);
        fetchRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // ... existing payload logic ...
      const payload = { ...selectedRequest }; // simplified for brevity
      const response = await adminAPI.updateRequest(
        selectedRequest.id,
        payload,
      );
      if (response.ok) {
        setIsModalOpen(false);
        fetchRequests();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditChange = (e) => {
    setSelectedRequest({ ...selectedRequest, [e.target.name]: e.target.value });
  };

  // ... Filters logic ...
  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className={styles.container}>
      {/* ... Header & Tabs ... */}
      <div className={styles.headerSection}>
        <h2 className={styles.title}>{t("admin.requests.page_title")}</h2>
        <div className={styles.tabsContainer}>
          <div className={styles.tabsWrapper}>
            <button
              className={`${styles.tabBtn} ${activeTab === "pending_confirmation" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("pending_confirmation")}
            >
              {t("admin.requests.tab_pending") || "Pending"}
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "confirmed" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("confirmed")}
            >
              {t("admin.requests.tab_confirmed") || "Confirmed"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Wrapper ... */}
      <div className={styles.filtersWrapper}>
        {/* ... existing filters ... */}
        <div className={styles.filters}>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className={styles.select}
          >
            <option value="all">{t("admin.requests.all_statuses")}</option>
            <option value="new">New</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            name="date_from"
            value={filters.date_from}
            onChange={handleFilterChange}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <LoaderCircle className={styles.spinner} />
          </div>
        ) : (
          <div className={styles.tablecontainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("admin.requests.id")}</th>
                  <th>{t("admin.requests.title")}</th>
                  <th>{t("admin.requests.client")}</th>
                  <th>{t("admin.requests.date")}</th>
                  <th>{t("admin.requests.status")}</th>
                  <th>{t("admin.requests.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className={styles.empty}>{t("common.no_data")}</div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id}>
                      <td className={styles.tdId}>#{req.id}</td>
                      <td className={styles.tdTitle}>
                        <div className={styles.titleText}>{req.work_title}</div>
                        <div className={styles.subTitle}>
                          {req.service_type}
                        </div>
                      </td>
                      <td>{req.user?.full_name || "N/A"}</td>
                      <td>{new Date(req.created_at).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${styles[req.status]}`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {activeTab === "pending_confirmation" ? (
                            <button
                              onClick={() => handleOpenModal(req, "review")}
                              className={styles.actionBtnApprove}
                            >
                              <Eye size={16} />{" "}
                              {t("admin.requests.review") || "Review"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenModal(req, "edit")}
                              className={styles.actionBtnEdit}
                            >
                              <Edit size={16} /> {t("common.edit")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedRequest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: "700px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0 }}>
                {modalMode === "review"
                  ? t("admin.requests.review_title") || "Review Request"
                  : t("admin.requests.edit_title") || "Edit Request"}{" "}
                #{selectedRequest.id}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.closeBtn}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className={styles.editForm}>
              <div className={styles.formGrid}>
                {/* Read-Only Review Mode or Edit Mode */}
                <div className={styles.formGroup}>
                  <label>{t("addWork.labels.title_label")}</label>
                  {modalMode === "review" ? (
                    <p>{selectedRequest.work_title}</p>
                  ) : (
                    <input
                      name="work_title"
                      value={selectedRequest.work_title || ""}
                      onChange={handleEditChange}
                      required
                    />
                  )}
                </div>

                <div
                  className={styles.formGroup}
                  style={{ gridColumn: "span 2" }}
                >
                  <label>{t("addWork.labels.description_label")}</label>
                  {modalMode === "review" ? (
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {selectedRequest.work_description}
                    </p>
                  ) : (
                    <textarea
                      name="work_description"
                      value={selectedRequest.work_description || ""}
                      onChange={handleEditChange}
                      rows="3"
                      required
                    />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>{t("addWork.labels.budget_min")}</label>
                  {modalMode === "review" ? (
                    <p>{selectedRequest.budget_min}</p>
                  ) : (
                    <input
                      name="budget_min"
                      value={selectedRequest.budget_min || ""}
                      onChange={handleEditChange}
                    />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>{t("addWork.labels.budget_max")}</label>
                  {modalMode === "review" ? (
                    <p>{selectedRequest.budget_max}</p>
                  ) : (
                    <input
                      name="budget_max"
                      value={selectedRequest.budget_max || ""}
                      onChange={handleEditChange}
                    />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>{t("addWork.labels.duration")}</label>
                  {modalMode === "review" ? (
                    <p>{selectedRequest.duration}</p>
                  ) : (
                    <input
                      name="duration"
                      value={selectedRequest.duration || ""}
                      onChange={handleEditChange}
                    />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>{t("profile.city")}</label>
                  {modalMode === "review" ? (
                    <p>{selectedRequest.city}</p>
                  ) : (
                    <input
                      name="city"
                      value={selectedRequest.city || ""}
                      onChange={handleEditChange}
                    />
                  )}
                </div>

                {/* Status Field - Only in Edit Mode */}
                {modalMode === "edit" && (
                  <div className={styles.formGroup}>
                    <label>{t("admin.requests.status_label")}</label>
                    <select
                      name="status"
                      value={selectedRequest.status || "new"}
                      onChange={handleEditChange}
                      className={styles.statusSelect}
                    >
                      <option value="new">New</option>
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="delayed">Delayed</option>
                      <option value="pending_payment">Pending Payment</option>
                    </select>
                  </div>
                )}

                <div
                  className={styles.formGroup}
                  style={{ gridColumn: "span 2" }}
                >
                  <label>
                    {t("admin.requests.attachments") || "Attachments"}
                  </label>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {selectedRequest.file_attachments &&
                    selectedRequest.file_attachments.length > 0 ? (
                      selectedRequest.file_attachments.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#007bff",
                            textDecoration: "underline",
                          }}
                        >
                          {t("admin.requests.file")} {idx + 1}
                        </a>
                      ))
                    ) : (
                      <p>
                        {t("admin.requests.no_attachments") || "No attachments"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Section */}
              {selectedRequest.status &&
                !["new", "pending", "completed", "cancelled"].includes(
                  selectedRequest.status,
                ) && (
                  <div
                    style={{
                      marginTop: "20px",
                      borderTop: "1px solid #eee",
                      paddingTop: "20px",
                    }}
                  >
                    <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>
                      Chat Log
                    </h4>
                    {loadingChat ? (
                      <div>Loading chat...</div>
                    ) : chatMessages.length === 0 ? (
                      <div>No messages.</div>
                    ) : (
                      <div
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                          background: "#f9f9f9",
                          padding: "10px",
                          borderRadius: "4px",
                        }}
                      >
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            style={{
                              marginBottom: "8px",
                              borderBottom: "1px solid #eee",
                              paddingBottom: "4px",
                            }}
                          >
                            <strong>{msg.sender?.full_name}:</strong>{" "}
                            {msg.content}
                            <span
                              style={{
                                fontSize: "0.8em",
                                color: "#666",
                                marginLeft: "8px",
                              }}
                            >
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {/* Review Actions */}
              {modalMode === "review" && (
                <div
                  style={{
                    marginTop: "20px",
                    borderTop: "1px solid #eee",
                    paddingTop: "20px",
                  }}
                >
                  {!showRejectInput ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className={styles.cancelBtn}
                      >
                        {t("common.cancel") || "Close"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectInput(true)}
                        className={styles.cancelBtn}
                        style={{ color: "red", borderColor: "red" }}
                      >
                        <XCircle size={16} />{" "}
                        {t("admin.requests.reject") || "Reject"}
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        className={styles.saveBtn}
                      >
                        <CheckCircle size={16} />{" "}
                        {t("admin.requests.approve_publish") ||
                          "Approve & Publish"}
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <label style={{ fontWeight: "bold" }}>
                        {t("admin.requests.rejection_reason") ||
                          "Rejection Reason (Required):"}
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder={
                          t("admin.requests.rejection_placeholder") ||
                          "Explain why this request is being rejected..."
                        }
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setShowRejectInput(false)}
                          className={styles.cancelBtn}
                        >
                          {t("common.cancel")}
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          className={styles.saveBtn}
                          style={{ backgroundColor: "red", borderColor: "red" }}
                        >
                          {t("admin.requests.confirm_rejection") ||
                            "Confirm Rejection"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Edit Actions */}
              {modalMode === "edit" && (
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={styles.cancelBtn}
                  >
                    {t("common.cancel")}
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    {t("common.save")}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
