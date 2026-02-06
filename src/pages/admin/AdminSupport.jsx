import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { adminAPI } from "../../lib/adminApiService"; // We need to ensure adminApiService has getActiveChats
import { supportAPI } from "../../lib/apiService"; // Or adminAPI depending on where we put it
import ChatWindow from "../../components/chat/ChatWindow";
import styles from "./AdminRequests.module.css";
import customStyles from "./AdminSupport.module.css";
import { LoaderCircle, MessageCircle, User } from "lucide-react";
import { toast } from "react-hot-toast";

const AdminSupport = () => {
  const { t } = useTranslation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const selectedChatRef = useRef(selectedChat);
  const [currentUser, setCurrentUser] = useState(null);

  // Sync ref with state
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Poll for active chats
  const fetchChats = async () => {
    try {
      const response = await adminAPI.getSupportChats();
      if (response.ok) {
        const data = await response.json();
        const newChats = data.chats || [];
        setChats(newChats);

        // Update selectedChat if it exists and matches the current ref (to avoid race condition)
        if (selectedChatRef.current) {
          const updatedChat = newChats.find(
            (c) => c.id === selectedChatRef.current.id,
          );
          if (updatedChat) {
            setSelectedChat(updatedChat);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { authAPI } = await import("../../lib/apiService");
        const response = await authAPI.getCurrentUser();
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching admin user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, [selectedChat]);

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
                          className={`${styles.statusBadge} ${customStyles[chat.status] || styles.statusBadge}`}
                          style={{
                            backgroundColor:
                              chat.status === "completed"
                                ? "#f1f5f9"
                                : chat.status === "in_progress"
                                  ? "#dcfce7"
                                  : "#e2e8f0",
                            color:
                              chat.status === "completed"
                                ? "#64748b"
                                : chat.status === "in_progress"
                                  ? "#166534"
                                  : "#1e293b",
                            border: `1px solid ${chat.status === "completed" ? "#e2e8f0" : chat.status === "in_progress" ? "#bbf7d0" : "#cbd5e1"}`,
                          }}
                        >
                          {t(`status.${chat.status}`) || chat.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
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
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  t("admin.support.confirm_close") ||
                                    "Are you sure you want to close this ticket?",
                                )
                              ) {
                                try {
                                  const response =
                                    await adminAPI.closeSupportTicket(chat.id);
                                  if (response.ok) {
                                    toast.success(
                                      t("admin.support.ticket_closed") ||
                                        "Ticket closed successfully",
                                    );
                                    fetchChats();
                                  } else {
                                    toast.error(t("common.error"));
                                  }
                                } catch (e) {
                                  toast.error(t("common.error"));
                                }
                              }
                            }}
                            className={customStyles.closeTicketBtnSmall}
                            title={t("admin.support.close_ticket")}
                            style={{
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {t("admin.support.close") || "Close"}
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
      </div>

      {selectedChat && currentUser && (
        <ChatWindow
          workRequestId={selectedChat.id}
          receiverId={selectedChat.user_id} // Admin chats with the user
          onClose={() => setSelectedChat(null)}
          currentUser={currentUser}
          otherUser={selectedChat.user}
          workRequestInit={selectedChat}
        />
      )}
    </div>
  );
};

export default AdminSupport;
