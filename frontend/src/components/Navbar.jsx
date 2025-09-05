import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faMap,
  faSearch,
  faRoute,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next"; //by harina

const Navbar = ({ activeNav, setActiveNav }) => {
  const { t } = useTranslation(); // translation hook by harina
  const location = useLocation();

  const navItems = [
    // currently kun language use vako xa tyo taha pauni haitw
    // tyo language ko corresponding file 
    { path: "/", icon: faHome, label: t("navbar.home") },
    { path: "/map", icon: faMap, label: t("navbar.map") },
    // { path: '/search', icon: faSearch, label: 'Search' },
    { path: "/routes", icon: faRoute, label: t("navbar.routes") },
    { path: "/notifications", icon: faBell, label: t("navbar.notifications") },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-[rgba(255,255,255,0.5)] border-t border-gray-200 shadow-lg"
      aria-label="Primary"
    >
      <div className="mx-auto">
        <ul className="flex items-center justify-around text-xs font-medium">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path} // navigate to the route
                className={`w-full flex flex-col items-center py-2.5 px-3 transition-colors ${
                  item.path === "/"
                    ? location.pathname === "/" ||
                      location.pathname.startsWith("/live-bus") ||
                      location.pathname.startsWith("/recent-trips") ||
                      location.pathname.startsWith("/saved-place") ||
                      location.pathname.startsWith("/calendar-reminder")
                      ? "text-green-600"
                      : "text-gray-500 hover:bg-gray-100"
                    : location.pathname === item.path ||
                      location.pathname.startsWith(item.path)
                    ? "text-green-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {item.icon && (
                  <FontAwesomeIcon icon={item.icon} className="mb-1" />
                )}
                <span className="text-xs">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
