import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastConfig } from "../../lib/toastConfig";
import { useTranslation } from "react-i18next";
import { workRequestAPI, categoriesAPI } from "../../lib/apiService";
import MultiSelect from "../common/MultiSelect";
import { arabCountries, validatePhone } from "../../lib/phoneUtils";
import {
  MapPin,
  Briefcase,
  User,
  FileText,
  Phone,
  Upload,
  Send,
  X,
  Clock,
  DollarSign,
  AlertCircle,
  ChevronDown,
  Search,
} from "lucide-react";
import styles from "./RequestWork.module.css";

function RequestWork({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [titleMessage, setTitleMessage] = useState("");
  const [textareaMsg, setTextAreaMsg] = useState("");

  const [duration, setDuration] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [tel, setTel] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(arabCountries[0]);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [service, setService] = useState("local");
  const [pickCity, setPickCity] = useState("");
  const cityDropdownRef = useRef(null);
  const countryRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // City options
  const cities = [
    { id: "riyadh", label: t("cities.riyadh"), icon: MapPin },
    { id: "jeddah", label: t("cities.jeddah"), icon: MapPin },
    { id: "mecca", label: t("cities.mecca"), icon: MapPin },
    { id: "medina", label: t("cities.medina"), icon: MapPin },
    { id: "dammam", label: t("cities.dammam"), icon: MapPin },
    { id: "khobar", label: t("cities.khobar"), icon: MapPin },
    { id: "saihat", label: t("cities.saihat"), icon: MapPin },
    { id: "qatif", label: t("cities.qatif"), icon: MapPin },
    { id: "abha", label: t("cities.abha"), icon: MapPin },
    { id: "tabuk", label: t("cities.tabuk"), icon: MapPin },
    { id: "hail", label: t("cities.hail"), icon: MapPin },
    { id: "jazan", label: t("cities.jazan"), icon: MapPin },
    { id: "najran", label: t("cities.najran"), icon: MapPin },
    { id: "bahah", label: t("cities.bahah"), icon: MapPin },
    { id: "sakaka", label: t("cities.sakaka"), icon: MapPin },
    { id: "arar", label: t("cities.arar"), icon: MapPin },
    { id: "buraydah", label: t("cities.buraydah"), icon: MapPin },
    { id: "jubail", label: t("cities.jubail"), icon: MapPin },
    { id: "yanbu", label: t("cities.yanbu"), icon: MapPin },
  ];

  const filteredCities = cities.filter((city) =>
    city.label.toLowerCase().includes(citySearchQuery.toLowerCase()),
  );

  const handleCitySelect = (cityId) => {
    setPickCity(cityId);
    setCityDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target)
      ) {
        setCityDropdownOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoriesAPI.getCategories();
        const data = await res.json();
        if (res.ok) setCategories(data.categories || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (selectedCategoryIds.length === 0) {
      toast.error(t("addWork.errors.category_required"), toastConfig);
      return;
    }

    if (service === "local" && !pickCity) {
      toast.error(t("addWork.errors.city_required"), toastConfig);
      return;
    }

    // Phone validation for local service if not using user's phone
    if (
      service === "local" &&
      !user &&
      !validatePhone(tel, selectedCountry.code)
    ) {
      toast.error(
        t("auth.errors.phone_invalid") || "Invalid phone number",
        toastConfig,
      );
      return;
    }

    try {
      const userId = user?.id;
      if (!userId) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("full_name", user?.full_name || name);
      formData.append("work_title", titleMessage);
      formData.append("work_description", textareaMsg);
      formData.append("service_type", service);
      formData.append("city", service === "local" ? pickCity : "");

      if (duration) formData.append("duration", duration);
      if (budgetMin) formData.append("budget_min", budgetMin);
      if (budgetMax) formData.append("budget_max", budgetMax);

      // Validate budget
      if (Number(budgetMin) < 50 || Number(budgetMax) < 50) {
        toast.error(
          t("addWork.errors.budget_too_low") || "Budget should be at least 50",
          toastConfig,
        );
        return;
      }
      if (Number(budgetMax) < Number(budgetMin)) {
        toast.error(
          t("addWork.errors.budget_invalid") ||
            "Max budget cannot be less than min budget",
          toastConfig,
        );
        return;
      }
      if (tel) formData.append("phone", selectedCountry.dial_code + tel);

      selectedCategoryIds.forEach((id, index) => {
        formData.append(`category_ids[${index}]`, id);
      });
      selectedSkillIds.forEach((id, index) => {
        formData.append(`skill_ids[${index}]`, id);
      });

      files.forEach((file) => {
        formData.append("attachments[]", file);
      });

      const response = await workRequestAPI.createWorkRequest(formData);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to add work request");

      // Reset form
      setTitleMessage("");
      setTextAreaMsg("");

      setDuration("");
      setBudgetMin("");
      setBudgetMax("");
      setTel("");
      setPickCity("");
      setSelectedCategoryIds([]);
      setSelectedSkillIds([]);
      setFiles([]);

      toast.success(t("addWork.messages.success"), toastConfig);
      
      // Redirect to My Requests page after successful submission
      navigate("/my-requests");
    } catch (error) {
      console.error("Error adding work request:", error);
      toast.error(error.message || t("errors.default"), toastConfig);
    }
  };

  useEffect(() => {
    setSelectedCategoryIds([]);
    setSelectedSkillIds([]);
  }, [service]);

  // Filter categories by service type
  const filteredCategories = categories.filter((cat) => cat.type === service);

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Step 1: Service Type */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.stepNumber}>1</span>
            {t("addWork.steps.service_type")}
          </h3>
          <div className={styles.serviceTabs}>
            <button
              type="button"
              className={`${styles.serviceTab} ${
                service === "local" ? styles.activeTab : ""
              }`}
              onClick={() => setService("local")}
            >
              <MapPin size={20} />
              <div className={styles.tabContent}>
                <span className={styles.tabTitle}>
                  {t("addWork.labels.local")}
                </span>
                <span className={styles.tabDesc}>
                  {t("addWork.labels.local_desc")}
                </span>
              </div>
            </button>
            <button
              type="button"
              className={`${styles.serviceTab} ${
                service === "freelance" ? styles.activeTab : ""
              }`}
              onClick={() => setService("freelance")}
            >
              <Briefcase size={20} />
              <div className={styles.tabContent}>
                <span className={styles.tabTitle}>
                  {t("addWork.labels.freelance")}
                </span>
                <span className={styles.tabDesc}>
                  {t("addWork.labels.freelance_desc")}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Category Selection */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.stepNumber}>2</span>
            {t("addWork.steps.choose_category")}
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div>
              <label
                className={styles.inputLabel}
                style={{ marginBottom: "0.5rem" }}
              >
                {t("addWork.labels.categories")}
              </label>
              <MultiSelect
                placeholder={t("addWork.select_category")}
                options={filteredCategories}
                selectedIds={selectedCategoryIds}
                onChange={setSelectedCategoryIds}
              />
            </div>

            {selectedCategoryIds.length > 0 && (
              <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                <label
                  className={styles.inputLabel}
                  style={{ marginBottom: "0.5rem" }}
                >
                  {t("addWork.labels.skills")}
                </label>
                <MultiSelect
                  placeholder={t("addWork.select_skills")}
                  options={filteredCategories
                    .filter((c) => selectedCategoryIds.includes(c.id))
                    .flatMap((c) => c.skills)}
                  selectedIds={selectedSkillIds}
                  onChange={setSelectedSkillIds}
                />
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Work Details */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.stepNumber}>3</span>
            {t("addWork.steps.work_details")}
          </h3>

          {/* User Name */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <User size={16} />
              {t("addWork.labels.your_name")}
            </label>
            <input
              type="text"
              className={styles.input}
              value={user ? user.full_name : name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!user}
              placeholder={t("addWork.labels.user")}
            />
            {user && (
              <span className={styles.inputHint}>
                {t("addWork.labels.name_from_account")}
              </span>
            )}
          </div>

          {/* Work Title */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <FileText size={16} />
              {t("addWork.labels.title_label")}
            </label>
            <input
              type="text"
              className={styles.input}
              value={titleMessage}
              onChange={(e) => setTitleMessage(e.target.value)}
              placeholder={t("addWork.labels.work_title")}
              required
            />
          </div>

          {/* Work Description */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <FileText size={16} />
              {t("addWork.labels.description_label")}
            </label>
            <textarea
              className={styles.textarea}
              value={textareaMsg}
              onChange={(e) => setTextAreaMsg(e.target.value)}
              placeholder={t("addWork.labels.work_desc")}
              required
            />
          </div>

          {/* Duration */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <Clock size={16} />
              {t("addWork.labels.duration")}
            </label>
            <input
              type="text"
              className={styles.input}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={t("addWork.placeholders.duration")} // e.g. "5 Days"
            />
          </div>

          {/* Budget */}
          <div className={styles.row}>
            <div className={`${styles.inputGroup} ${styles.col}`}>
              <label className={styles.inputLabel}>
                <DollarSign size={16} />
                {t("addWork.labels.budget_min")}
              </label>
              <input
                type="number"
                className={styles.input}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className={`${styles.inputGroup} ${styles.col}`}>
              <label className={styles.inputLabel}>
                <DollarSign size={16} />
                {t("addWork.labels.budget_max")}
              </label>
              <input
                type="number"
                className={styles.input}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Phone Number */}
          {service === "local" ? (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <Phone size={16} />
                {t("addWork.labels.phone_label")}
              </label>

              {user ? (
                <>
                  <input
                    type="tel"
                    className={styles.input}
                    value={user.phone}
                    disabled
                  />
                  <span className={styles.inputHint}>
                    {t("addWork.labels.number_from_account")}
                  </span>
                </>
              ) : (
                <div className={styles.phoneInputContainer} ref={countryRef}>
                  <div className={styles.countrySelect}>
                    <button
                      type="button"
                      className={styles.countryBtn}
                      onClick={() => setShowCountryMenu(!showCountryMenu)}
                    >
                      <span className={styles.flag}>
                        {selectedCountry.flag}
                      </span>
                      <span className={styles.dialCode}>
                        {selectedCountry.dial_code}
                      </span>
                      <ChevronDown size={14} />
                    </button>

                    {showCountryMenu && (
                      <div className={styles.countryMenu}>
                        {arabCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            className={styles.countryOption}
                            onClick={() => {
                              setSelectedCountry(country);
                              setShowCountryMenu(false);
                            }}
                          >
                            <span className={styles.flag}>{country.flag}</span>
                            <span>{country.name}</span>
                            <span className={styles.dialCode}>
                              {country.dial_code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    className={styles.phoneInput}
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    placeholder={selectedCountry.placeholder || "05xxxxxxxx"}
                    dir="ltr"
                    required
                  />
                </div>
              )}
            </div>
          ) : null}

          {/* File Upload */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <Upload size={16} />
              {t("addWork.labels.attachments")}
            </label>
            <div className={styles.fileUploadContainer}>
              <label className={styles.fileUploadBox}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,application/pdf"
                  className={styles.hiddenFileInput}
                />
                <Upload size={24} className={styles.uploadIcon} />
                <span>{t("addWork.labels.upload_files")}</span>
              </label>

              {files.length > 0 && (
                <div className={styles.fileList}>
                  {files.map((file, index) => (
                    <div key={index} className={styles.fileItem}>
                      <span className={styles.fileName}>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className={styles.removeFileBtn}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: City (only for local) */}
        {service === "local" && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.stepNumber}>4</span>
              {t("addWork.steps.select_city")}
            </h3>

            {/* City Dropdown with Search */}
            <div
              className={styles.categoryDropdownWrapper}
              ref={cityDropdownRef}
            >
              <button
                type="button"
                className={`${styles.categoryDropdownBtn} ${
                  cityDropdownOpen ? styles.dropdownActive : ""
                }`}
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              >
                {pickCity ? (
                  <>
                    <MapPin size={20} />
                    <span>{t(`cities.${pickCity}`)}</span>
                  </>
                ) : (
                  <span className={styles.dropdownPlaceholder}>
                    {t("addWork.select_city")}
                  </span>
                )}
                <ChevronDown
                  size={20}
                  className={`${styles.dropdownArrow} ${
                    cityDropdownOpen ? styles.rotated : ""
                  }`}
                />
              </button>

              {cityDropdownOpen && (
                <div className={styles.categoryDropdownMenu}>
                  {/* Search Input Inside Dropdown */}
                  <div className={styles.dropdownSearchWrapper}>
                    <Search size={18} className={styles.dropdownSearchIcon} />
                    <input
                      type="text"
                      className={styles.dropdownSearchInput}
                      placeholder={t("addWork.search_city")}
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {citySearchQuery && (
                      <button
                        type="button"
                        className={styles.dropdownSearchClear}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCitySearchQuery("");
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* City Options */}
                  <div className={styles.dropdownOptions}>
                    {filteredCities.map((city) => {
                      const IconComponent = city.icon;
                      return (
                        <button
                          key={city.id}
                          type="button"
                          className={`${styles.dropdownOption} ${
                            pickCity === city.id
                              ? styles.dropdownOptionActive
                              : ""
                          }`}
                          onClick={() => handleCitySelect(city.id)}
                        >
                          <IconComponent size={20} />
                          <span>{t(`cities.${city.id}`)}</span>
                        </button>
                      );
                    })}
                    {filteredCities.length === 0 && (
                      <div className={styles.dropdownNoResults}>
                        <Search size={20} />
                        <span>{t("addWork.no_cities_found")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`${styles.submitButton} ${
            selectedCategoryIds.length === 0 ||
            (service === "local" && !pickCity)
              ? styles.submitDisabled
              : ""
          }`}
          disabled={
            selectedCategoryIds.length === 0 ||
            (service === "local" && !pickCity)
          }
        >
          <Send size={20} />
          {t("addWork.labels.submit")}
        </button>

        {/* Validation Hint */}
        {isSubmitted &&
          (selectedCategoryIds.length === 0 ||
            (service === "local" && !pickCity)) && (
            <p className={styles.validationHint}>
              {selectedCategoryIds.length === 0 &&
              !pickCity &&
              service === "local"
                ? t("addWork.validation_hint")
                : selectedCategoryIds.length === 0
                  ? t("addWork.errors.category_required")
                  : t("addWork.errors.city_required")}
            </p>
          )}
      </form>
    </div>
  );
}

export default RequestWork;
