import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import RoutePage from "../components/Route";
import { useTranslation } from "react-i18next";

import axios from "axios";

const Routes = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { from, to } = location.state || {};
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formattedRoutes, setFormattedRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch routes from backend
  useEffect(() => {
    axios
      .get("http://localhost:5001/api/bus-routes")
      .then((res) => {
        if (res.data.success) {
          const rawRoutes = res.data.data;
          setRoutes(rawRoutes);
          const formatted = rawRoutes.map((route) => ({
            id: route.id,
            busName: route.bus_number,
            routeName:
              i18n.language === "ne"
                ? route.route_name_nepali
                : route.route_name,
            routeNameNepali: route.route_name_nepali,
            stopsDetails: route.stops || [],
            fare: route.fare,
            estimatedTime: route.estimated_time,
            frequency: route.frequency,
          }));
          setFormattedRoutes(formatted);
        }
      })
      .catch((err) => {
        console.error("Error fetching routes:", err);
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, []);

  // Update formatted routes when language changes
  useEffect(() => {
    const formatted = routes.map((route) => ({
      id: route.id,
      busName: route.bus_number,
      routeName:
        i18n.language === "ne" ? route.route_name_nepali : route.route_name,
      routeNameNepali: route.route_name_nepali,
      stopsDetails: route.stops || [],
      fare: route.fare,
      estimatedTime: route.estimated_time,
      frequency: route.frequency,
    }));
    setFormattedRoutes(formatted);
  }, [routes, i18n.language]);

  // Filter routes based on from/to locations and search query
  useEffect(() => {
    if (!formattedRoutes.length) return;

    let filtered = formattedRoutes;

    // Filter by from/to if provided
    if (from || to) {
      filtered = formattedRoutes.filter((route) => {
        const stopNames = route.stopsDetails.flatMap((s) => [
          s.name.toLowerCase().trim(),
          s.name_nepali.trim(),
        ]);

        // Find exact matches or partial matches for from and to
        const fromMatches = stopNames.filter(
          (stop) =>
            stop.includes(from.toLowerCase().trim()) ||
            from.toLowerCase().trim().includes(stop)
        );

        const toMatches = stopNames.filter(
          (stop) =>
            stop.includes(to.toLowerCase().trim()) ||
            to.toLowerCase().trim().includes(stop)
        );

        if (fromMatches.length === 0 || toMatches.length === 0) {
          return false;
        }

        // Check if the route goes from 'from' location to 'to' location
        const fromIndex = stopNames.findIndex(
          (stop) =>
            stop.includes(from.toLowerCase().trim()) ||
            from.toLowerCase().trim().includes(stop)
        );

        const toIndex = stopNames.findIndex(
          (stop) =>
            stop.includes(to.toLowerCase().trim()) ||
            to.toLowerCase().trim().includes(stop)
        );

        return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
      });
    }

    // Further filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((route) => {
        // Check route name
        if (route.routeName.toLowerCase().includes(query)) return true;
        // Check bus number
        if (route.busName.toLowerCase().includes(query)) return true;
        // Check stop names
        return route.stopsDetails.some(
          (stop) =>
            stop.name.toLowerCase().includes(query) ||
            stop.name_nepali.includes(query)
        );
      });
    }

    setFilteredRoutes(filtered);
  }, [formattedRoutes, from, to, searchQuery]);

  // Handle route card click - navigate to map view with route
  const handleRouteClick = (route) => {
    navigate(`/routes/${route.id}`, {
      state: {
        selectedRoute: route,
        from,
        to,
      },
    });
  };

  // Handle show route button - navigate to map view
  const handleShowRoute = (e, route) => {
    e.stopPropagation(); // Prevent card click
    navigate("/map", {
      state: {
        selectedRoute: route,
        from,
        to,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="text-lg text-gray-600">
            {t("routes.loadingRoutes")}
          </div>
          <div className="mt-2 text-sm text-gray-400">
            {t("routes.findingRoutes")}
          </div>
        </div>
      </div>
    );
  }

  if (!filteredRoutes.length) {
    return (
      <div className="page bg-gray-100 min-h-screen p-10 max-w-xl mx-auto">
        <div className="max-w-md mx-auto px-4 pb-24">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {t("routes.noRoutesFound")}
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-gray-600 mb-4">
              {from && to ? (
                <>
                  {t("routes.noRoutesFromTo")} <strong>{from}</strong>{" "}
                  {t("routes.to")} <strong>{to}</strong>
                </>
              ) : (
                t("routes.noRoutesAvailable")
              )}
            </div>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              {t("routes.searchAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="page-routes"
      className="page bg-gray-100 min-h-screen p-10 max-w-xl mx-auto"
    >
      <div className="max-w-md mx-auto px-4 pb-24">
        {/* Routes Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {from && to
              ? t("routes.availableRoutes")
              : t("routes.allBusRoutes")}
          </h2>
          {from && to && (
            <p className="text-gray-600 text-sm">
              {t("routes.from")} <span className="font-semibold">{from}</span>{" "}
              {t("routes.to")} <span className="font-semibold">{to}</span>
            </p>
          )}
          {/* Search Bar */}
          <div className="mt-4">
            <input
              type="text"
              placeholder={t("routes.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">
            {t("routes.foundRoutes", { count: filteredRoutes.length })}
          </p>
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          {filteredRoutes.map((route) => (
            <div
              key={route.id}
              onClick={() => handleRouteClick(route)}
              className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-200 cursor-pointer relative hover:scale-[1.02]"
            >
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800 font-bold mb-1 text-lg">
                    {t("routes.bus")} {route.busName}
                  </h3>
                  <button
                    title="Download route information"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gray-100 border rounded-lg px-2 py-1 hover:bg-gray-200 transition text-xs"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                </div>

                <p className="font-semibold text-gray-600 mb-2 text-sm">
                  {route.routeName}
                </p>
              </div>

              {/* Route details */}
              <div className="text-xs text-gray-500 mb-3">
                <div className="flex items-center justify-between">
                  <span>
                    {t("routes.fare")}: {t("routes.npr")} {route.fare}
                  </span>
                  <span>
                    ~{route.estimatedTime} {t("routes.min")}
                  </span>
                </div>
                <div className="mt-1 text-xs">
                  {route.stopsDetails.length} {t("routes.stops")}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  className="bg-green-500 text-white text-xs px-3 py-1.5 font-medium rounded hover:bg-green-600 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRouteClick(route);
                  }}
                >
                  {t("routes.viewDetails")}
                </button>

                <button
                  className="bg-blue-500 text-white text-xs px-3 py-1.5 font-medium rounded hover:bg-blue-600 transition"
                  onClick={(e) => handleShowRoute(e, route)}
                >
                  {t("routes.showOnMap")}
                </button>
              </div>

              {/* Highlight matching stops if filtering */}
              {(from || to) && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    {t("routes.routeLabel")}{" "}
                    {route.stopsDetails
                      .slice(0, 3)
                      .map((stop) => stop.name)
                      .join(" → ")}
                    {route.stopsDetails.length > 3 && "..."}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Routes;
