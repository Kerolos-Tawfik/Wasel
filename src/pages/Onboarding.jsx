import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { toastConfig } from "../lib/toastConfig";
import { supabase } from "../lib/supabaseClient";
import {
  Briefcase,
  Wrench,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import styles from "./Onboarding.module.css";

function Onboarding({ user, selectedRole, setSelectedRole, refreshProfile }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = choose role, 2 = provider subtype
  const [providerType, setProviderType] = useState("");

  const handleContinue = async () => {
    if (!selectedRole) return;

    // If provider chosen and no providerType yet, go to step 2
    if (selectedRole === "provider" && !providerType && step === 1) {
      setStep(2);
      return;
    }

    try {
      setIsSubmitting(true);

      const userId = user?.user?.id;
      const name = user?.user?.user_metadata?.full_name || "";
      if (!userId) {
        throw new Error("User ID not found from  try");
      }
      // Prepare payload
      const payload = {
        id: userId,
        full_name: name,
        user_role: selectedRole,
        updated_at: new Date().toISOString(),
      };

      if (selectedRole === "provider" && providerType) {
        payload.provider_type = providerType; // save provider subtype
      }

      // Update or insert the user's profile with their role and optional provider_type
      const { error } = await supabase.from("profiles").upsert(payload);

      if (error) throw error;
      toast.success(t("onboarding.success"), toastConfig);
      // Call the refreshProfile callback to refresh the profile
      if (refreshProfile) {
        refreshProfile();
      }
      // Navigate based on role
      if (selectedRole === "client") {
        navigate("/addwork");
      } else {
        navigate("/findwork");
      }
    } catch (error) {
      console.error("Error saving role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.onboardingPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <Sparkles className={styles.sparkleIcon} />
            {t("onboarding.welcome_title")}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.onboardingCard}>
          <img
            src="../assets/images/Wasel-Logo-Without-Slogan.svg"
            alt="logo"
          />
          <div className={styles.cardHeader}>
            <h2>{t("onboarding.step1_title")}</h2>
            <p>{t("onboarding.step1_desc")}</p>
          </div>

          {step === 1 && (
            <div className={styles.rolesGrid}>
              {/* Client Role */}
              <button
                type="button"
                className={`${styles.roleCard} ${
                  selectedRole === "client" ? styles.activeRole : ""
                }`}
                onClick={() => setSelectedRole("client")}
              >
                <div className={styles.roleIconWrapper}>
                  <Briefcase size={32} />
                </div>
                <div className={styles.roleContent}>
                  <h3>{t("onboarding.role_client")}</h3>
                  <p>{t("onboarding.role_client_desc")}</p>
                </div>
                {selectedRole === "client" && (
                  <CheckCircle2 className={styles.checkIcon} size={24} />
                )}
              </button>

              {/* Provider Role */}
              <button
                type="button"
                className={`${styles.roleCard} ${
                  selectedRole === "provider" ? styles.activeRole : ""
                }`}
                onClick={() => setSelectedRole("provider")}
              >
                <div className={styles.roleIconWrapper}>
                  <Wrench size={32} />
                </div>
                <div className={styles.roleContent}>
                  <h3>{t("onboarding.role_provider")}</h3>
                  <p>{t("onboarding.role_provider_desc")}</p>
                </div>
                {selectedRole === "provider" && (
                  <CheckCircle2 className={styles.checkIcon} size={24} />
                )}
              </button>
            </div>
          )}

          {step === 2 && selectedRole === "provider" && (
            <div className={styles.rolesGrid}>
              <button
                type="button"
                className={`${styles.roleCard} ${
                  providerType === "freelance" ? styles.activeRole : ""
                }`}
                onClick={() => setProviderType("freelance")}
              >
                <div className={styles.roleIconWrapper}>
                  <Sparkles size={32} />
                </div>
                <div className={styles.roleContent}>
                  <h3>{t("onboarding.provider_freelance")}</h3>
                  <p>{t("onboarding.provider_freelance_desc")}</p>
                </div>
                {providerType === "freelance" && (
                  <CheckCircle2 className={styles.checkIcon} size={24} />
                )}
              </button>

              <button
                type="button"
                className={`${styles.roleCard} ${
                  providerType === "local" ? styles.activeRole : ""
                }`}
                onClick={() => setProviderType("local")}
              >
                <div className={styles.roleIconWrapper}>
                  <Briefcase size={32} />
                </div>
                <div className={styles.roleContent}>
                  <h3>{t("onboarding.provider_local")}</h3>
                  <p>{t("onboarding.provider_local_desc")}</p>
                </div>
                {providerType === "local" && (
                  <CheckCircle2 className={styles.checkIcon} size={24} />
                )}
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button
              className={styles.continueButton}
              onClick={handleContinue}
              disabled={
                isSubmitting ||
                (step === 1 && !selectedRole) ||
                (step === 2 && !providerType)
              }
            >
              {isSubmitting ? (
                t("common.loading")
              ) : (
                <>
                  {t("onboarding.continue")}
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {step === 2 && (
              <button
                className={styles.backButton}
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                style={{ background: "#f1f5f9", color: "#475569" }}
              >
                {t("common.back")}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Onboarding;
