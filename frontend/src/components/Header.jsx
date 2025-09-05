import React, { useState } from "react";
import logo from "../assests/logo.png";
import moreIcon from "../assests/icon-more.png";



navbar.home
  
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
        {/* Sliding sidebar */}
        <div
          className={`fixed top-19 left-0 bottom-0 z-10 h-full w-64 bg-[rgb(5,150,104)] text-white transform transition-transform duration-300 ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Content inside sidebar */}
          <div className="p-4">
            <h2 className="mb-4">{t("header.menu")}</h2>
            <ul className="space-y-2">
               <li>
                <a href="#" className="hover:underline">
                  {t("header.about")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                {t("header.services")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                   {t("header.contact")}
                </a>
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
;

export default Header;
