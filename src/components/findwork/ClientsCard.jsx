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
} from "lucide-react";
import styles from "./ClientsCard.module.css";
import { useTranslation } from "react-i18next";

const ITEMS_PER_PAGE = 4;

function ClientsCard({
  savedData,
  service,
  selectedCategory,
  selectedCity,
  searchQuery = "",
}) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWork, setSelectedWork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (work) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWork(null);
  };

  const filteredData = savedData.filter((data) => {
    // 1. Filter by Service Type
    const isServiceMatch =
      !service || service === "all" || data.service_type === service;

    // 2. Filter by Category
    const isCategoryMatch =
      !selectedCategory ||
      selectedCategory === "all" ||
      data.category === selectedCategory;

    // 3. Filter by City (only if service is local)
    const isCityMatch =
      !selectedCity ||
      selectedCity === "all" ||
      service !== "local" ||
      data.city === selectedCity;

    // 4. Filter by Search Query (search in title and category name)
    const searchLower = searchQuery?.toLowerCase() || "";
    const categoryName = data.category
      ? t(`findWork.categories.${data.category}`).toLowerCase()
      : "";
    const isSearchMatch =
      !searchQuery ||
      data.work_title?.toLowerCase().includes(searchLower) ||
      categoryName.includes(searchLower);

    return isServiceMatch && isCategoryMatch && isCityMatch && isSearchMatch;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [service, selectedCategory, selectedCity, searchQuery]);

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
              )
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
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <div className={`
                  ${styles.serviceTag} 
                  ${selectedWork.service_type === 'freelance' ? styles.freelanceTag : styles.localTag}
                `}>
                  {selectedWork.service_type === 'freelance' ? <Briefcase size={14} /> : <User size={14} />} 
                  <span>{t(`findWork.filters.${selectedWork.service_type}`)}</span>
                </div>
                <h3>{selectedWork.work_title}</h3>
              </div>
              <button onClick={handleCloseModal} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4 className={styles.modalSubtitle}>{t("findWork.modal.description") || "Description"}</h4>
                <p className={styles.modalText}>{selectedWork.work_description}</p>
              </div>

               <div className={styles.modalGrid}>
                 <div className={styles.modalInfoItem}>
                   <User size={18} />
                   <div>
                     <span className={styles.modalLabel}>{t("findWork.modal.client") || "Client"}</span>
                     <p>{selectedWork.full_name}</p>
                   </div>
                 </div>
                 
                 {selectedWork.city && (
                   <div className={styles.modalInfoItem}>
                     <Earth size={18} />
                     <div>
                       <span className={styles.modalLabel}>{t("findWork.modal.location") || "Location"}</span>
                       <p>{t(`cities.${selectedWork.city}`) || selectedWork.city}</p>
                     </div>
                   </div>
                 )}

                 {selectedWork.created_at && (
                    <div className={styles.modalInfoItem}>
                      <Calendar size={18} />
                      <div>
                        <span className={styles.modalLabel}>{t("findWork.modal.posted") || "Posted"}</span>
                        <p>{new Date(selectedWork.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                 )}
               </div>
            </div>

            <div className={styles.modalFooter}>
               <button className={styles.contactBtn} onClick={() => {
                  alert("Contact feature coming soon!");
               }}>
                  <Phone size={18} />
                  {t("findWork.modal.contact") || "Contact Client"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsCard;
