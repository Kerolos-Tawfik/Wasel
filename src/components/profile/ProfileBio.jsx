import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Edit3, Check, X, Tag } from "lucide-react";
import styles from "./ProfileBio.module.css";
import { categoriesAPI } from "../../lib/apiService";
import MultiSelect from "../common/MultiSelect";

const ProfileBio = ({ profile, isEditing, onUpdate, isOwner }) => {
  const { t, i18n } = useTranslation();
  const [bio, setBio] = useState(profile?.bio || "");
  const [isEditingBio, setIsEditingBio] = useState(false);

  // Categories & Skills State
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  useEffect(() => {
    if (isEditingBio) {
      // Fetch categories when entering edit mode
      const fetchCats = async () => {
        try {
          const res = await categoriesAPI.getCategories();
          if (res.ok) {
            const data = await res.json();
            setAllCategories(data.categories || data || []);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchCats();

      // Initialize selections from profile
      setSelectedCategoryIds(profile?.categories?.map((c) => c.id) || []);
      setSelectedSkillIds(profile?.skills?.map((s) => s.id) || []);
    }
  }, [isEditingBio, profile]);

  const handleCategoryChange = (newCats) => {
    setSelectedCategoryIds(newCats);
    if (allCategories.length > 0) {
      // Get all allowed skill IDs for the new categories
      const allowedSkillIds = allCategories
        .filter((c) => newCats.includes(c.id))
        .flatMap((c) => c.skills.map((s) => s.id));

      // Filter current selected skills
      setSelectedSkillIds((prev) =>
        prev.filter((id) => allowedSkillIds.includes(id)),
      );
    }
  };

  const handleSave = () => {
    onUpdate({
      bio,
      category_ids: selectedCategoryIds,
      skill_ids: selectedSkillIds,
    });
    setIsEditingBio(false);
  };

  const handleCancel = () => {
    setBio(profile?.bio || "");
    setIsEditingBio(false);
  };

  return (
    <section className={styles.bioSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <FileText size={20} />
          <h2>{t("profile.bio_title")}</h2>
        </div>
        {!isEditingBio && isOwner && (
          <button
            onClick={() => setIsEditingBio(true)}
            className={styles.editBtn}
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>

      <div className={styles.sectionContent}>
        {isEditingBio ? (
          <div className={styles.editContainer}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("profile.bio_placeholder")}
              className={styles.bioTextarea}
              rows={5}
            />

            <div className={styles.skillsEditSection}>
              <label className={styles.inputLabel}>
                {t("profile.categories")}
              </label>
              <MultiSelect
                placeholder={t("addWork.select_category")}
                options={allCategories}
                selectedIds={selectedCategoryIds}
                onChange={handleCategoryChange}
              />

              <label
                className={styles.inputLabel}
                style={{ marginTop: "1rem", display: "block" }}
              >
                {t("profile.skills")}
              </label>
              <MultiSelect
                placeholder={t("addWork.select_skills")}
                options={allCategories
                  .filter((c) => selectedCategoryIds.includes(c.id))
                  .flatMap((c) => c.skills)}
                selectedIds={selectedSkillIds}
                onChange={setSelectedSkillIds}
              />
            </div>

            <div className={styles.editActions}>
              <button onClick={handleSave} className={styles.saveBtn}>
                <Check size={16} />
                {t("common.save")}
              </button>
              <button onClick={handleCancel} className={styles.cancelBtn}>
                <X size={16} />
                {t("common.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.viewContainer}>
            <p className={styles.bioText}>
              {profile?.bio || (isOwner ? t("profile.no_bio") : "")}
            </p>

            {(profile?.categories?.length > 0 ||
              profile?.skills?.length > 0) && (
              <div className={styles.skillsDisplay}>
                {profile.categories?.length > 0 && (
                  <div className={styles.skillGroup}>
                    <h4 className={styles.skillGroupTitle}>
                      {t("profile.categories")}
                    </h4>
                    <div className={styles.tagsWrapper}>
                      {profile.categories.map((cat) => (
                        <span key={cat.id} className={styles.categoryTag}>
                          {i18n.language === "ar"
                            ? cat.name_ar || cat.name_en
                            : cat.name_en}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.skills?.length > 0 && (
                  <div className={styles.skillGroup}>
                    <h4 className={styles.skillGroupTitle}>
                      {t("profile.skills")}
                    </h4>
                    <div className={styles.tagsWrapper}>
                      {profile.skills.map((skill) => (
                        <span key={skill.id} className={styles.skillTag}>
                          {i18n.language === "ar"
                            ? skill.name_ar || skill.name_en
                            : skill.name_en}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileBio;
