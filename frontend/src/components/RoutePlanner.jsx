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
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          setFrom("📍 Current Location");
          findNearbyStops(location);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your current location. Please check your location permissions.");
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
    }
  };

  // Find nearby bus stops
  const findNearbyStops = (location) => {
    if (busStops.length === 0) return;
    
    const stopsWithDistance = busStops.map(stop => ({
      ...stop,
      distance: calculateDistance(
        location.latitude,
        location.longitude,
        stop.latitude,
        stop.longitude
      )
    }));
    
    // Sort by distance and get top 5
    const nearby = stopsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    
    setNearbyStops(nearby);
  };

  // Fetch bus stops on mount
  useEffect(() => {
    fetch("http://localhost:5001/api/bus-stops")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBusStops(data.data);
          // If user location is already available, find nearby stops
          if (userLocation) {
            findNearbyStops(userLocation);
          }
        }
      })
      .catch((err) => console.error("Error fetching bus stops:", err));
  }, []);

  // Update nearby stops when user location changes
  useEffect(() => {
    if (userLocation && busStops.length > 0) {
      findNearbyStops(userLocation);
    }
  }, [userLocation, busStops]);

  // Handle from input change
  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    if (value.trim() && value !== "📍 Current Location") {
      const filtered = busStops.filter((stop) =>
        stop.name.toLowerCase().includes(value.toLowerCase()) ||
        stop.name_nepali.toLowerCase().includes(value.toLowerCase())
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
    if (value.trim() && value !== "📍 Current Location") {
      const filtered = busStops.filter((stop) =>
        stop.name.toLowerCase().includes(value.toLowerCase()) ||
        stop.name_nepali.toLowerCase().includes(value.toLowerCase())
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

  // Find nearest bus stop to a location
  const findNearestBusStop = (searchText, coords = null) => {
    if (coords) {
      // If we have coordinates, find the nearest stop by distance
      const stopsWithDistance = busStops.map(stop => ({
        ...stop,
        distance: calculateDistance(
          coords.latitude,
          coords.longitude,
          stop.latitude,
          stop.longitude
        )
      }));
      return stopsWithDistance.sort((a, b) => a.distance - b.distance)[0];
    } else {
      // Find by name match
      return busStops.find(stop => 
        stop.name_nepali.toLowerCase() === searchText.toLowerCase() ||
        stop.name.toLowerCase() === searchText.toLowerCase()
      );
    }
  };

  // Find routes between two bus stops
  const findRoutesBetweenStops = async (fromStop, toStop) => {
    try {
      const response = await fetch(`http://localhost:5001/api/routes/search?from=${fromStop.id}&to=${toStop.id}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        // If direct routes found, navigate to the best one
        const bestRoute = data.data[0];
        navigate("/map", { 
          state: { 
            selectedRoute: bestRoute,
            fromStop,
            toStop,
            directRoute: true
          } 
        });
      } else {
        // No direct route found, but still go to map and let user see general routes
        navigate("/map", { 
          state: { 
            fromStop,
            toStop,
            directRoute: false,
            searchQuery: { from: fromStop.name_nepali, to: toStop.name_nepali },
            message: `No direct route found between ${fromStop.name_nepali} and ${toStop.name_nepali}. Showing all available routes.` 
          } 
        });
      }
    } catch (error) {
      console.error("Error finding routes:", error);
      // Always fallback to map, never to routes page
      navigate("/map", { 
        state: { 
          fromStop, 
          toStop,
          directRoute: false,
          searchQuery: { from: fromStop.name_nepali, to: toStop.name_nepali },
          error: "Error searching for routes. Showing all available routes."
        } 
      });
    }
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!from || !to) return;

    // Find the nearest bus stops for from and to locations
    let fromStop, toStop;

    // Handle "from" location
    if (from === "📍 Current Location" && userLocation) {
      fromStop = findNearestBusStop(null, userLocation);
    } else {
      fromStop = findNearestBusStop(from);
    }

    // Handle "to" location  
    if (to === "📍 Current Location" && userLocation) {
      toStop = findNearestBusStop(null, userLocation);
    } else {
      toStop = findNearestBusStop(to);
    }

    if (!fromStop) {
      alert(`Could not find bus stop for: ${from}`);
      return;
    }

    if (!toStop) {
      alert(`Could not find bus stop for: ${to}`);
      return;
    }

    if (fromStop.id === toStop.id) {
      alert("Starting and destination points are the same!");
      return;
    }

    // Find routes between the selected stops
    await findRoutesBetweenStops(fromStop, toStop);
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
              className="w-full pl-8 pr-20 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-600 bg-gray-50"
            />
            
            {/* Use Current Location Button */}
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs px-3 py-1.5 rounded-md flex items-center"
            >
              {isGettingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Getting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faLocationArrow} className="mr-1" />
                  GPS
                </>
              )}
            </button>
            
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

          {/* Nearby Stops Recommendations */}
          {nearbyStops.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faLocationArrow} className="text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Nearby Bus Stops</span>
              </div>
              <div className="space-y-1">
                {nearbyStops.map((stop) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => {
                      setFrom(stop.name_nepali);
                      setShowFromSuggestions(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs bg-white hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{stop.name_nepali}</div>
                    <div className="text-gray-600 flex justify-between">
                      <span>{stop.name}</span>
                      <span className="text-blue-600">{stop.distance.toFixed(2)} km</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
              className="w-full pl-8 pr-20 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-600 bg-gray-50"
            />
            
            {/* Use Current Location for Destination */}
            <button
              type="button"
              onClick={() => {
                if (userLocation) {
                  setTo("📍 Current Location");
                } else {
                  getCurrentLocation();
                }
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1.5 rounded-md flex items-center"
            >
              <FontAwesomeIcon icon={faLocationArrow} className="mr-1" />
              Here
            </button>
            
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