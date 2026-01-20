import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { adminAPI } from "../../lib/adminApiService";
import styles from "./AdminRequests.module.css";
import { LoaderCircle, Edit, CheckCircle } from "lucide-react";

const AdminRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("confirmed");
  const [filters, setFilters] = useState({
    status: "all",
    date_from: "",
    date_to: "",
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);

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

  const handleApprove = async (id) => {
    if (
      !window.confirm(
        t("admin.requests.confirm_approve") || "Approve this request?",
      )
    )
      return;
    try {
      const response = await adminAPI.updateRequestStatus(id, "new");
      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (req) => {
    setEditingRequest({ ...req });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        work_title: editingRequest.work_title,
        work_description: editingRequest.work_description,
        phone: editingRequest.phone,
        city: editingRequest.city,
        budget_min: editingRequest.budget_min,
        budget_max: editingRequest.budget_max,
        duration: editingRequest.duration,
        status: editingRequest.status,
      };

      const response = await adminAPI.updateRequest(editingRequest.id, payload);
      if (response.ok) {
        setIsEditModalOpen(false);
        setEditingRequest(null);
        fetchRequests();
      } else {
        alert("Failed to update");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditChange = (e) => {
    setEditingRequest({ ...editingRequest, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h2 className={styles.title}>{t("admin.requests.title")}</h2>

        <div className={styles.tabsContainer}>
          <div className={styles.tabsWrapper}>
            <button
              className={`${styles.tabBtn} ${activeTab === "confirmed" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("confirmed")}
            >
              {t("admin.requests.tab_confirmed") || "All Requests"}
            </button>
            {/* 
                  Hidden 'pending_confirmation' tab as requested by user.
                  Everything is now effectively in 'confirmed' tab.
                */}
          </div>
        </div>
      </div>

      <div className={styles.filtersWrapper}>
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
          <>
            {/* Desktop Table View */}
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
                        <div className={styles.empty}>
                          <span>{t("common.no_data")}</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id}>
                        <td className={styles.tdId}>#{req.id}</td>
                        <td className={styles.tdTitle}>
                          <div className={styles.titleText}>
                            {req.work_title}
                          </div>
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
                                onClick={() => handleApprove(req.id)}
                                className={styles.actionBtnApprove}
                                title="Approve & Publish"
                              >
                                <CheckCircle size={16} />{" "}
                                {t("common.confirm") || "Approve"}
                              </button>
                            ) : (
                              <button
                                onClick={() => openEditModal(req)}
                                className={styles.actionBtnEdit}
                                title="Edit Request"
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

            {/* Mobile Cards View */}
            <div className={styles.mobileCards}>
              {requests.length === 0 ? (
                <div className={styles.emptyMobile}>{t("common.no_data")}</div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{req.work_title}</h3>
                      <span
                        className={`${styles.statusBadge} ${styles[req.status]}`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <div
                        className={styles.subTitle}
                        style={{ alignSelf: "flex-start" }}
                      >
                        {req.service_type}
                      </div>
                      <div className={styles.cardMeta}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>
                            {t("admin.requests.client")}
                          </span>
                          <span className={styles.metaValue}>
                            {req.user?.full_name || "N/A"}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>
                            {t("admin.requests.date")}
                          </span>
                          <span className={styles.metaValue}>
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>
                            {t("admin.requests.id")}
                          </span>
                          <span className={styles.metaValue}>#{req.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      {activeTab === "pending_confirmation" ? (
                        <button
                          onClick={() => handleApprove(req.id)}
                          className={styles.actionBtnApprove}
                        >
                          <CheckCircle size={18} />{" "}
                          {t("common.confirm") || "Approve"}
                        </button>
                      ) : (
                        <button
                          onClick={() => openEditModal(req)}
                          className={styles.actionBtnEdit}
                        >
                          <Edit size={18} /> {t("common.edit")}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {isEditModalOpen && editingRequest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>
              {t("admin.requests.edit_title") || "Edit Request"} #
              {editingRequest.id}
            </h3>
            <form onSubmit={handleEditSubmit} className={styles.editForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>{t("addWork.labels.title_label")}</label>
                  <input
                    name="work_title"
                    value={editingRequest.work_title || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t("addWork.labels.description_label")}</label>
                  <textarea
                    name="work_description"
                    value={editingRequest.work_description || ""}
                    onChange={handleEditChange}
                    required
                    rows="3"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t("addWork.labels.phone_label")}</label>
                  <input
                    name="phone"
                    value={editingRequest.phone || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t("profile.city")}</label>
                  <input
                    name="city"
                    value={editingRequest.city || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t("addWork.labels.budget_min")}</label>
                  <input
                    type="number"
                    name="budget_min"
                    value={editingRequest.budget_min || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t("addWork.labels.budget_max")}</label>
                  <input
                    type="number"
                    name="budget_max"
                    value={editingRequest.budget_max || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t("addWork.labels.duration")}</label>
                  <input
                    name="duration"
                    value={editingRequest.duration || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t("admin.requests.status")}</label>
                  <select
                    name="status"
                    value={editingRequest.status}
                    onChange={handleEditChange}
                  >
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
