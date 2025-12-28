import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Phone, MapPin, Edit3, Check, X, Lock } from "lucide-react";
import styles from "./ProfileContact.module.css";

const ProfileContact = ({ profile, user, isEditing, onUpdate, isOwner }) => {
  const { t } = useTranslation();
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactData, setContactData] = useState({
    city: profile?.city || "",
  });

  // Get phone from profile or user object
  const displayPhone = profile?.phone || "";

  const handleSave = () => {
    onUpdate({ city: contactData.city });
    setIsEditingContact(false);
  };

  const handleCancel = () => {
    setContactData({
      city: profile?.city || "",
    });
    setIsEditingContact(false);
  };

  return (
    <section className={styles.contactSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Phone size={20} />
          <h2>{t("profile.contact_title")}</h2>
        </div>
        {!isEditingContact && isOwner && (
          <button
            onClick={() => setIsEditingContact(true)}
            className={styles.editBtn}
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>

      <div className={styles.contactContent}>
        {isEditingContact ? (
          <div className={styles.editContainer}>
            {/* Phone - Read Only from Metadata */}
            <div className={styles.formGroup}>
              <label>
                <Phone size={16} />
                {t("profile.phone")}
                <span className={styles.readOnlyBadge}>
                  <Lock size={12} />
                  {t("profile.from_account")}
                </span>
              </label>
              <input
                type="tel"
                value={displayPhone}
                disabled
                className={`${styles.input} ${styles.readOnlyInput}`}
                placeholder={t("profile.no_phone")}
              />
            </div>

            {/* City - Editable */}
            <div className={styles.formGroup}>
              <label>
                <MapPin size={16} />
                {t("profile.city")}
              </label>
              <select
                value={contactData.city}
                onChange={(e) =>
                  setContactData({ ...contactData, city: e.target.value })
                }
                className={styles.select}
              >
                <option value="">{t("profile.city")}</option>
                <option value="saihat">{t("cities.saihat")}</option>
                <option value="qatif">{t("cities.qatif")}</option>
              </select>
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
          <div className={styles.contactList}>
            {/* Phone from Metadata */}
            <div className={styles.contactItem}>
              <Phone size={18} />
              <span>{displayPhone || t("profile.no_phone")}</span>
              {displayPhone && (
                <span className={styles.lockedIcon}>
                  <Lock size={14} />
                </span>
              )}
            </div>

            {/* City */}
            {profile?.city && (
              <div className={styles.contactItem}>
                <MapPin size={18} />
                <span>{t(`cities.${profile.city}`) || profile.city}</span>
              </div>
            )}

            {!displayPhone && !profile?.city && (
              <p className={styles.noContact}>{t("profile.no_contact")}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileContact;
