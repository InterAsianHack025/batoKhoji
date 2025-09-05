import react from "react";
import { useTranslation } from "react-i18next";

const Notifications = () => {
  return (
    <div className="notifications">
      <h2>{t("navbar.notifications")}</h2>
      <p>No new notifications.</p>
    </div>
  );
}
export default Notifications;