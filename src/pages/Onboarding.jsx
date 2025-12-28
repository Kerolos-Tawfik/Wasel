import { toastConfig } from "../lib/toastConfig";
import { profileAPI, categoriesAPI } from "../lib/apiService";
import MultiSelect from "../components/common/MultiSelect";
import {
  Briefcase,
  Wrench,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import styles from "./Onboarding.module.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function Onboarding({ user, selectedRole, setSelectedRole, refreshProfile }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [providerType, setProviderType] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getCategories();
        const data = await response.json();
        if (response.ok) {
          // Robustly handle both { categories: [...] } and raw array [...]
          const cats = data.categories || data || [];
          setCategories(Array.isArray(cats) ? cats : []);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleContinue = async () => {
    if (!selectedRole) return;

    // If provider chosen and no providerType yet, go to step 2
    if (selectedRole === "provider" && !providerType && step === 1) {
      setStep(2);
      return;
    }

    // If provider and providerType chosen, go to step 3 (Categories)
    if (selectedRole === "provider" && providerType && step === 2) {
      setStep(3);
      return;
    }

    // If step 3 and no categories (optional check, or required?)
    if (step === 3 && selectedCategories.length === 0) {
      toast.error("Please select at least one category", toastConfig);
      return;
    }

    try {
      setIsSubmitting(true);

      const userId = user?.id;
      const name = user?.full_name || "";
      if (!userId) {
        throw new Error("User ID not found");
      }

      const payload = {
        id: userId,
        full_name: name,
        user_role: selectedRole,
        updated_at: new Date().toISOString(),
      };

      if (selectedRole === "provider") {
        payload.provider_type = providerType;
        payload.category_ids = selectedCategories;
        payload.skill_ids = selectedSkills;
      }

      const response = await profileAPI.upsertProfile(payload);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to update profile");

      toast.success(t("onboarding.success"), toastConfig);

      // Reload page to update App.jsx state
      if (selectedRole === "client") {
        window.location.href = "/addwork";
      } else {
        window.location.href = "/findwork";
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(error.message || t("errors.default"), toastConfig);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter skills based on selected categories
  const availableSkills = categories
    .filter((cat) => selectedCategories.includes(cat.id))
    .flatMap((cat) => cat.skills || []);

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
            <h2>{t(`onboarding.step${step}_title`)}</h2>
            <p>{t(`onboarding.step${step}_desc`)}</p>
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

          {step === 3 && (
            <div
              className={styles.formGroup}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                textAlign: "start",
              }}
            >
              <div>
                <h3 style={{ marginBottom: "1rem", color: "#1e293b" }}>
                  {t("addWork.steps.select_specializations")}
                </h3>
                <MultiSelect
                  placeholder={t("addWork.select_category")}
                  options={categories.filter(
                    (cat) => cat.type === providerType
                  )}
                  selectedIds={selectedCategories}
                  onChange={(ids) => {
                    setSelectedCategories(ids);
                    // Clear skills that are no longer valid
                    const validSkills = categories
                      .filter((c) => ids.includes(c.id))
                      .flatMap((c) => c.skills || []);
                    const validSkillIds = validSkills.map((s) => s.id);
                    setSelectedSkills((prev) =>
                      prev.filter((id) => validSkillIds.includes(id))
                    );
                  }}
                />
              </div>

              {selectedCategories.length > 0 && (
                <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <h3 style={{ marginBottom: "1rem", color: "#1e293b" }}>
                    {t("addWork.steps.select_skills")}
                  </h3>
                  <MultiSelect
                    placeholder={t("addWork.select_skills")}
                    options={categories
                      .filter((c) => selectedCategories.includes(c.id))
                      .flatMap((c) => c.skills || [])}
                    selectedIds={selectedSkills}
                    onChange={setSelectedSkills}
                  />
                </div>
              )}
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

            {step > 1 && (
              <button
                className={styles.backButton}
                onClick={() => setStep(step - 1)}
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
