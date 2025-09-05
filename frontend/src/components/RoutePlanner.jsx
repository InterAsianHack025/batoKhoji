import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const RoutePlanner = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // Fetch bus stops logic can go here
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 mt-3 mx-auto max-w-xl">
      {/* Header */}
      <div className="flex items-center mb-4">
        <FontAwesomeIcon
          icon={faRoute}
          className="text-green-600 mr-2 text-lg sm:text-xl"
        />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
          {t("Route Planner") || "Route Planner"}
        </h2>
      </div>

      {/* Form */}
      <form>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t("Current Location") || "Current Location"}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={t("Destination") || "Destination"}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition-colors"
          >
            {t("Submit") || "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoutePlanner;
