import React, { useState } from "react";
import logo from "../assets/logo.png";
import moreIcon from "../assets/icon-more.png";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t, i18n } = useTranslation();
  const [showSidebar, setShowSidebar] = useState(false);
  // const [language, setLanguage] = useState("English");

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ne" : "en";
    i18n.changeLanguage(newLang);
  };

  // Text dictionary
  const texts = {
    English: {
      title: "BatoVetiyo",
      button: "English",
      moreAlt: "More",
    },
    नेपाली: {
      title: "बाटो भेटियो",
      button: "नेपाली",
      moreAlt: "थप",
    },
  };

  // const t = texts[language];

  return (
    <header className="bg-[rgb(5,150,104)] text-white shadow-lg sticky top-0 z-30">
      <div className="relative mx-auto px-4 py-2 flex items-center justify-center max-w-5xl">
        {/* Left: Sidebar toggle */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute left-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-green-500/30 rounded-lg"
        >
          <img src={moreIcon} alt={t.moreAlt} className="w-8 h-7" />
        </button>

        {/* Center: Logo + Title */}
        <div className="flex items-center justify-center space-x-2">
          <img
            src={logo}
            alt="Logo"
            className="w-16 h-16 sm:w-18 sm:h-20 md:w-24 md:h-28 rounded-full object-cover drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          />
          <div className="pt-2 ml-2">
            <h1 className="font-bold sm:text-3xl md:text-4xl lg:text-5xl">
              {t.title}
            </h1>
          </div>
        </div>

        {/* Right: Language toggle */}
        <button
          onClick={toggleLanguage}
          className="absolute right-4 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs sm:text-sm md:text-base font-normal"
        >
          {t("header.button")}
        </button>

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[rgb(5,150,104)] text-white transform transition-transform duration-300 ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold">Menu</h2>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">About</a></li>
              <li><a href="#" className="hover:underline">Services</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
            </ul>
          </div>
        </div>

        {showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 z-30 bg-black/30"
          ></div>
        )}
      </div>
    </header>
  );
};

export default Header;
