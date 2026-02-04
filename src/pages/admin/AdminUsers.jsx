import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { adminAPI } from "../../lib/adminApiService";
import styles from "./AdminRequests.module.css";
import { LoaderCircle, Trash2, Bell, Search, User, X } from "lucide-react";
import { toast } from "react-hot-toast";

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Notification Modal State
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifyData, setNotifyData] = useState({ title: "", message: "" });
  const [sending, setSending] = useState(false);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers(page, debouncedSearch);
      if (response.ok) {
        const data = await response.json();
        const allUsers = data.data || [];
        // Filter out admins from the list
        const filteredUsers = allUsers.filter(
          (u) => u.role !== "admin" && u.role !== "head_admin",
        );
        setUsers(filteredUsers);
        setTotalPages(data.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(t("common.confirm_delete") || "Are you sure?")) return;
    try {
      const response = await adminAPI.deleteUser(user.id);
      if (response.ok) {
        toast.success(t("admin.users.delete_success") || "User deleted");
        fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Delete failed:", response.status, errorData);
        const errorMsg =
          errorData.error || errorData.message || "Failed to delete user";
        toast.error(errorMsg);
        console.log("Full error details:", errorData);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting user: " + error.message);
    }
  };

  const handleOpenNotify = (user) => {
    setSelectedUser(user);
    setNotifyData({ title: "", message: "" });
    setIsNotifyModalOpen(true);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifyData.title || !notifyData.message) return;
    setSending(true);
    try {
      const response = await adminAPI.sendNotification({
        user_id: selectedUser.id,
        ...notifyData,
      });
      if (response.ok) {
        toast.success(
          t("admin.users.notification_sent") ||
            "Notification sent successfully",
        );
        setIsNotifyModalOpen(false);
      } else {
        toast.error("Failed to send notification");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h2 className={styles.title}>{t("admin.users.title")}</h2>

        <div className={styles.filtersWrapper}>
          <div className={styles.filters} style={{ width: "auto" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                size={18}
                style={{ position: "absolute", left: "10px", color: "#64748b" }}
              />
              <input
                type="text"
                placeholder={t("common.search")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className={styles.input}
                style={{ paddingLeft: "35px", width: "300px" }}
              />
            </div>
          </div>
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
                  <th>{t("admin.users.id")}</th>
                  <th>{t("admin.users.name")}</th>
                  <th>{t("admin.users.email")}</th>
                  <th>{t("admin.users.role")}</th>
                  <th>{t("admin.users.joined")}</th>
                  <th>{t("admin.users.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className={styles.empty}>{t("common.no_data")}</div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className={styles.tdId}>#{user.id}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              background: "#e2e8f0",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#64748b",
                            }}
                          >
                            <User size={16} />
                          </div>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>
                            {user.full_name}
                          </span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role || "user"}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            if (
                              window.confirm(
                                t("admin.users.confirm_role_change", {
                                  name: user.full_name,
                                  role: newRole,
                                }) ||
                                  `Change role of ${user.full_name} to ${newRole}?`,
                              )
                            ) {
                              try {
                                const response = await adminAPI.updateUser(
                                  user.id,
                                  {
                                    role: newRole,
                                  },
                                );
                                if (response.ok) {
                                  toast.success(
                                    t("admin.users.role_update_success") ||
                                      "Role updated successfully",
                                  );
                                  fetchUsers();
                                } else {
                                  toast.error(
                                    t("admin.users.role_update_failed") ||
                                      "Failed to update role",
                                  );
                                }
                              } catch (error) {
                                console.error("Error updating role:", error);
                                toast.error("Error updating role");
                              }
                            }
                          }}
                          className={styles.roleSelect}
                          style={{
                            backgroundColor:
                              user.role === "admin"
                                ? "#f3e8ff"
                                : user.role === "support"
                                  ? "#dcfce7"
                                  : "#fff",
                            color:
                              user.role === "admin"
                                ? "#6b21a8"
                                : user.role === "support"
                                  ? "#166534"
                                  : "#0f172a",
                            borderColor:
                              user.role === "admin"
                                ? "#d8b4fe"
                                : user.role === "support"
                                  ? "#86efac"
                                  : "#cbd5e1",
                          }}
                        >
                          <option value="user">User</option>
                          <option value="support">Support</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            onClick={() => handleOpenNotify(user)}
                            className={styles.actionBtnEdit}
                            title={t("admin.users.send_notification")}
                          >
                            <Bell size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className={styles.actionBtnEdit}
                            style={{
                              color: "#dc2626",
                              borderColor: "#fecaca",
                              backgroundColor: "#fef2f2",
                            }}
                            title={t("admin.users.delete_user")}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div
          className={styles.pagination}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={styles.tabBtn}
            style={{ opacity: page === 1 ? 0.5 : 1 }}
          >
            {t("common.back")}
          </button>
          <span
            style={{ display: "flex", alignItems: "center", fontWeight: 600 }}
          >
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={styles.tabBtn}
            style={{ opacity: page === totalPages ? 0.5 : 1 }}
          >
            {t("common.continue") || "Next"}
          </button>
        </div>
      </div>

      {isNotifyModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0, border: "none", padding: 0 }}>
                {t("admin.users.send_notification_title", {
                  name: selectedUser?.full_name,
                })}
              </h3>
              <button
                onClick={() => setIsNotifyModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSendNotification}>
              <div
                className={styles.formGroup}
                style={{ marginBottom: "1.5rem" }}
              >
                <label>{t("admin.users.notification_title")}</label>
                <input
                  type="text"
                  value={notifyData.title}
                  onChange={(e) =>
                    setNotifyData({ ...notifyData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div
                className={styles.formGroup}
                style={{ marginBottom: "1.5rem" }}
              >
                <label>{t("admin.users.notification_message")}</label>
                <textarea
                  value={notifyData.message}
                  onChange={(e) =>
                    setNotifyData({ ...notifyData, message: e.target.value })
                  }
                  required
                  rows={4}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsNotifyModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className={styles.saveBtn}
                >
                  {sending ? t("common.loading") : t("common.send") || "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
