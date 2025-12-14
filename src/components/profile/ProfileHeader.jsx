import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
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
import { supabase } from "../../lib/supabaseClient.js";
import styles from "./ProfileHeader.module.css";

const ProfileHeader = ({
  profile,
  user,
  isEditing,
  setIsEditing,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(profile?.title || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const isProvider = profile?.user_role === "provider";

  const userName =
    user?.user?.user_metadata?.full_name ||
    profile?.full_name ||
    user?.user?.email?.split("@")[0] ||
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
      const userId = user?.user?.id;
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Wait a moment to ensure the file is ready
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(newAvatarUrl);

      // Update profile in database
      await onUpdate({ avatar_url: newAvatarUrl });

      // Optionally re-fetch user
      const { data: updatedUser, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.user.id)
        .single();
      if (!error) setUser({ user: updatedUser });

      // Reset file input to allow re-upload of same file
      e.target.value = null;
    } catch (error) {
      console.error("Error uploading avatar:", error);
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
            <div className={styles.avatarOverlay}>
              {isUploadingAvatar ? (
                <div className={styles.avatarSpinner}></div>
              ) : (
                <Camera size={20} />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className={styles.avatarInput}
            />
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
                {profile?.title || t("profile.no_title")}
              </p>
            )}
          </div>

          {/* Location */}
          {profile?.city && (
            <div className={styles.location}>
              <MapPin size={16} />
              <span>{t(`cities.${profile.city}`) || profile.city}</span>
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
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
            <Edit3 size={18} />
            <span>{t("profile.edit")}</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default ProfileHeader;
