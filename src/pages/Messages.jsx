import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Calendar,
  User,
  Briefcase,
  ChevronRight,
  Loader2,
  MapPin,
} from "lucide-react";
import styles from "./Messages.module.css";
import { chatAPI } from "../lib/apiService";
import ChatWindow from "../components/chat/ChatWindow";

function Messages({ user }) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      if (response.ok) {
        const data = await response.json();
        // Filter out conversations with no messages
        const validConversations = (data.conversations || []).filter(
          (c) => c.last_message
        );
        setConversations(validConversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const [selectedOtherUser, setSelectedOtherUser] = useState(null);

  const openConversation = (conv) => {
    setSelectedWorkId(conv.work_request_id);
    setSelectedOtherUser(conv.other_user);
    // The backend now provides the specific 'other' user ID in conv.user_id (or we can use conv.other_user.id)
    setSelectedReceiverId(conv.other_user?.id);
    setIsChatOpen(true);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.messagesPage}>
      <header className={styles.header}>
        <h1>{t("messages.title") || "Messages"}</h1>
      </header>

      <div className={styles.conversationsList}>
        {conversations.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={48} />
            <h2>{t("messages.no_messages") || "No messages yet"}</h2>
            <p>
              {t("messages.empty_desc") ||
                "Start a conversation from the Find Work page!"}
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={styles.conversationCard}
              onClick={() => openConversation(conv)}
            >
              <div className={styles.convIcon}>
                <Briefcase size={24} />
              </div>
              <div className={styles.convMain}>
                <div className={styles.convHeader}>
                  <div className={styles.convHeaderMain}>
                    <h3>{conv.work_title}</h3>
                    <div className={styles.projectStatus}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles["status_" + conv.status]
                        }`}
                      >
                        {t(`findWork.status.${conv.status}`) || conv.status}
                      </span>
                    </div>
                  </div>
                  <span className={styles.convTime}>
                    {conv.last_message
                      ? new Date(
                          conv.last_message.created_at
                        ).toLocaleDateString()
                      : ""}
                  </span>
                </div>

                <div className={styles.projectContext}>
                  {conv.service_type === "local" && (
                    <div className={styles.contextItem}>
                      <MapPin size={14} />
                      <span>
                        {t(`cities.${conv.city}`) ||
                          conv.city ||
                          t("findWork.city_not_specified")}
                      </span>
                    </div>
                  )}
                  {conv.expected_date && (
                    <div className={styles.contextItem}>
                      <Calendar size={14} />
                      <span>
                        {new Date(conv.expected_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {conv.budget_max && (
                    <div className={styles.contextItem}>
                      <span className={styles.budgetText}>
                        {conv.budget_min ? `${conv.budget_min} - ` : ""}
                        {conv.budget_max}
                      </span>
                    </div>
                  )}
                  {conv.duration && (
                    <div className={styles.contextItem}>
                      <span>{conv.duration}</span>
                    </div>
                  )}
                </div>

                <div className={styles.convPreview}>
                  <p>
                    {conv.last_message
                      ? conv.last_message.content
                      : t("messages.no_content") || "No messages yet"}
                  </p>
                </div>
                <div className={styles.convMeta}>
                  <div className={styles.metaItem}>
                    <User size={14} />
                    <span>
                      {conv.other_user?.full_name || t("common.anonymous")}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <Calendar size={14} />
                    <span>
                      {new Date(conv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className={styles.arrow} />
            </div>
          ))
        )}
      </div>

      {isChatOpen && (
        <ChatWindow
          workRequestId={selectedWorkId}
          receiverId={selectedReceiverId}
          otherUser={selectedOtherUser}
          currentUser={user}
          workRequestInit={conversations.find((c) => c.id === selectedWorkId)}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}

export default Messages;
