// تمت
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { toastConfig } from "../../../Wasel/src/lib/toastConfig.js";
import { useAuth } from "../../../Wasel/src/context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { profileAPI } from "../lib/apiService";
import ProfileHeader from "../../../Wasel/src/components/profile/ProfileHeader.jsx";
import ProfileBio from "../../../Wasel/src/components/profile/ProfileBio.jsx";
import ProfilePortfolio from "../../../Wasel/src/components/profile/ProfilePortfolio.jsx";
import ProfileRating from "../../../Wasel/src/components/profile/ProfileRating.jsx";
import ProfileContact from "../../../Wasel/src/components/profile/ProfileContact.jsx";
import ProfileRoleSwitcher from "../../../Wasel/src/components/profile/ProfileRoleSwitcher.jsx";
import styles from "./Profile.module.css";
import { LoaderCircle } from "lucide-react";

const Profile = ({ user, userProfile, onProfileUpdate }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
      setLoading(false);
    } else {
      navigate("/");
    }
  }, [userProfile]);

  const isProvider = profile?.user_role === "provider";
  const isClient = profile?.user_role === "client";

  // Guard useAuth() in case AuthProvider isn't mounted to avoid runtime errors
  const auth = useAuth();
  const refreshProfile = auth?.refreshProfile;

  const handleUpdateProfile = async (updatedData) => {
    try {
      const userId = user?.id;
      if (!userId) throw new Error("User ID not found");

      const response = await profileAPI.updateProfile(userId, updatedData);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to update profile");

      setProfile({ ...profile, ...updatedData });
      setIsEditing(false);

      if (refreshProfile) refreshProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleSwitchRole = async () => {
    const newRole = profile?.user_role === "provider" ? "client" : "provider";
    setIsSwitching(true);
    console.log(newRole);

    try {
      const userId = user?.id;
      if (!userId) throw new Error("User ID not found");

      const response = await profileAPI.switchRole(userId, newRole);
      const data = await response.json();
      
      if (!response.ok)
        throw new Error(data.message || "Failed to switch role");

      setProfile({ ...profile, user_role: newRole });

      if (refreshProfile) refreshProfile();
      if (onProfileUpdate) onProfileUpdate();

      try {
        toast.success(t("profile.switch_success"), toastConfig);
      } catch (err) {
        console.warn("Toast failed:", err);
      }
    } catch (error) {
      console.error("Error switching role:", error);
      toast.error(error.message || t("errors.default"), toastConfig);
    } finally {
      setIsSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoaderCircle className={styles.spinner} size={48} />
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.errorContainer}>
        <p>{t("profile.not_found")}</p>
      </div>
    );
  }

  return (
    <main className={styles.profilePage}>
      <div className={styles.container}>
        {/* Profile Header Section */}
        <ProfileHeader
          profile={profile}
          user={user}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onUpdate={handleUpdateProfile}
        />

        <div className={styles.contentGrid}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Bio Section */}
            <ProfileBio
              profile={profile}
              isEditing={isEditing}
              onUpdate={handleUpdateProfile}
            />

            {/* Portfolio Section - Provider Only */}
            {isProvider && (
              <ProfilePortfolio profile={profile} userId={user?.id} isOwner={true} />
            )}
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Rating Section - Provider Only */}
            {isProvider && <ProfileRating profile={profile} />}

            {/* Contact Section - hidden for freelance providers */}
            {!(isProvider && profile?.provider_type === "freelance") && (
              <ProfileContact
                profile={profile}
                user={user}
                isEditing={isEditing}
                onUpdate={handleUpdateProfile}
              />
            )}

            {/* Role Switcher Section */}
            <ProfileRoleSwitcher
              isProvider={isProvider}
              onSwitchRole={handleSwitchRole}
              isSwitching={isSwitching}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
