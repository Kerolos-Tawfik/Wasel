import styles from "./Filters.module.css";
import { useTranslation } from "react-i18next";

function Filters({ service, setService, selectedCity, setSelectedCity }) {
  const { t } = useTranslation();

  return (
    <div className={styles.filters}>
      <select
        name="services"
        id="services"
        onChange={(e) => setService(e.target.value)}
        value={service || "all"}
      >
        <option value="all">{t("findWork.filters.all")}</option>
        <option value="local">{t("findWork.filters.local")}</option>
        <option value="freelance">{t("findWork.filters.freelance")}</option>
      </select>
      {service === "local" && (
        <>
          <select
            name="city"
            id="city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="all">{t("findWork.filters.choose_city")}</option>
            <option value="saihat">{t("cities.saihat")}</option>
            <option value="qatif">{t("cities.qatif")}</option>
          </select>
        </>
      )}
    </div>
  );
}

export default Filters;
