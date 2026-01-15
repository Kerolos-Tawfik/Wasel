import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { toastConfig } from "../../lib/toastConfig";
import { profileAPI } from "../../lib/apiService";
import {
  User,
  MapPin,
  Briefcase,
  Wrench,
  Edit3,
  Check,
  X,
  Camera,
} from "lucide-react";

import styles from "./ProfileHeader.module.css";

const ProfileHeader = ({
  profile,
  user,
  isEditing,
  setIsEditing,
  onUpdate,
  isOwner,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(profile?.title || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const isProvider = profile?.user_role === "provider";

  const userName =
    profile?.full_name ||
    user?.full_name ||
    profile?.email?.split("@")[0] ||
    user?.email?.split("@")[0] ||
    t("profile.anonymous");

  const handleSaveTitle = () => {
    onUpdate({ title });
  };

  const handleCancelEdit = () => {
    setTitle(profile?.title || "");
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(t("profile.invalid_image"));
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const userId = user?.id;
      if (!userId) throw new Error("User ID not found");

      const formData = new FormData();
      formData.append("avatar", file);

      // Upload to server
      const response = await profileAPI.uploadAvatar(userId, formData);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to upload avatar");

      const newAvatarUrl = `${data.avatar_url}?t=${Date.now()}`;
      setAvatarUrl(newAvatarUrl);

      // Update profile in database (optional if server already returns updated profile)
      if (onUpdate) await onUpdate({ avatar_url: newAvatarUrl });

      // Reset file input
      e.target.value = null;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || t("errors.default"), toastConfig);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <section className={styles.headerSection}>
      <div className={styles.headerBg}></div>

      <div className={styles.headerContent}>
        {/* Avatar */}
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar} onClick={handleAvatarClick}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="user" />
            ) : (
              <User size={48} />
            )}
            {isOwner && (
              <div className={styles.avatarOverlay}>
                {isUploadingAvatar ? (
                  <div className={styles.avatarSpinner}></div>
                ) : (
                  <Camera size={20} />
                )}
              </div>
            )}
            {isOwner && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles.avatarInput}
              />
            )}
          </div>
          <div className={styles.roleBadge}>
            {isProvider ? <Wrench size={14} /> : <Briefcase size={14} />}
            <span>
              {isProvider
                ? `${t("header.role_provider")} ${
                    profile?.provider_type
                      ? `(${t(
                          "profile.provider_type_" + profile.provider_type
                        )})`
                      : ""
                  }`
                : t("header.role_client")}
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className={styles.userInfo}>
          <h1 className={styles.userName}>{userName}</h1>

          {/* Professional Title - Editable */}
          <div className={styles.titleSection}>
            {isEditing ? (
              <div className={styles.titleEdit}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("profile.title_placeholder")}
                  className={styles.titleInput}
                />
                <button
                  onClick={handleSaveTitle}
                  className={styles.saveBtn}
                  title={t("common.save")}
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={styles.cancelBtn}
                  title={t("common.cancel")}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <p className={styles.title}>
                {profile?.title || (isOwner ? t("profile.no_title") : "")}
              </p>
            )}
          </div>

          {/* Location */}
          {profile?.city && (
            <div className={styles.location}>
              <MapPin size={16} />
              <span>
                {t(`cities.${profile.city.toLowerCase()}`) || profile.city}
              </span>
            </div>
          )}

          {/* Category */}
          {profile?.category && (
            <div className={styles.category}>
              <span className={styles.categoryTag}>
                {t(`categories.items.${profile.category}`) || profile.category}
              </span>
            </div>
          )}
        </div>

        {/* Edit Button */}
        {!isEditing && isOwner && (
          <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
            <Edit3 size={18} />
            <span>{t("profile.edit_profile")}</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default ProfileHeader;
