import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  MessageSquare,
  BookOpen,
  User,
  Briefcase,
  Shield,
  ChevronLeft,
  LayoutGrid,
  Headset,
  FileText,
  Clock,
  UserPlus,
  FilePlus,
  CheckCircle,
  Briefcase as BriefcaseIcon,
  Search as SearchIcon,
  DollarSign,
  Menu,
  X,
} from "lucide-react";
import styles from "./Support.module.css";
import ChatWindow from "../components/chat/ChatWindow";
import { supportAPI } from "../lib/apiService";
import { toast } from "react-toastify";

const Support = ({ currentUser }) => {
  const { t, i18n } = useTranslation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // home, guides, tickets
  const [ticketHistory, setTicketHistory] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeTab === "tickets" && currentUser) {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await supportAPI.getMySupportChats();
      if (response.ok) {
        const data = await response.json();
        setTicketHistory(data.chats || []);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

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
        const data = await response.json();
        if (data.chat) {
          setActiveChat(data.chat);
          setIsChatOpen(true);
        } else {
          toast.error(
            t("support.initiate_error") || "Failed to start support chat",
          );
        }
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

  const openTicket = (chat) => {
    setActiveChat(chat);
    setIsChatOpen(true);
  };

  // Content Data
  const categories = [
    {
      id: "clients",
      title: t("onboarding.role_client") || "For Clients",
      icon: <User size={24} />,
      articles: [
        {
          title: t("support.article_1"),
          content: t("support.article_1_content"),
        },
        {
          title: t("support.article_2"),
          content: t("support.article_2_content"),
        },
        {
          title: t("support.article_3"),
          content: t("support.article_3_content"),
        },
        {
          title: t("support.article_4"),
          content: t("support.article_4_content"),
        },
      ],
    },
    {
      id: "providers",
      title: t("onboarding.role_provider") || "For Providers",
      icon: <Briefcase size={24} />,
      articles: [
        {
          title: t("support.provider_article_1"),
          content: t("support.provider_article_1_content"),
        },
        {
          title: t("support.provider_article_2"),
          content: t("support.provider_article_2_content"),
        },
        {
          title: t("support.provider_article_3"),
          content: t("support.provider_article_3_content"),
        },
        {
          title: t("support.provider_article_4"),
          content: t("support.provider_article_4_content"),
        },
      ],
    },
    {
      id: "general",
      title: t("header.settings") || "General & Account",
      icon: <Shield size={24} />,
      articles: [
        {
          title: t("auth.forgot_password"),
          content: t("support.general_article_1_content"),
        },
        {
          title: t("support.general_article_2"),
          content: t("support.general_article_2_content"),
        },
        {
          title: t("support.general_article_3"),
          content: t("support.general_article_3_content"),
        },
        {
          title: t("support.general_article_4"),
          content: t("support.general_article_4_content"),
        },
      ],
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Sidebar Navigation */}
      <aside
        className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.brand}>
          <span>{t("faq.sub_tag") || "Help Center"}</span>
        </div>

        <nav className={styles.navSection}>
          <div className={styles.navTitle}>
            {t("common.details") || "Main Menu"}
          </div>
          <button
            className={`${styles.navItem} ${activeTab === "home" ? styles.navItemActive : ""}`}
            onClick={() => {
              setActiveTab("home");
              setSelectedArticle(null);
              setIsMenuOpen(false); // Close menu on click
            }}
          >
            <LayoutGrid size={18} />
            {t("faq.sub_tag") || "Knowledge Base"}
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "guides" ? styles.navItemActive : ""}`}
            onClick={() => {
              setActiveTab("guides");
              setSelectedArticle(null);
              setIsMenuOpen(false);
            }}
          >
            <BookOpen size={18} />
            {t("offer.sub_tag") || "Guides"}
          </button>
        </nav>

        <nav className={styles.navSection}>
          <div className={styles.navTitle}>
            {t("header.contact") || "Support"}
          </div>
          {currentUser && (
            <button
              className={`${styles.navItem} ${activeTab === "tickets" ? styles.navItemActive : ""}`}
              onClick={() => {
                setActiveTab("tickets");
                setSelectedArticle(null);
                setIsMenuOpen(false);
              }}
            >
              <FileText size={18} />
              {t("support.menu_tickets") || "My Tickets"}
            </button>
          )}
        </nav>

        <button
          className={styles.supportBtn}
          onClick={() => {
            handleStartChat();
            setIsMenuOpen(false);
          }}
          disabled={loading}
        >
          {loading ? (
            t("common.loading")
          ) : (
            <>
              <Headset size={20} />
              {t("support.start_chat")}
            </>
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* VIEW: HOME (Knowledge Base) */}
        {activeTab === "home" && !selectedArticle && (
          <>
            <div className={styles.searchHeader}>
              <h1 className={styles.searchTitle}>
                {t("hero.search_placeholder") || "How can we help you?"}
              </h1>
              <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} size={20} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={t("common.search") || "Search for answers..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.statsRow}>
              <span className={styles.statItem}>
                <div className={styles.statDot}></div>
                {t("hero.features.quality") || "Updated Content"}
              </span>
              <span className={styles.statItem}>
                <div className={styles.statDot}></div>
                {t("hero.features.support") || "24/7 Support"}
              </span>
            </div>

            <div className={styles.categoriesGrid}>
              {categories
                .map((cat) => ({
                  ...cat,
                  articles: cat.articles.filter(
                    (article) =>
                      article.title
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      article.content
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  ),
                }))
                .filter((cat) => cat.articles.length > 0)
                .map((cat) => (
                  <div key={cat.id} className={styles.categoryCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardTitle}>{cat.title}</span>
                      <div className={styles.cardIcon}>{cat.icon}</div>
                    </div>
                    <div className={styles.articleList}>
                      {cat.articles.map((article, idx) => (
                        <button
                          key={idx}
                          className={styles.articleLink}
                          onClick={() => setSelectedArticle(article)}
                        >
                          {article.title}
                          <ChevronLeft size={16} className={styles.arrowIcon} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              {searchQuery &&
                categories.every(
                  (cat) =>
                    !cat.articles.some(
                      (article) =>
                        article.title
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        article.content
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                    ),
                ) && (
                  <div className={styles.noResults}>
                    <Search size={48} className={styles.noResultsIcon} />
                    <p>
                      {t("support.no_results") ||
                        "No results found for your search."}
                    </p>
                    <button
                      className={styles.clearSearch}
                      onClick={() => setSearchQuery("")}
                    >
                      {t("common.clear") || "Clear search"}
                    </button>
                  </div>
                )}
            </div>
          </>
        )}

        {/* VIEW: ARTICLE DETAIL */}
        {selectedArticle && (
          <div className={styles.articleDetail}>
            <button
              className={styles.backBtn}
              onClick={() => setSelectedArticle(null)}
            >
              <ChevronLeft
                size={20}
                style={{
                  transform:
                    i18n.language === "ar" ? "rotate(0deg)" : "rotate(180deg)",
                }}
              />
              {t("common.back") || "Back"}
            </button>
            <h2 className={styles.articleTitle}>{selectedArticle.title}</h2>
            <div className={styles.articleContent}>
              {selectedArticle.content}
            </div>
          </div>
        )}

        {/* VIEW: GUIDES */}
        {activeTab === "guides" && (
          <div className={styles.guidesContainer}>
            {/* Client Section */}
            <div className={styles.guideSection}>
              <div className={styles.guideHeader}>
                <User size={32} className={styles.guideIcon} />
                <h2>{t("support.guide_client_title")}</h2>
              </div>
              <div className={styles.stepsGrid}>
                <div className={styles.guideCard}>
                  <div className={styles.stepBadge}>1</div>
                  <UserPlus size={24} className={styles.stepIcon} />
                  <h3>{t("support.guide_client_step_1")}</h3>
                  <p>{t("support.guide_client_step_1_desc")}</p>
                </div>
                <div className={styles.guideCard}>
                  <div className={styles.stepBadge}>2</div>
                  <FilePlus size={24} className={styles.stepIcon} />
                  <h3>{t("support.guide_client_step_2")}</h3>
                  <p>{t("support.guide_client_step_2_desc")}</p>
                </div>
                <div className={styles.guideCard}>
                  <div className={styles.stepBadge}>3</div>
                  <CheckCircle size={24} className={styles.stepIcon} />
                  <h3>{t("support.guide_client_step_3")}</h3>
                  <p>{t("support.guide_client_step_3_desc")}</p>
                </div>
              </div>
            </div>

            {/* Provider Section */}
            <div className={styles.guideSection}>
              <div className={styles.guideHeader}>
                <BriefcaseIcon size={32} className={styles.guideIcon} />
                <h2>{t("support.guide_provider_title")}</h2>
              </div>
              <div className={styles.stepsGrid}>
                <div className={styles.guideCard}>
                  <div className={styles.stepBadge}>1</div>
                  <User size={24} className={styles.stepIcon} />
                  <h3>{t("support.guide_provider_step_1")}</h3>
                  <p>{t("support.guide_provider_step_1_desc")}</p>
                </div>
                <div className={styles.guideCard}>
                  <div className={styles.stepBadge}>2</div>
                  <SearchIcon size={24} className={styles.stepIcon} />
                  <h3>{t("support.guide_provider_step_2")}</h3>
                  <p>{t("support.guide_provider_step_2_desc")}</p>
                </div>
                <div className={styles.guideCard}>
                  <div className={styles.stepBadge}>3</div>
                  <DollarSign size={24} className={styles.stepIcon} />
                  <h3>{t("support.guide_provider_step_3")}</h3>
                  <p>{t("support.guide_provider_step_3_desc")}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: TICKETS */}
        {activeTab === "tickets" && (
          <div className={styles.ticketsContainer}>
            <h2>{t("support.menu_tickets")}</h2>
            {loadingTickets ? (
              <p>{t("common.loading")}</p>
            ) : ticketHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <MessageSquare size={48} opacity={0.2} />
                <p>{t("support.no_chats") || "No tickets found"}</p>
              </div>
            ) : (
              <div className={styles.ticketList}>
                {ticketHistory.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={styles.ticketCard}
                    onClick={() => openTicket(ticket)}
                  >
                    <div className={styles.ticketHeader}>
                      <span className={styles.ticketId}>#{ticket.id}</span>
                      <span
                        className={`${styles.statusBadge} ${styles[ticket.status]}`}
                      >
                        {t(`status.${ticket.status}`) || ticket.status}
                      </span>
                    </div>
                    <h3>{ticket.work_title}</h3>
                    <p className={styles.lastMessage}>
                      {ticket.messages && ticket.messages.length > 0
                        ? ticket.messages[0].content
                        : "No messages yet"}
                    </p>
                    <div className={styles.ticketMeta}>
                      <Clock size={14} />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.footerLinks}>© 2026 Wasel Help Center</div>
      </main>

      {isChatOpen && activeChat && (
        <ChatWindow
          workRequestId={activeChat.id}
          receiverId={null}
          onClose={() => setIsChatOpen(false)}
          currentUser={currentUser}
          otherUser={{ full_name: "Support Agent", avatar_url: null }}
          workRequestInit={activeChat}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className={styles.supportMobileNav}>
        <button
          className={`${styles.mobileNavItem} ${activeTab === "home" ? styles.mobileNavItemActive : ""}`}
          onClick={() => {
            setActiveTab("home");
            setSelectedArticle(null);
          }}
        >
          <LayoutGrid size={20} />
          <span>{t("faq.sub_tag") || "Home"}</span>
        </button>
        <button
          className={`${styles.mobileNavItem} ${activeTab === "guides" ? styles.mobileNavItemActive : ""}`}
          onClick={() => {
            setActiveTab("guides");
            setSelectedArticle(null);
          }}
        >
          <BookOpen size={20} />
          <span>{t("offer.sub_tag") || "Guides"}</span>
        </button>
        {currentUser && (
          <button
            className={`${styles.mobileNavItem} ${activeTab === "tickets" ? styles.mobileNavItemActive : ""}`}
            onClick={() => {
              setActiveTab("tickets");
              setSelectedArticle(null);
            }}
          >
            <FileText size={20} />
            <span>{t("support.menu_tickets") || "Tickets"}</span>
          </button>
        )}
        <button
          className={styles.mobileNavItem}
          onClick={handleStartChat}
          disabled={loading}
        >
          <MessageSquare size={20} />
          <span>{t("support.contact_support") || "Support"}</span>
        </button>
      </div>
    </div>
  );
};

export default Support;
