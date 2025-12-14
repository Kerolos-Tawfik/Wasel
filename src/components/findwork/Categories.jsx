import styles from "./Categories.module.css";
import { useTranslation } from "react-i18next";
import {
  Palette,
  FileText,
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
  LayoutGrid,
} from "lucide-react";

function Categories({ service, selectedCategory, setSelectedCategory }) {
  const { t } = useTranslation();

  const freelanceCategories = [
    { id: "all", icon: LayoutGrid },
    { id: "designers", icon: Palette },
    { id: "content_writing", icon: FileText },
    { id: "video_editing", icon: Video },
    { id: "web_development", icon: Code },
    { id: "social_media", icon: Share2 },
    { id: "translators", icon: Languages },
    { id: "digital_marketing", icon: TrendingUp },
  ];

  const localCategories = [
    { id: "all", icon: LayoutGrid },
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

  return (
    <div className={styles.categoriesGrid}>
      {categories.map((category) => {
        const IconComponent = category.icon;
        const isActive = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            className={`${styles.categoryCard} ${
              isActive ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <div className={styles.iconWrapper}>
              <IconComponent size={24} />
            </div>
            <span className={styles.categoryLabel}>
              {t(`findWork.categories.${category.id}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Categories;
