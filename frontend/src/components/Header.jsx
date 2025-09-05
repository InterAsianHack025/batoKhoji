import React, { useState } from "react";
import logo from "../assets/logo.png";
import moreIcon from "../assets/icon-more.png";

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { t, i18n } = useTranslation(); //harina
  const [showSidebar, setShowSidebar] = useState(false);

  // const [language, setLanguage] = useState("English");

  // const toggleLanguage = () => {
  //   setLanguage((prev) => (prev === "English" ? "नेपाली" : "English"));
  //   i18n.changeLanguage(newLang);//harina
  // };

  // Toggle between English and Nepali
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ne" : "en";
    i18n.changeLanguage(newLang);
  };

  // // Text dictionary for both languages
  // const texts = {
  //   English: {
  //     title: "BatoVetiyo",
  //     tagline: "I was lost, now I found the way",
  //     button: "English",
  //     moreAlt: "More",
  //     logoAlt: "Logo",
  //   },
  //   नेपाली: {
  //     title: "बाटो भेटियो",
  //     tagline: "म हराएको थिएँ, अब बाटो भेटें",
  //     button: "नेपाली",
  //     moreAlt: "थप",
  //     logoAlt: "लोगो",
  //   },
  // };

  // const t = texts[language];

  return (
    <header className="bg-[rgb(5,150,104)] text-white shadow-lg sticky top-0 z-30">
      <div className="mx-auto px-4 py-0.5 flex items-center justify-between">
        {/* Left Icon */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-green-500/30 rounded-lg"
        >
          <img src={moreIcon} alt="Menu" className="w-8 h-7" />
        </button>

        {/* Center: Logo + Title */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={logo}
            alt="Logo"
            className="w-18 h-20 sm:w-18 sm:h-20 md:w-24 md:h-28 pb-1 rounded-full object-cover drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          />
          <div className="pt-2 ml-2">
            <h1 className="font-bold sm:text-3xl md:text-4xl lg:text-5xl [text-shadow:0_2px_4px_rgba(0,0,0,0.9)]">
              batoVetiyo
            </h1>
          </div>
        </div>

        {/* Right: Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs sm:text-sm md:text-base font-normal"
        >
          {t("header.button")}
        </button>

        {/* Sliding Sidebar */}
        <div
          className={`fixed top-19 left-0 bottom-0 z-10 h-full w-64 bg-[rgb(5,150,104)] text-white transform transition-transform duration-300 ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold">Menu</h2>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Overlay to close sidebar */}
        {showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 z-0 bg-black/30"
          ></div>
        )}
      </div>
    </header>
  );
};

export default Header;
