import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { adminAPI } from "../../lib/adminApiService"; // We need to ensure adminApiService has getActiveChats
import { supportAPI } from "../../lib/apiService"; // Or adminAPI depending on where we put it
import ChatWindow from "../../components/chat/ChatWindow";
import styles from "./AdminRequests.module.css";
import { LoaderCircle, MessageCircle, User } from "lucide-react";
import { toast } from "react-hot-toast";

const AdminSupport = () => {
  const { t } = useTranslation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  // Poll for active chats
  const fetchChats = async () => {
    try {
      const response = await adminAPI.getSupportChats();
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h2 className={styles.title}>
          {t("admin.support.title") || "Support Chats"}
        </h2>
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
                  <th>{t("admin.support.user")}</th>
                  <th>{t("admin.support.last_message")}</th>
                  <th>{t("admin.support.status")}</th>
                  <th>{t("admin.support.action")}</th>
                </tr>
              </thead>
              <tbody>
                {chats.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      <div className={styles.empty}>
                        {t("admin.support.no_chats") ||
                          "No active support chats"}
                      </div>
                    </td>
                  </tr>
                ) : (
                  chats.map((chat) => (
                    <tr key={chat.id}>
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
                          <span style={{ fontWeight: 600 }}>
                            {chat.user?.full_name || "Unknown User"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                          {chat.last_message?.content || "No messages"}
                        </span>
                        <br />
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {chat.last_message?.created_at
                            ? new Date(
                                chat.last_message.created_at,
                              ).toLocaleString()
                            : ""}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          Active
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedChat(chat)}
                          className={styles.actionBtnEdit}
                          title={t("admin.support.open_chat")}
                        >
                          <MessageCircle size={16} />
                          <span style={{ marginLeft: "5px" }}>
                            {t("common.open")}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedChat && (
        <ChatWindow
          workRequestId={selectedChat.id}
          receiverId={selectedChat.user_id} // Admin chats with the user
          onClose={() => setSelectedChat(null)}
          currentUser={{ id: "admin", user_role: "admin" }} // Mock or fetch actual admin user
          otherUser={selectedChat.user}
        />
      )}
    </div>
  );
};

export default AdminSupport;
