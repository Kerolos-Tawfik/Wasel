import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Briefcase, Plus, X, Image } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import styles from "./ProfilePortfolio.module.css";

const ProfilePortfolio = ({ profile, userId, isOwner = false }) => {
  const { t } = useTranslation();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    files: [],
    link: "",
  });

  const fetchPortfolio = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [userId]);

  const handleFilesChange = (files) => {
    const newFiles = Array.from(files || []);
    setNewItem((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim()) return;

    try {
      setLoading(true);
      let uploadedUrls = [];

      if (newItem.files.length > 0) {
        for (const file of newItem.files) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${userId}/portfolio/${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("portfolio_images")
            .upload(fileName, file, { upsert: true });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from("portfolio_images")
            .getPublicUrl(fileName);

          if (urlData?.publicUrl) {
            uploadedUrls.push(urlData.publicUrl);
          }
        }
      }

      const { error } = await supabase.from("portfolio").insert({
        user_id: userId,
        title: newItem.title,
        description: newItem.description || "",
        images: uploadedUrls,
        link: newItem.link || "",
      });

      if (error) throw error;

      setNewItem({ title: "", description: "", files: [], link: "" });
      setIsModalOpen(false);
      fetchPortfolio();
    } catch (error) {
      console.error("Error adding portfolio item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewItem({ title: "", description: "", files: [], link: "" });
  };

  const handleImageClick = (item, index = 0) => {
    setSelectedItem(item);
    setSelectedIndex(index);
  };

  const handleClosePortfolioModal = () => {
    setSelectedItem(null);
    setSelectedIndex(0);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from("portfolio")
        .delete()
        .eq("id", selectedItem.id);

      if (error) throw error;

      handleClosePortfolioModal();
      fetchPortfolio();
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
    }
  };

  const handleEditItem = () => {
    if (!selectedItem) return;

    setNewItem({
      title: selectedItem.title,
      description: selectedItem.description || "",
      files: [],
      link: selectedItem.link || "",
    });
    handleClosePortfolioModal();
    setIsModalOpen(true);
  };

  return (
    <section className={styles.portfolioSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Briefcase size={20} />
          <h2>{t("profile.portfolio_title")}</h2>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.addBtn}
          >
            <Plus size={18} />
            <span>{t("profile.add_project")}</span>
          </button>
        )}
      </div>
      {/* Add Project Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{t("profile.new_project")}</h3>
              <button onClick={handleCloseModal} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>{t("profile.project_title")}</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                  placeholder={t("profile.project_title_placeholder")}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t("profile.project_description")}</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder={t("profile.project_description_placeholder")}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t("profile.project_images")}</label>
                <div
                  className={styles.uploadArea}
                  onClick={() =>
                    document.getElementById("portfolio-file-input").click()
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add(styles.dragOver);
                  }}
                  onDragLeave={(e) =>
                    e.currentTarget.classList.remove(styles.dragOver)
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(styles.dragOver);
                    handleFilesChange(e.dataTransfer.files);
                  }}
                >
                  <input
                    id="portfolio-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFilesChange(e.target.files)}
                    className={styles.hiddenFileInput}
                  />
                  <div className={styles.uploadIcon}>
                    <Image size={32} />
                  </div>
                  <p className={styles.uploadText}>
                    {t("profile.drag_drop_images") || "Drag & drop images here"}
                  </p>
                  <span className={styles.uploadSubtext}>
                    {t("profile.or_click_browse") || "or click to browse"}
                  </span>
                </div>

                {newItem.files.length > 0 && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewHeader}>
                      <span className={styles.previewCount}>
                        {newItem.files.length}{" "}
                        {newItem.files.length === 1 ? "image" : "images"}{" "}
                        selected
                      </span>
                      <button
                        type="button"
                        className={styles.clearAllBtn}
                        onClick={() => setNewItem({ ...newItem, files: [] })}
                      >
                        {t("common.clear_all") || "Clear all"}
                      </button>
                    </div>
                    <div className={styles.imagePreviewGrid}>
                      {newItem.files.map((file, i) => (
                        <div
                          key={`file-preview-${i}`}
                          className={styles.previewCard}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${i + 1}`}
                            className={styles.previewImage}
                            onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                          />
                          <button
                            type="button"
                            className={styles.removePreviewBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewItem({
                                ...newItem,
                                files: newItem.files.filter(
                                  (_, idx) => idx !== i
                                ),
                              });
                            }}
                          >
                            <X size={14} />
                          </button>
                          <div className={styles.previewNumber}>{i + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>{t("profile.project_link")}</label>
                <input
                  type="url"
                  value={newItem.link}
                  onChange={(e) =>
                    setNewItem({ ...newItem, link: e.target.value })
                  }
                  placeholder={t("profile.project_link_placeholder")}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={handleCloseModal} className={styles.cancelBtn}>
                {t("common.cancel")}
              </button>
              <button
                onClick={handleAddItem}
                className={styles.saveBtn}
                disabled={loading || !newItem.title.trim()}
              >
                {loading
                  ? t("profile.saving") || "Saving..."
                  : t("profile.save_project")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Portfolio Grid */}
      {portfolioItems.length > 0 ? (
        <div className={styles.portfolioGrid}>
          {portfolioItems.map((item) => (
            <div key={item.id} className={styles.portfolioCard}>
              <div className={styles.cardImageContainer}>
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className={styles.cardImage}
                  onClick={() => handleImageClick(item, 0)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Briefcase size={40} />
          <p>{t("profile.no_portfolio")}</p>
        </div>
      )}
    </section>
  );
};

export default ProfilePortfolio;
