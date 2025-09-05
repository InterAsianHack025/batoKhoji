import React, { useState } from "react";
import logo from "../assets/logo.png";
import moreIcon from "../assets/icon-more.png";
import { useTranslation } from "react-i18next";
import MenuBar from "./MenuBar";

const Header = () => {
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

  // const t = texts[language]; by harina

  return (
    <header className="bg-[rgb(5,150,104)] text-white shadow-lg sticky top-0 z-30">
      <div className="mx-auto px-4 py-0.5 flex items-center justify-between">
        {/* Left Icon */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-green-500/30 rounded-lg"
        >
          <img src={moreIcon} alt={t.moreAlt} className="w-8 h-7" />
        </button>

        <MenuBar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

        {/* Logo + Title */}
        <div className="flex items-center">
          <img
            src={logo}
            alt={t("header.logoAlt")}
            className="w-18 h-20 sm:w-18 sm:h-20 md:w-24 md:h-28 pb-1 rounded-full object-cover drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          />
          <div className="pt-2">
            <h1 className="font-bold sm:text-3xl md:text-4xl lg:text-5xl [text-shadow:0_2px_4px_rgba(0,0,0,0.9)]">
              {t("header.title")}
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg p-1 text-green-100">
              {t("header.tagline")}
            </p>
          </div>
        </div>

        {/* Language Button */}
        <button
          onClick={toggleLanguage}
          className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs sm:text-sm md:text-base font-normal"
        >
          {t("header.button")}
        </button>
      </div>
    </header>
  );
};

export default Header;
