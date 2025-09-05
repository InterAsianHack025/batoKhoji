import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoute,
  faCircle,
  faLocationArrow,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const RoutePlanner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busStops, setBusStops] = useState([]);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Fetch bus stops on mount
  useEffect(() => {
    fetch("http://localhost:5001/api/bus-stops")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBusStops(data.data);
        }
      })
      .catch((err) => console.error("Error fetching bus stops:", err));
  }, []);

  // Handle from input change
  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    if (value.trim()) {
      const filtered = busStops.filter((stop) =>
        stop.name.toLowerCase().includes(value.toLowerCase()) ||
        stop.name_nepali.includes(value)
      );
      setFromSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
      setShowFromSuggestions(true);
    } else {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
    }
  };

  // Handle to input change
  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
    if (value.trim()) {
      const filtered = busStops.filter((stop) =>
        stop.name.toLowerCase().includes(value.toLowerCase()) ||
        stop.name_nepali.includes(value)
      );
      setToSuggestions(filtered.slice(0, 5));
      setShowToSuggestions(true);
    } else {
      setToSuggestions([]);
      setShowToSuggestions(false);
    }
  };

  // Select suggestion for from
  const selectFromSuggestion = (stop) => {
    setFrom(stop.name_nepali);
    setShowFromSuggestions(false);
  };

  // Select suggestion for to
  const selectToSuggestion = (stop) => {
    setTo(stop.name_nepali);
    setShowToSuggestions(false);
  };

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to) return;

    // Navigate to Routes page and pass the input values
    navigate("/routes", { state: { from, to } });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center mb-4">
        <FontAwesomeIcon icon={faRoute} className="text-green-600 mr-2" />

        <h2 className="text-lg font-semibold text-gray-700">{t("routePlanner.title")}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Current Location Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FontAwesomeIcon
                icon={faCircle}
                className="text-gray-400 text-xs"
              />
            </div>
            <input
              type="text"
              placeholder={t("routePlanner.currentLocation")}
              value={from}
              onChange={handleFromChange}
              required
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-600 bg-gray-50"
            />
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                {fromSuggestions.map((stop) => (
                  <li
                    key={stop.id}
                    onClick={() => selectFromSuggestion(stop)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-medium">{stop.name_nepali}</div>
                    <div className="text-sm text-gray-500">{stop.name}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Destination Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FontAwesomeIcon
                icon={faLocationArrow}
                className="text-gray-400 text-xs"
              />
            </div>
            <input
              type="text"
              placeholder={t("routePlanner.destination")}
              value={to}
              onChange={handleToChange}
              required
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-600 bg-gray-50"
            />
            {showToSuggestions && toSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                {toSuggestions.map((stop) => (
                  <li
                    key={stop.id}
                    onClick={() => selectToSuggestion(stop)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-medium">{stop.name_nepali}</div>
                    <div className="text-sm text-gray-500">{stop.name}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faSearch} className="mr-2" />
            {t("routePlanner.findRoute")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoutePlanner;
