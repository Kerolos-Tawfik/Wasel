import { useEffect, useState } from "react";
import styles from "./Categories.module.css";
import { useTranslation } from "react-i18next";
import { categoriesAPI } from "../../lib/apiService";
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

const iconMapping = {
  // Freelance
  Designers: Palette,
  "Design & Creative": Palette,
  "Content Writing": FileText,
  "Writing & Translation": FileText,
  "Video Editing": Video,
  "Web Development": Code,
  "Web & Programming": Code,
  "Social Media Management": Share2,
  "Marketing & Sales": TrendingUp,
  Translators: Languages,
  "Digital Marketing": TrendingUp,

  // Local
  Plumbing: Wrench,
  Electricity: Zap,
  "Outdoor Photography": Camera,
  Cleaning: SprayCan,
  "Carpentry & Smithing": Hammer,
  "Decoration & Gypsum": PaintBucket,
  "Light Contracting": Building2,
  "Car Services": Car,
};

function Categories({ service, selectedCategory, setSelectedCategory }) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoriesAPI.getCategories();
        if (res.ok) {
          const data = await res.json();
          // API returns { categories: [...] } or array?
          // Previous usages suggest { categories: [...] }
          setCategories(data.categories || data || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCats();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (!service || service === "all") return true;
    return cat.type === service;
  });

  // Always add "All" option
  const displayCategories = [
    {
      id: "all",
      name_en: "All",
      name_ar: t("findWork.categories.all"),
      icon: LayoutGrid,
    },
    ...filteredCategories,
  ];

  return (
    <div className={styles.categoriesGrid}>
      {displayCategories.map((category) => {
        const IconComponent =
          category.icon || iconMapping[category.name_en] || LayoutGrid;
        const isActive = selectedCategory === category.id;
        const label =
          i18n.language === "ar"
            ? category.name_ar || category.name_en
            : category.name_en;

        // Should we translate "All"? Yes handled above.
        // For others, use name from DB.

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
              {category.id === "all" ? t(`findWork.categories.all`) : label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Categories;
