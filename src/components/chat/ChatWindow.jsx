import { useState, useEffect, useRef } from "react";
import { Send, X, User, Loader2 } from "lucide-react";
import styles from "./ChatWindow.module.css";
import { chatAPI } from "../../lib/apiService";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

function ChatWindow({
  workRequestId,
  receiverId,
  onClose,
  currentUser,
  otherUser,
  workRequestInit,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [workRequest, setWorkRequest] = useState(workRequestInit || null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (workRequestInit) {
      setWorkRequest(workRequestInit);
    }
  }, [workRequestInit]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      // Pass receiverId to filter messages for specific conversation (if Owner has multiple chats)
      const response = await chatAPI.getMessages(workRequestId, receiverId);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);

        // Mark notifications as read when viewing the conversation
        try {
          await chatAPI.markConversationNotificationsRead(
            workRequestId,
            receiverId,
          );
        } catch (error) {
          console.error("Error marking notifications as read:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    // Also fetch work request status periodically or at least once to ensure we have up-to-date provider assignment
    const fetchWorkRequestStatus = async () => {
      if (!workRequestId) return;
      try {
        const { workRequestAPI } = await import("../../lib/apiService");
        // We assume we have an endpoint or we can get it from a list.
        // If not, we might need a specific endpoint.
        // fallback: check local storage or re-fetch from list.
        // For now, let's assume we can rely on parent updates OR we add a check here if API supports it.
        // Actually, let's just make sure we update it if we assign.
        // But to fix the "glitch", we need to be sure.
        // Let's rely on props update if parent updates, but parent might not update if this is standalone.
      } catch (e) {
        console.error(e);
      }
    };
    // fetchWorkRequestStatus();

    return () => clearInterval(interval);
  }, [workRequestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await chatAPI.sendMessage({
        work_request_id: workRequestId,
        receiver_id: receiverId,
        content: newMessage.trim(),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.data]);
        setNewMessage("");
      } else {
        toast.error(t("chat.error_sending"));
      }
    } catch (error) {
      toast.error(t("chat.error_sending"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.chatOverlay} onClick={onClose}>
      <div className={styles.chatWindow} onClick={(e) => e.stopPropagation()}>
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <div
              className={`${styles.avatar} ${styles.clickableAvatar}`}
              onClick={() =>
                otherUser?.id && navigate(`/profile/${otherUser.id}`)
              }
              title={t("chat.view_profile") || "View Profile"}
            >
              {otherUser?.avatar_url ? (
                <img src={otherUser.avatar_url} alt={otherUser.full_name} />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className={styles.headerText}>
              <h3>
                {otherUser?.full_name || t("chat.title") || "Internal Chat"}
              </h3>
              {/* <span className={styles.onlineStatus}>
                {t("chat.online") || "Conversation"}
              </span> */}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Only show Assign Provider for Clients on non-Support, open requests */}
        {currentUser?.role === "client" &&
          workRequest &&
          !workRequest.provider_id &&
          workRequest.service_type !== "Support" &&
          !["completed", "cancelled"].includes(workRequest.status) && (
            <div className={styles.chatActions}>
              <button
                className={styles.assignBtn}
                onClick={async () => {
                  if (window.confirm(t("chat.confirm_assign"))) {
                    try {
                      const { workStatusAPI } =
                        await import("../../lib/apiService");
                      const response = await workStatusAPI.assignProvider(
                        workRequestId,
                        { provider_id: receiverId },
                      );
                      const data = await response.json();
                      if (response.ok) {
                        toast.success(t("chat.provider_assigned"));
                        setWorkRequest({
                          ...data.work_request,
                          provider_id: receiverId,
                        });
                      } else {
                        toast.error(data.message);
                      }
                    } catch (error) {
                      toast.error(t("common.error"));
                    }
                  }
                }}
              >
                {t("chat.assign_provider")}
              </button>
            </div>
          )}

        {workRequest?.provider_id && (
          <div className={styles.chatStatus}>
            <div className={styles.assignedBadge}>
              {t("chat.provider_assigned")}
            </div>
          </div>
        )}

        <div className={styles.messagesContainer}>
          {loading ? (
            <div className={styles.loading}>
              <Loader2 className={styles.spinner} />
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <p>{t("chat.no_messages") || "Start the conversation!"}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageWrapper} ${
                  // Logic: Message is 'own' (blue/right) if:
                  // 1. I sent it (sender_id == current_id)
                  // 2. OR I am staff AND sender is also staff (Group all staff messages together)
                  String(msg.sender_id) === String(currentUser?.id || "") ||
                  (["admin", "head_admin", "support"].includes(
                    currentUser?.role,
                  ) &&
                    ["admin", "head_admin", "support"].includes(
                      msg.sender?.role,
                    ))
                    ? styles.ownMessage
                    : ""
                }`}
              >
                <div className={styles.messageContent}>
                  <p className={styles.messageText}>{msg.content}</p>
                  <span className={styles.messageTime}>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {["completed", "cancelled"].includes(workRequest?.status) ? (
          <div className={styles.chatClosed}>
            <p>
              {t("chat.ticket_closed") ||
                "This conversation is closed. You can no longer send messages."}
            </p>
          </div>
        ) : (
          <form className={styles.chatInputArea} onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("chat.placeholder") || "Type a message..."}
              className={styles.chatInput}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className={styles.sendBtn}
            >
              {sending ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;
