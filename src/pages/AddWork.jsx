import { useTranslation } from "react-i18next";
import { PlusCircle, Sparkles } from "lucide-react";
import RequestWork from "../../../Wasel/src/components/addwork/RequestWork.jsx";
import styles from "./AddWork.module.css";

function AddWork({ user }) {
  const { t } = useTranslation();

  return (
    <div className={styles.addWorkPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <Sparkles className={styles.sparkleIcon} />
            {t("addWork.hero_title")}
          </h1>
          <p className={styles.heroSubtitle}>{t("addWork.hero_subtitle")}</p>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <RequestWork user={user} />
      </main>
    </div>
  );
}

export default AddWork;
