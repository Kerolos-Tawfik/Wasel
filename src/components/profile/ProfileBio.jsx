import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Edit3, Check, X } from "lucide-react";
import styles from "./ProfileBio.module.css";

const ProfileBio = ({ profile, isEditing, onUpdate }) => {
  const { t } = useTranslation();
  const [bio, setBio] = useState(profile?.bio || "");
  const [isEditingBio, setIsEditingBio] = useState(false);

  const handleSave = () => {
    onUpdate({ bio });
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
        {!isEditingBio && (
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
          <p className={styles.bioText}>
            {profile?.bio || t("profile.no_bio")}
          </p>
        )}
      </div>
    </section>
  );
};

export default ProfileBio;
