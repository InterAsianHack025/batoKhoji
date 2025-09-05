import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState({
    language: i18n.language,
    notifications: true,
    darkMode: false,
    autoRefresh: true
  });

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {t("menubar.settings.title")}
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* Language Settings */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">
                {t("menubar.settings.language")}
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-4 py-2 rounded-md ${
                    settings.language === 'en' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('ne')}
                  className={`px-4 py-2 rounded-md ${
                    settings.language === 'ne' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  नेपाली
                </button>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">
                {t("menubar.settings.notifications")}
              </h2>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                  className="w-5 h-5 text-green-600"
                />
                <span className="text-gray-700">
                  {t("menubar.settings.enable_notifications")}
                </span>
              </label>
            </div>
            
            {/* Theme Settings */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">
                {t("menubar.settings.theme")}
              </h2>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                  className="w-5 h-5 text-green-600"
                />
                <span className="text-gray-700">
                  {t("menubar.settings.dark_mode")}
                </span>
              </label>
            </div>
            
            {/* Auto Refresh */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">
                {t("menubar.settings.auto_refresh")}
              </h2>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={() => handleToggle('autoRefresh')}
                  className="w-5 h-5 text-green-600"
                />
                <span className="text-gray-700">
                  {t("menubar.settings.enable_auto_refresh")}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;