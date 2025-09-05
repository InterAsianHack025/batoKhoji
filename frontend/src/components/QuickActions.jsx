import React, { useState, useEffect } from "react";
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
  faStar,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const QuickActions = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const [nearbyStops, setNearbyStops] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatNumber = (num) =>
    new Intl.NumberFormat(language === "ne" ? "ne-NP" : "en-US").format(num);

  const mockNearbyStops = [
    {
      id: 1,
      name: "Koteshwor",
      name_nepali: "कोटेश्वर",
      distance: 0.2,
      activeBuses: 3,
      nextBus: "5 min",
      routes: ["15", "25", "12"],
      amenities: ["shelter", "seating"],
    },
    {
      id: 2,
      name: "New Baneshwor",
      name_nepali: "नयाँ बानेश्वर",
      distance: 0.5,
      activeBuses: 2,
      nextBus: "8 min",
      routes: ["25", "18"],
      amenities: ["shelter"],
    },
    {
      id: 3,
      name: "Maitighar",
      name_nepali: "माइतीघर",
      distance: 0.8,
      activeBuses: 4,
      nextBus: "3 min",
      routes: ["15", "12", "20", "8"],
      amenities: ["shelter", "seating", "vendor"],
    },
  ];

  const mockPopularRoutes = [
    {
      id: 1,
      routeNumber: "25",
      name: "Ratna Park ↔ New Baneshwor",
      name_nepali: "रत्न पार्क ↔ नयाँ बानेश्वर",
      fare: "Rs. 20-35",
      popularity: 95,
      frequency: "5-10 min",
      operatingHours: "5:30 AM - 9:30 PM",
      totalStops: 25,
      activeBuses: 12,
    },
    {
      id: 2,
      routeNumber: "15",
      name: "Lagankhel ↔ Maharajgunj",
      name_nepali: "लगनखेल ↔ महाराजगंज",
      fare: "Rs. 25-40",
      popularity: 88,
      frequency: "8-15 min",
      operatingHours: "6:00 AM - 9:00 PM",
      totalStops: 30,
      activeBuses: 8,
    },
    {
      id: 3,
      routeNumber: "12",
      name: "Bhaktapur ↔ Kalanki",
      name_nepali: "भक्तपुर ↔ कलंकी",
      fare: "Rs. 30-50",
      popularity: 75,
      frequency: "10-20 min",
      operatingHours: "5:45 AM - 8:30 PM",
      totalStops: 35,
      activeBuses: 6,
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setNearbyStops(mockNearbyStops);
      setPopularRoutes(mockPopularRoutes);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleStop = (stop) =>
    setSelectedStop(selectedStop?.id === stop.id ? null : stop);
  const toggleRoute = (route) =>
    setSelectedRoute(selectedRoute?.id === route.id ? null : route);

  return (
    <div className="mb-6 max-w-xl mx-auto">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
        <FontAwesomeIcon icon={faRocket} className="text-green-600 mr-2" />
        {t("Quick Actions")}
      </h3>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <QuickActionButton
          icon={faSatelliteDish}
          label={t("Live Bus Tracking")}
          onClick={() => navigate("/live-bus")}
        />
        <QuickActionButton
          icon={faClock}
          label={t("Recent Trips")}
          onClick={() => navigate("/recent-trips")}
        />
        <QuickActionButton
          icon={faBookmark}
          label={t("Saved Places")}
          onClick={() => navigate("/saved-place")}
        />
        <QuickActionButton
          icon={faCalendarAlt}
          label={t("Calendar Reminder")}
          onClick={() => navigate("/calendar-reminder")}
        />
      </div>

      {/* Nearby Stops */}
      <section className="mb-6">
        <SectionHeader
          icon={faMapMarkerAlt}
          title={t("Nearby Bus Stops")}
          loading={loading}
        />
        <div className="space-y-3">
          {nearbyStops.map((stop) => (
            <ExpandableCard
              key={stop.id}
              expanded={selectedStop?.id === stop.id}
              onClick={() => toggleStop(stop)}
            >
              <CardHeader
                title={language === "ne" ? stop.name_nepali : stop.name}
                subtitle={`${stop.distance} km away`}
                badge={`${formatNumber(stop.activeBuses)} buses`}
              />
              <CardBody show={selectedStop?.id === stop.id}>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    {t("Available Routes")}:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {stop.routes.map((route) => (
                      <span
                        key={route}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
                      >
                        {t("Route")} {route}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    {t("Amenities")}:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {stop.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg"
                    onClick={() =>
                      navigate(`/bus-stop/${stop.id}`, { state: { stop } })
                    }
                  >
                    {t("View Details")}
                  </button>
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg"
                    onClick={() =>
                      navigate("/", { state: { destination: stop.name } })
                    }
                  >
                    {t("Plan Journey")}
                  </button>
                </div>
              </CardBody>
            </ExpandableCard>
          ))}
        </div>
      </section>

      {/* Popular Routes */}
      <section>
        <SectionHeader icon={faRoute} title={t("Popular Routes")} />
        <div className="space-y-3">
          {popularRoutes.map((route) => (
            <ExpandableCard
              key={route.id}
              expanded={selectedRoute?.id === route.id}
              onClick={() => toggleRoute(route)}
            >
              <CardHeader
                title={language === "ne" ? route.name_nepali : route.name}
                subtitle={route.fare}
                badge={`${formatNumber(route.activeBuses)} active`}
                numberBadge={route.routeNumber}
              />
              <CardBody show={selectedRoute?.id === route.id}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-600">
                      {t("Frequency")}
                    </span>
                    <p className="text-sm font-medium">{route.frequency}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">
                      {t("Total Stops")}
                    </span>
                    <p className="text-sm font-medium">
                      {formatNumber(route.totalStops)}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-gray-600">
                    {t("Operating Hours")}
                  </span>
                  <p className="text-sm font-medium">{route.operatingHours}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg flex justify-center items-center"
                    onClick={() =>
                      navigate("/live-bus", {
                        state: { routeNumber: route.routeNumber },
                      })
                    }
                  >
                    <FontAwesomeIcon icon={faSatelliteDish} className="mr-1" />{" "}
                    {t("Track Live")}
                  </button>
                  <button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg flex justify-center items-center"
                    onClick={() =>
                      navigate(`/route/${route.routeNumber}`, {
                        state: { route },
                      })
                    }
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />{" "}
                    {t("View Route")}
                  </button>
                </div>
              </CardBody>
            </ExpandableCard>
          ))}
        </div>
      </section>
    </div>
  );
};

/* --- Helper Components --- */
const QuickActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-lg p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center"
  >
    <FontAwesomeIcon icon={icon} className="text-2xl text-gray-600 mb-2" />
    <p className="text-sm font-medium text-gray-700">{label}</p>
  </button>
);

const SectionHeader = ({ icon, title, loading }) => (
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-base font-semibold text-gray-700 flex items-center">
      <FontAwesomeIcon icon={icon} className="text-green-600 mr-2" />
      {title}
    </h3>
    {loading && <span className="text-xs text-gray-500">Loading...</span>}
  </div>
);

const ExpandableCard = ({ expanded, children, onClick }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100">
    <div onClick={onClick} className="cursor-pointer">
      {children}
    </div>
  </div>
);

const CardHeader = ({ title, subtitle, badge, numberBadge }) => (
  <div className="p-4 flex items-center justify-between">
    <div className="flex items-center space-x-3 flex-1">
      {numberBadge && (
        <span className="bg-green-600 text-white text-sm font-bold w-8 h-8 rounded flex items-center justify-center">
          {numberBadge}
        </span>
      )}
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="flex items-center space-x-4 mt-1">
          <p className="text-sm text-gray-500">{subtitle}</p>
          {badge && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-600">{badge}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const CardBody = ({ show, children }) =>
  show ? (
    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
      {children}
    </div>
  ) : null;

export default QuickActions;
