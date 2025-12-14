import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient.js";
import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import ProfileBio from "../components/profile/ProfileBio.jsx";
import ProfilePortfolio from "../components/profile/ProfilePortfolio.jsx";
import ProfileRating from "../components/profile/ProfileRating.jsx";
import ProfileContact from "../components/profile/ProfileContact.jsx";
import ProfileRoleSwitcher from "../components/profile/ProfileRoleSwitcher.jsx";
import styles from "./Profile.module.css";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { toastConfig } from "../lib/toastConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
      const { error } = await supabase
        .from("profiles")
        .update(updatedData)
        .eq("id", user?.user?.id);

      if (error) throw error;

      setProfile({ ...profile, ...updatedData });
      setIsEditing(false);

      // Refresh central auth/profile state so header and other components update
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
      const { error } = await supabase
        .from("profiles")
        .update({ user_role: newRole })
        .eq("id", user?.user?.id);

      if (error) throw error;

      setProfile({ ...profile, user_role: newRole });

      // Notify central auth to refresh profile so UI updates immediately
      if (refreshProfile) refreshProfile();

      // Notify parent to refresh profile if callback exists
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      // Show success toast
      try {
        toast.success(t("profile.switch_success"), toastConfig);
      } catch (err) {
        console.warn("Toast failed:", err);
      }
    } catch (error) {
      console.error("Error switching role:", error);
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
              <ProfilePortfolio profile={profile} userId={user?.user?.id} />
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
