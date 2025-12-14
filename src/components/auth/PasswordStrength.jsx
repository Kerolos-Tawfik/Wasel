import { useTranslation } from "react-i18next";

const PasswordStrength = ({ password }) => {
  const { t } = useTranslation();

  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;

    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    return score;
  };

  const strength = calculateStrength(password);

  const getColor = () => {
    if (strength <= 2) return "#ef4444"; // Red
    if (strength <= 3) return "#eab308"; // Yellow
    return "#22c55e"; // Green
  };

  const getLabel = () => {
    if (strength <= 2) return t("auth.weak");
    if (strength <= 3) return t("auth.medium");
    return t("auth.strong");
  };

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.25rem",
          fontSize: "0.8rem",
          color: "#6b7280",
        }}
      >
        <span>{t("auth.password_strength")}</span>
        <span style={{ color: getColor(), fontWeight: 500 }}>{getLabel()}</span>
      </div>
      <div
        style={{
          height: "4px",
          width: "100%",
          backgroundColor: "#e5e7eb",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(strength / 5) * 100}%`,
            backgroundColor: getColor(),
            transition: "width 0.3s ease, background-color 0.3s ease",
          }}
        />
      </div>
      <ul
        style={{
          fontSize: "0.75rem",
          color: "#6b7280",
          marginTop: "0.5rem",
          paddingInlineStart: "1rem",
          listStyleType: "disc",
        }}
      >
        <li style={{ color: password.length >= 8 ? "#22c55e" : "inherit" }}>
          {t("auth.req_length")}
        </li>
        <li style={{ color: /[A-Z]/.test(password) ? "#22c55e" : "inherit" }}>
          {t("auth.req_upper")}
        </li>
        <li style={{ color: /[a-z]/.test(password) ? "#22c55e" : "inherit" }}>
          {t("auth.req_lower")}
        </li>
        <li style={{ color: /[0-9]/.test(password) ? "#22c55e" : "inherit" }}>
          {t("auth.req_number")}
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrength;
