import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import styles from "./MultiSelect.module.css";
import { useTranslation } from "react-i18next";

const MultiSelect = ({
  label,
  options = [],
  selectedIds = [],
  onChange,
  placeholder = "Select options...",
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id) => {
    let newSelected;
    if (selectedIds.includes(id)) {
      newSelected = selectedIds.filter((item) => item !== id);
    } else {
      newSelected = [...selectedIds, id];
    }
    onChange(newSelected);
  };

  const getLabel = (option) => {
    return i18n.language === "ar"
      ? option.name_ar || option.name_en
      : option.name_en;
  };

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));

  return (
    <div className={styles.container} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}

      <button
        type="button"
        className={styles.dropdownButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedIds.length === 0 ? styles.placeholder : ""}>
          {selectedIds.length > 0
            ? `${selectedIds.length} selected` // Simplified text, could be translated
            : placeholder}
        </span>
        <ChevronDown size={20} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.length === 0 ? (
            <div
              className={styles.option}
              style={{ justifyContent: "center", color: "#888" }}
            >
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = selectedIds.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={`${styles.option} ${
                    isSelected ? styles.selected : ""
                  }`}
                  onClick={() => toggleOption(option.id)}
                >
                  <div className={styles.checkbox}>
                    {isSelected && <Check size={14} />}
                  </div>
                  <span className={styles.optionText}>{getLabel(option)}</span>
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedOptions.length > 0 && (
        <div className={styles.tags}>
          {selectedOptions.map((opt) => (
            <div key={opt.id} className={styles.tag}>
              {getLabel(opt)}
              <button
                type="button"
                className={styles.removeTag}
                onClick={() => toggleOption(opt.id)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
