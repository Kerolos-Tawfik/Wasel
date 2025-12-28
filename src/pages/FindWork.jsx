import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Briefcase,
  MapPin,
  Sparkles,
  ChevronDown,
  X,
} from "lucide-react";
import Categories from "../../../Wasel/src/components/findwork/Categories.jsx";
import ClientsCard from "../../../Wasel/src/components/findwork/ClientsCard.jsx";
import styles from "./FindWork.module.css";

function FindWork({ savedData, service, setService, user }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const cityDropdownRef = useRef(null);

  const initialWorkRequestId = location.state?.workRequestId;
  const notificationType = location.state?.notificationType;

  useEffect(() => {
    if (initialWorkRequestId) {
      // Clear state after reading it to prevent reopening loops
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [initialWorkRequestId, navigate, location.pathname]);

  const cities = [
    { id: "all", label: t("findWork.filters.all") },
    { id: "saihat", label: t("cities.saihat") },
    { id: "qatif", label: t("cities.qatif") },
  ];

  const filteredCities = cities.filter((city) =>
    city.label.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  const handleCitySelect = (cityId) => {
    setSelectedCity(cityId);
    setCityDropdownOpen(false);
    setCitySearchQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
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

  useEffect(() => {
    setSelectedCategory("all");
    setSelectedCity("all");
  }, [service]);

  const localCount =
    savedData?.filter((d) => d.service_type === "local").length || 0;
  const freelanceCount =
    savedData?.filter((d) => d.service_type === "freelance").length || 0;

  return (
    <div className={styles.findWorkPage}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <Sparkles className={styles.sparkleIcon} />
            {t("findWork.hero_title")}
          </h1>
          <p className={styles.heroSubtitle}>{t("findWork.hero_subtitle")}</p>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder={t("findWork.search_placeholder")}
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Service Type Tabs */}
          <div className={styles.serviceTabs}>
            <button
              className={`${styles.serviceTab} ${
                service === "local" ? styles.activeTab : ""
              }`}
              onClick={() => setService("local")}
            >
              <MapPin size={20} />
              <span>{t("findWork.filters.local")}</span>
              <span className={styles.tabCount}>{localCount}</span>
            </button>
            <button
              className={`${styles.serviceTab} ${
                service === "freelance" ? styles.activeTab : ""
              }`}
              onClick={() => setService("freelance")}
            >
              <Briefcase size={20} />
              <span>{t("findWork.filters.freelance")}</span>
              <span className={styles.tabCount}>{freelanceCount}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Categories Section - Always Visible */}
        <section className={styles.categoriesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t("findWork.browse_categories")}
            </h2>
          </div>
          <Categories
            service={service}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </section>

        {savedData && savedData.length > 0 ? (
          <>
            {/* City Filter for Local Services */}
            {service === "local" && (
              <div className={styles.cityFilterWrapper}>
                <label className={styles.cityLabel}>
                  <MapPin size={16} />
                  {t("findWork.filters.choose_city")}
                </label>

                {/* City Dropdown */}
                <div
                  className={styles.cityDropdownWrapper}
                  ref={cityDropdownRef}
                >
                  <button
                    type="button"
                    className={`${styles.cityDropdownBtn} ${
                      cityDropdownOpen ? styles.cityDropdownActive : ""
                    }`}
                    onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  >
                    <MapPin size={18} className={styles.cityDropdownIcon} />
                    <span>
                      {selectedCity === "all"
                        ? t("findWork.filters.all")
                        : t(`cities.${selectedCity}`)}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`${styles.cityDropdownArrow} ${
                        cityDropdownOpen ? styles.rotated : ""
                      }`}
                    />
                  </button>

                  {cityDropdownOpen && (
                    <div className={styles.cityDropdownMenu}>
                      {/* Search Input */}
                      <div className={styles.cityDropdownSearch}>
                        <Search size={16} className={styles.citySearchIcon} />
                        <input
                          type="text"
                          placeholder={t("findWork.search_city")}
                          value={citySearchQuery}
                          onChange={(e) => setCitySearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className={styles.citySearchInput}
                        />
                        {citySearchQuery && (
                          <button
                            type="button"
                            className={styles.citySearchClear}
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
                      <div className={styles.cityDropdownOptions}>
                        {filteredCities.map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            className={`${styles.cityDropdownOption} ${
                              selectedCity === city.id
                                ? styles.cityOptionActive
                                : ""
                            }`}
                            onClick={() => handleCitySelect(city.id)}
                          >
                            <MapPin size={16} />
                            <span>{city.label}</span>
                          </button>
                        ))}
                        {filteredCities.length === 0 && (
                          <div className={styles.cityNoResults}>
                            <Search size={18} />
                            <span>{t("findWork.no_cities_found")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results Section */}
            <section className={styles.resultsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  {t("findWork.available_requests")}
                </h2>
              </div>
              <ClientsCard
                savedData={savedData}
                service={service}
                selectedCategory={selectedCategory}
                selectedCity={selectedCity}
                searchQuery={searchQuery}
                currentUser={user}
                initialWorkRequestId={initialWorkRequestId}
                notificationType={notificationType}
              />
            </section>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h2>{t("findWork.no_requests")}</h2>
            <p>{t("findWork.add_request_prompt")}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default FindWork;
