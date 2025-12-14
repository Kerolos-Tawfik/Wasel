import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Wrench,
  PlusCircle,
  Search,
  RefreshCw,
  LoaderCircle,
} from "lucide-react";
import styles from "./ProfileRoleSwitcher.module.css";

const ProfileRoleSwitcher = ({ isProvider, onSwitchRole, isSwitching }) => {
  const { t } = useTranslation();

  return (
    <section className={styles.roleSwitcherSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <RefreshCw size={20} />
          <h2>{t("profile.role_settings")}</h2>
        </div>
      </div>

      <div className={styles.switcherContent}>
        {/* Current Role Display */}
        <div className={styles.currentRole}>
          <div className={styles.roleIcon}>
            {isProvider ? <Wrench size={22} /> : <Briefcase size={22} />}
          </div>
          <div className={styles.roleInfo}>
            <span className={styles.roleLabel}>
              {t("profile.current_role")}
            </span>
            <span className={styles.roleName}>
              {isProvider ? t("header.role_provider") : t("header.role_client")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.switcherActions}>
          {/* Quick Action Button */}
          <Link
            to={isProvider ? "/findwork" : "/addwork"}
            className={styles.actionBtn}
          >
            {isProvider ? <Search size={18} /> : <PlusCircle size={18} />}
            <span>
              {isProvider ? t("header.browse_work") : t("header.add_work")}
            </span>
          </Link>

          {/* Switch Role Button */}
          <button
            onClick={onSwitchRole}
            className={styles.switchBtn}
            disabled={isSwitching}
          >
            {isSwitching ? (
              <LoaderCircle size={18} className={styles.switchSpinner} />
            ) : (
              <RefreshCw size={18} />
            )}
            <span>
              {isProvider
                ? t("profile.switch_to_client")
                : t("profile.switch_to_provider")}
            </span>
          </button>
        </div>
      </div>

      {/* Hint Text */}
      <p className={styles.switchHint}>
        {isProvider
          ? t("profile.switch_hint_provider")
          : t("profile.switch_hint_client")}
      </p>
    </section>
  );
};

export default ProfileRoleSwitcher;
