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
  faBus,
  faLocationArrow,
  faPhone,
  faInfoCircle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const QuickActions = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  // State for nearby stops and popular routes
  const [nearbyStops, setNearbyStops] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Convert numbers to Nepali or English automatically
  const formatNumber = (num) => {
    return new Intl.NumberFormat(language === "ne" ? "ne-NP" : "en-US").format(
      num
    );
  };

  // Mock data - replace with real API calls
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
    // Simulate loading and fetch data
    setTimeout(() => {
      setNearbyStops(mockNearbyStops);
      setPopularRoutes(mockPopularRoutes);
      setLoading(false);
    }, 1000);

    // Get user location
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  };

  const handleStopClick = (stop) => {
    setSelectedStop(selectedStop?.id === stop.id ? null : stop);
  };

  const handleRouteClick = (route) => {
    setSelectedRoute(selectedRoute?.id === route.id ? null : route);
  };

  const navigateToStop = (stop) => {
    navigate(`/bus-stop/${stop.id}`, { state: { stop } });
  };

  const navigateToRoute = (route) => {
    navigate(`/route/${route.routeNumber}`, { state: { route } });
  };

  const trackRoute = (route) => {
    navigate("/live-bus", { state: { routeNumber: route.routeNumber } });
  };

  const planJourney = (destination) => {
    navigate("/", { state: { destination } });
  };

  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-700 mb-3">
        <FontAwesomeIcon icon={faRocket} className="text-green-600 mr-2" />
        {t("Quick Actions")}
      </h3>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/live-bus")}
          className="bg-white rounded-lg p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100"
        >
          <FontAwesomeIcon
            icon={faSatelliteDish}
            className="text-2xl text-gray-600 mb-2"
          />
          <p className="text-sm font-medium text-gray-700">
            {t("Live Bus Tracking")}
          </p>
        </button>

        <button
          onClick={() => navigate("/recent-trips")}
          className="bg-white rounded-lg p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100 relative"
        >
          <FontAwesomeIcon
            icon={faClock}
            className="text-2xl text-gray-500 bg-white rounded-full"
          />
          <p className="text-sm font-medium text-gray-700">
            {t("Recent Trips")}
          </p>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <button
          onClick={() => navigate("/saved-place")}
          className="bg-white rounded-lg p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100"
        >
          <FontAwesomeIcon
            icon={faBookmark}
            className="text-2xl text-gray-600 mb-2"
          />
          <p className="text-sm font-medium text-gray-700">
            {t("Saved Places")}
          </p>
        </button>

        <button
          onClick={() => navigate("/calendar-reminder")}
          className="bg-white rounded-lg p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100"
        >
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="text-2xl text-gray-600 mb-2"
          />
          <p className="text-sm font-medium text-gray-700">
            {t("CalendarReminder")}
          </p>
        </button>
      </div>

      {/* Interactive Nearby Bus Stops */}
      <section className="mb-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-700 flex items-center">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-green-600 mr-2"
            />
            {t("Nearby Bus Stops")}
          </h3>
          {loading && <div className="text-xs text-gray-500">Loading...</div>}
        </div>

        <div className="space-y-3">
          {nearbyStops.map((stop) => (
            <div
              key={stop.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleStopClick(stop)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {language === "ne" ? stop.name_nepali : stop.name}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-500">
                        {stop.distance} km away
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        Next: {stop.nextBus}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                      {formatNumber(stop.activeBuses)} buses
                    </span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className={`text-gray-400 transition-transform ${
                        selectedStop?.id === stop.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedStop?.id === stop.id && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                  <div className="pt-3 space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Available Routes:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {stop.routes.map((route) => (
                          <span
                            key={route}
                            className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
                          >
                            Route {route}
                          </span>
                        ))}
                      </div>
                    </div>

                    {stop.amenities && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Amenities:
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
                    )}

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigateToStop(stop)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => planJourney(stop.name)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                      >
                        Plan Journey
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Popular Routes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-700 flex items-center">
            <FontAwesomeIcon icon={faRoute} className="text-green-600 mr-2" />
            {t("Popular Routes")}
          </h3>
        </div>

        <div className="space-y-3">
          {popularRoutes.map((route) => (
            <div
              key={route.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleRouteClick(route)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="bg-green-600 text-white text-sm font-bold w-8 h-8 rounded flex items-center justify-center">
                      {route.routeNumber}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {language === "ne" ? route.name_nepali : route.name}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-500">{route.fare}</p>
                        <div className="flex items-center space-x-1">
                          <FontAwesomeIcon
                            icon={faStar}
                            className="text-yellow-500 text-xs"
                          />
                          <span className="text-xs text-gray-600">
                            {route.popularity}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                      {formatNumber(route.activeBuses)} active
                    </span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className={`text-gray-400 transition-transform ${
                        selectedRoute?.id === route.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedRoute?.id === route.id && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                  <div className="pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-600">Frequency</span>
                        <p className="text-sm font-medium">{route.frequency}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">
                          Total Stops
                        </span>
                        <p className="text-sm font-medium">
                          {formatNumber(route.totalStops)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-gray-600">
                        Operating Hours
                      </span>
                      <p className="text-sm font-medium">
                        {route.operatingHours}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => trackRoute(route)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <FontAwesomeIcon
                          icon={faSatelliteDish}
                          className="mr-1"
                        />
                        Track Live
                      </button>
                      <button
                        onClick={() => navigateToRoute(route)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                        View Route
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default QuickActions;
