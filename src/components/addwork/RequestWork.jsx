import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { toastConfig } from "../../lib/toastConfig";
import { useTranslation } from "react-i18next";

import {
  MapPin,
  Briefcase,
  User,
  FileText,
  Calendar,
  Phone,
  Upload,
  Send,
  Palette,
  FileText as ContentIcon,
  Video,
  Code,
  Share2,
  Languages,
  TrendingUp,
  Wrench,
  Zap,
  Camera,
  SprayCan,
  Hammer,
  PaintBucket,
  Building2,
  Car,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import styles from "./requestwork.module.css";

function RequestWork({ user }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [titleMessage, setTitleMessage] = useState("");
  const [textareaMsg, setTextAreaMsg] = useState("");
  const [date, setDate] = useState("");
  const [tel, setTel] = useState("");
  const [service, setService] = useState("local");
  const [pickCity, setPickCity] = useState("");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState(null);

  // Search and dropdown states
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  // City options
  const cities = [
    { id: "saihat", icon: MapPin },
    { id: "qatif", icon: MapPin },
  ];

  // Filter cities based on search query
  const filteredCities = cities.filter((city) =>
    t(`cities.${city.id}`).toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  // Category configurations with icons
  const freelanceCategories = [
    { id: "designers", icon: Palette },
    { id: "content_writing", icon: ContentIcon },
    { id: "video_editing", icon: Video },
    { id: "web_development", icon: Code },
    { id: "social_media", icon: Share2 },
    { id: "translators", icon: Languages },
    { id: "digital_marketing", icon: TrendingUp },
  ];

  const localCategories = [
    { id: "plumbing", icon: Wrench },
    { id: "electricity", icon: Zap },
    { id: "outdoor_photography", icon: Camera },
    { id: "cleaning", icon: SprayCan },
    { id: "carpentry_smithing", icon: Hammer },
    { id: "decoration_gypsum", icon: PaintBucket },
    { id: "light_contracting", icon: Building2 },
    { id: "car_services", icon: Car },
  ];

  const categories =
    service === "freelance" ? freelanceCategories : localCategories;

  // Filter categories based on search query
  const filteredCategories = categories.filter((cat) =>
    t(`findWork.categories.${cat.id}`)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Handle category select from dropdown
  const handleCategorySelect = (catId) => {
    setCategory(catId);
    setDropdownOpen(false);
    setSearchQuery("");
  };

  // Handle city select from dropdown
  const handleCitySelect = (cityId) => {
    setPickCity(cityId);
    setCityDropdownOpen(false);
    setCitySearchQuery("");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target)
      ) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangeService = (newService) => {
    setService(newService);
    if (newService === "freelance") {
      setPickCity("");
    }
    setCategory("");
    setSearchQuery("");
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!category) {
    toast.error(t("addWork.errors.category_required"), toastConfig);
    return;
  }

  if (service === "local" && !pickCity) {
    toast.error(t("addWork.errors.city_required"), toastConfig);
    return;
  }

  try {
    const userId = user?.id; // استخدم الـ id من السيرفر أو من الـ JWT/session
    if (!userId) throw new Error("User not authenticated");

    const payload = {
      category,
      full_name: user?.full_name || name,
      work_title: titleMessage,
      work_description: textareaMsg,
      expected_date: date,
      phone: user?.phone || tel,
      service_type: service,
      file_attachments: files ? Array.from(files).map((file) => file.name) : [],
      city: pickCity,
      user_id: userId,
    };

    const response = await fetch("/api/work-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to add work request");

    // Reset form
    setTitleMessage("");
    setTextAreaMsg("");
    setDate("");
    setTel("");
    setPickCity("");
    setService("local");
    setCategory("");

    toast.success(t("addWork.messages.success"), toastConfig);
  } catch (error) {
    console.error("Error adding work request:", error);
    toast.error(error.message || t("errors.default"), toastConfig);
  }
};


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
              onClick={() => handleChangeService("local")}
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
              onClick={() => handleChangeService("freelance")}
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

          {/* Category Dropdown with Search */}
          <div className={styles.categoryDropdownWrapper} ref={dropdownRef}>
            <button
              type="button"
              className={`${styles.categoryDropdownBtn} ${
                dropdownOpen ? styles.dropdownActive : ""
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {category ? (
                <>
                  {(() => {
                    const selectedCat = categories.find(
                      (c) => c.id === category
                    );
                    const IconComp = selectedCat?.icon;
                    return IconComp ? <IconComp size={20} /> : null;
                  })()}
                  <span>{t(`findWork.categories.${category}`)}</span>
                </>
              ) : (
                <span className={styles.dropdownPlaceholder}>
                  {t("addWork.select_category")}
                </span>
              )}
              <ChevronDown
                size={20}
                className={`${styles.dropdownArrow} ${
                  dropdownOpen ? styles.rotated : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className={styles.categoryDropdownMenu}>
                {/* Search Input Inside Dropdown */}
                <div className={styles.dropdownSearchWrapper}>
                  <Search size={18} className={styles.dropdownSearchIcon} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className={styles.dropdownSearchInput}
                    placeholder={t("addWork.search_category")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className={styles.dropdownSearchClear}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Options */}
                <div className={styles.dropdownOptions}>
                  {filteredCategories.map((cat) => {
                    const IconComponent = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`${styles.dropdownOption} ${
                          category === cat.id ? styles.dropdownOptionActive : ""
                        }`}
                        onClick={() => handleCategorySelect(cat.id)}
                      >
                        <IconComponent size={20} />
                        <span>{t(`findWork.categories.${cat.id}`)}</span>
                      </button>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <div className={styles.dropdownNoResults}>
                      <Search size={20} />
                      <span>{t("addWork.no_categories_found")}</span>
                    </div>
                  )}
                </div>
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
              value={user ? user.user.user_metadata.full_name : name}
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

          {/* Expected Date */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <Calendar size={16} />
              {t("addWork.labels.date_label")}
            </label>
            <input
              type="text"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Phone Number */}
          {service === "local" ? (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <Phone size={16} />
                {t("addWork.labels.phone_label")}
              </label>
              <input
                type="tel"
                className={styles.input}
                value={user ? user.user.user_metadata.phone : tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder={t("addWork.labels.phone")}
                disabled={!!user}
                required
              />
              {user && (
                <span className={styles.inputHint}>
                  {t("addWork.labels.number_from_account")}
                </span>
              )}
            </div>
          ) : null}

          {/* File Upload */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <Upload size={16} />
              {t("addWork.labels.attachments")}
            </label>
            <div className={styles.fileUpload}>
              <input
                onChange={(e) => {
                  setFiles(e.target.files);
                }}
                type="file"
                name="workFiles"
                accept="image/*,application/pdf"
                multiple
                className={styles.fileInput}
                disabled={files ? true : false}
              />
              <div className={styles.fileUploadContent}>
                {files ? (
                  Array.from(files).map((file) => file.name)
                ) : (
                  <>
                    <Upload size={24} />
                    <span>{t("addWork.labels.upload_files")}</span>
                  </>
                )}
              </div>
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
            !category || (service === "local" && !pickCity)
              ? styles.submitDisabled
              : ""
          }`}
          disabled={!category || (service === "local" && !pickCity)}
        >
          <Send size={20} />
          {t("addWork.labels.submit")}
        </button>

        {/* Validation Hint */}
        {(!category || (service === "local" && !pickCity)) && (
          <p className={styles.validationHint}>
            {!category && !pickCity && service === "local"
              ? t("addWork.validation_hint")
              : !category
              ? t("addWork.errors.category_required")
              : t("addWork.errors.city_required")}
          </p>
        )}
      </form>
    </div>
  );
}

export default RequestWork;
