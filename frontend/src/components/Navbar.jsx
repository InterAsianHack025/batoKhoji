import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faMap, faRoute, faBell } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: faHome, label: t("Home") || "Home" },
    { path: "/map", icon: faMap, label: t("Map") || "Map" },
    { path: "/routes", icon: faRoute, label: t("Routes") || "Routes" },
    { path: "/notification", icon: faBell, label: t("Notification") || "Notification" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/50 border-t border-gray-200 shadow-lg">
      <div className="mx-auto">
        <ul className="flex items-center justify-around text-xs font-medium">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`w-full flex flex-col items-center py-2.5 ${
                  location.pathname === item.path
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
                aria-label={item.label}
              >
                <FontAwesomeIcon icon={item.icon} className="text-base mb-1" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
