import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSatelliteDish,
  faClock,
  faBookmark,
  faCalendarAlt,
  faMapMarkerAlt,
  faRoute,
  faRocket,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";//harina

const QuickActions = () => {
  const navigate = useNavigate();
   const { t, i18n } = useTranslation(); // translation hook harina
   const language = i18n.language; // current language

   //by harina
 // Helper: Convert numbers to Nepali or English automatically
  const formatNumber = (num) => {
    return new Intl.NumberFormat(language === "ne" ? "ne-NP" : "en-US").format(num);
  };

  // Popular routes data
  const popularRoutes = [
    { name: t("quickActions.route1"), fare: t("quickActions.fare1") },
    { name: t("quickActions.route2"), fare: t("quickActions.fare2") },
    { name: t("quickActions.route3"), fare: t("quickActions.fare3") },
  ];

    // Nearby bus stops data
  const nearbyStops = [
    { name: t("quickActions.koteswor"), distance: t("quickActions.distance") },
    // Add more stops as needed
  ];

  //old
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-700 mb-3">
        <FontAwesomeIcon icon={faRocket} className="text-green-600 mr-2" />
        {t("quickActions.title")}
      </h3>
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Live Bus Tracking */}
        <button
          onClick={() => navigate("/live-bus")}
          className="bg-white rounded-lg p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100"
        >
          <FontAwesomeIcon
            icon={faSatelliteDish}
            className="text-2xl text-gray-600 mb-2"
          />
          <p className="text-sm font-medium text-gray-700">{t("quickActions.liveBus")}</p>
        </button>

        {/* Recent Trips */}
        <button
          onClick={() => navigate("/recent-trips")}
          className="bg-white rounded-lg p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100 relative"
        >
          <FontAwesomeIcon
            icon={faClock}
            className="text-2xl text-gray-500 bg-white rounded-full"
          />
          <p className="text-sm font-medium text-gray-700">{t("quickActions.recentTrips")}</p>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Saved Place */}
        <button
          onClick={() => navigate("/saved-place")}
          className="bg-white rounded-lg p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100"
        >
          <FontAwesomeIcon
            icon={faBookmark}
            className="text-2xl text-gray-600 mb-2"
          />
          <p className="text-sm font-medium text-gray-700">{t("quickActions.savedPlace")}</p>
        </button>

        {/* Calendar Reminder */}
        <button
          onClick={() => navigate("/calendar-reminder")}
          className="bg-white rounded-lg p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100"
        >
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="text-2xl text-gray-600 mb-2"
          />
          <p className="text-sm font-medium text-gray-700">{t("quickActions.calendarReminder")}</p>
        </button>
      </div>

      {/* Nearby Bus Stops */}
      <section id="nearbyStopsSection" className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base mt-7 font-semibold text-gray-700 flex items-center">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-green-600 mr-2"
            />
           {t("quickActions.nearbyBusStops")}
          </h3>
        </div>
        <div id="nearbyStopsList" className="space-y-3">
          {/* Sample nearby stop */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{t("quickActions.koteswor")}</h4>
                <p className="text-sm text-gray-500">{t("quickActions.distance")}</p>
              </div>
              <span className="bg-green-600 text-white text-sm font-bold w-6 h-6 rounded flex items-center justify-center">
               {formatNumber(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section id="popularRoutesSection">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-700 flex items-center">
            <FontAwesomeIcon icon={faRoute} className="text-green-600 mr-2" />
            {t("quickActions.popularRoutes")}
          </h3>
        </div>
        <div id="popularRoutesList" className="space-y-3">
          
          {/* Sample routes */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="bg-green-600 text-white text-sm font-bold w-6 h-6 rounded flex items-center justify-center">
                  {t("quickActions.step1")}
                </span>
                <div>
                  <h4 className="font-medium text-gray-900">
                   {t("quickActions.route1")}
                  </h4>
                  <p className="text-sm text-gray-500">{t("quickActions.fare1")}</p>
                </div>
              </div>
              <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="bg-green-600 text-white text-sm font-bold w-6 h-6 rounded flex items-center justify-center">
                 {t("quickActions.step2")}
                </span>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {t("quickActions.route2")}
                  </h4>
                  <p className="text-sm text-gray-500">{t("quickActions.fare2")}</p>
                </div>
              </div>
              <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="bg-green-600 text-white text-sm font-bold w-6 h-6 rounded flex items-center justify-center">
                  {t("quickActions.step3")}
                </span>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {t("quickActions.route3")}
                  </h4>
                  <p className="text-sm text-gray-500">{t("quickActions.fare3")}</p>
                </div>
              </div>
              <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuickActions;
