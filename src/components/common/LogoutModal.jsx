// import React from "react";
// import { useTranslation } from "react-i18next";
// import styles from "./LogoutModal.module.css";

// const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
//   const { t } = useTranslation();

//   if (!isOpen) return null;

//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modal}>
//         <h2 className={styles.title}>{t("auth.logout_confirm_title")}</h2>
//         <p className={styles.message}>{t("auth.logout_confirm_message")}</p>
//         <div className={styles.actions}>
//           <button className={styles.cancelBtn} onClick={onClose}>
//             {t("common.cancel")}
//           </button>
//           <button className={styles.confirmBtn} onClick={onConfirm}>
//             {t("auth.logout")}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LogoutModal;
