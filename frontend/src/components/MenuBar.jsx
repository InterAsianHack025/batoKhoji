import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
// import moreIcon from "../assests/icon-more.png";

const MenuBar = ({ showSidebar, setShowSidebar }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleMenuClick = (action) => {
    switch (action) {
      case 'about':
        navigate('/about');
        break;
      case 'services':
        navigate('/services');
        break;
      case 'contact':
        navigate('/contact');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'help':
        navigate('/help');
        break;
      case 'feedback':
        navigate('/feedback');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
    setShowSidebar(false);
  };

  return (
    <>
      <div
        className={`fixed top-19 left-0 bottom-0 z-10 h-full w-64 bg-[rgb(5,150,104)] text-white transform transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Content inside sidebar (MENU) */}
        <div className="p-4">
          <h2 className="mb-4 text-2xl font-bold">{t("header.menu")}</h2>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleMenuClick('about')}
                className="block w-full px-3 py-2 rounded-md hover:bg-green-500 transition-colors duration-200 text-left"
              >
                {t("header.about")}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick('services')}
                className="block w-full px-3 py-2 rounded-md hover:bg-green-500 transition-colors duration-200 text-left"
              >
                {t("header.services")}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick('contact')}
                className="block w-full px-3 py-2 rounded-md hover:bg-green-500 transition-colors duration-200 text-left"
              >
                {t("header.contact")}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick('settings')}
                className="block w-full px-3 py-2 rounded-md hover:bg-green-500 transition-colors duration-200 text-left"
              >
                {t("header.settings")}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick('help')}
                className="block w-full px-3 py-2 rounded-md hover:bg-green-500 transition-colors duration-200 text-left"
              >
                {t("header.help")}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick('feedback')}
                className="block w-full px-3 py-2 rounded-md hover:bg-green-500 transition-colors duration-200 text-left"
              >
                {t("header.feedback")}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick('profile')}
                className="block w-full px-3 py-2 rounded-md hover:bg-green-500 transition-colors duration-200 text-left"
              >
                {t("header.profile")}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 z-0"
        ></div>
      )}
    </>
  );
};

export default MenuBar;