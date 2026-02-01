import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Headset } from "lucide-react";
import styles from "./Support.module.css";
import ChatWindow from "../components/chat/ChatWindow";
import { supportAPI } from "../lib/apiService";
import { toast } from "react-toastify";

const Support = ({ currentUser }) => {
  const { t } = useTranslation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    if (!currentUser) {
      toast.info(
        t("support.login_required") || "Please login to contact support",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await supportAPI.initiateChat();
      if (response.ok) {
        const data = await response.json();
        setActiveChat(data.chat);
        setIsChatOpen(true);
      } else {
        toast.error(
          t("support.initiate_error") || "Failed to start support chat",
        );
      }
    } catch (error) {
      console.error("Error starting support chat:", error);
      toast.error(
        t("support.initiate_error") || "Failed to start support chat",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <Headset size={64} className={styles.icon} />
          <h1 className={styles.title}>
            {t("support.title") || "Help & Support"}
          </h1>
          <p className={styles.subtitle}>
            {t("support.subtitle") ||
              "We are here to help you with any questions or issues."}
          </p>
          <button
            onClick={handleStartChat}
            disabled={loading}
            className={styles.chatBtn}
          >
            <MessageSquare size={20} />
            {loading
              ? t("common.loading")
              : t("support.start_chat") || "Start Live Chat"}
          </button>
        </div>
      </div>

      {isChatOpen && activeChat && (
        <ChatWindow
          workRequestId={activeChat.id} // Assuming support chats use work_request structure or similar
          receiverId={null} // Support chat might not have a single receiver initially
          onClose={() => setIsChatOpen(false)}
          currentUser={currentUser}
          otherUser={{ full_name: "Support Agent", avatar_url: null }} // Placeholder
        />
      )}
    </div>
  );
};

export default Support;
