import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faMapMarkerAlt, 
  faClock, 
  faMoneyBill, 
  faRoute,
  faMap
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import axios from "axios";

const RoutePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buses, setBuses] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  
  // Get from/to from state if available
  const { selectedRoute, from, to } = location.state || {};

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Kathmandu center if location not available
          setUserLocation({
            latitude: 27.7172,
            longitude: 85.3240
          });
        }
      );
    } else {
      // Default location
      setUserLocation({
        latitude: 27.7172,
        longitude: 85.3240
      });
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };

  useEffect(() => {
    getUserLocation();
    
    // If we have selectedRoute from state, use it
    if (selectedRoute && selectedRoute.id === parseInt(id)) {
      // Format the route data if not already formatted
      let formattedSelectedRoute = selectedRoute;
      if (!selectedRoute.stopsDetails) {
        const stops = selectedRoute.stops || [];
        const stopsDetails = stops.map((stop, i) => ({
          name: stop.name,
          name_nepali: stop.nameNepali,
          latitude: stop.lat,
          longitude: stop.lng,
        }));
        
        formattedSelectedRoute = {
          ...selectedRoute,
          busName: selectedRoute.bus_number,
          routeName: selectedRoute.route,
          stopsDetails,
          fare: selectedRoute.fare || Math.floor(Math.random() * 100) + 50,
          estimatedTime: selectedRoute.estimatedTime || Math.floor(Math.random() * 60) + 30
        };
      }
      
      setRoute(formattedSelectedRoute);
      fetchBuses(selectedRoute.id);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    const fetchRoute = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/buses");
        if (response.data.success) {
          const foundRoute = response.data.data.find(bus => bus.id === parseInt(id));
          
          if (foundRoute) {
            // Format the route data
            const stops = foundRoute.stops || [];
            const stopsDetails = stops.map((stop, i) => ({
              name: stop.name,
              name_nepali: stop.nameNepali,
              latitude: stop.lat,
              longitude: stop.lng,
            }));
            
            const formattedRoute = {
              ...foundRoute,
              busName: foundRoute.bus_number,
              routeName: foundRoute.route,
              stopsDetails,
              fare: foundRoute.fare || Math.floor(Math.random() * 100) + 50,
              estimatedTime: foundRoute.estimatedTime || Math.floor(Math.random() * 60) + 30
            };
            
            setRoute(formattedRoute);
            fetchBuses(foundRoute.id);
          } else {
            setError("Route not found");
          }
        } else {
          setError("Failed to fetch route data");
        }
      } catch (err) {
        console.error("Error fetching route:", err);
        setError("Failed to load route information");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id, selectedRoute]);

  const fetchBuses = async (routeId) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/route/${routeId}/buses`);
      if (response.data.success) {
        setBuses(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching buses:", err);
    }
  };

  const handleViewOnMap = () => {
    navigate('/map', { 
      state: { 
        selectedRoute: route,
        from,
        to
      } 
    });
  };

  const getStopIcon = (stopName, index, totalStops) => {
    if (from && stopName.toLowerCase().includes(from.toLowerCase().trim())) {
      return "🟡"; // Yellow for 'from' location
    }
    if (to && stopName.toLowerCase().includes(to.toLowerCase().trim())) {
      return "🟢"; // Green for 'to' location  
    }
    if (index === 0) return "🔵"; // Blue for start
    if (index === totalStops - 1) return "🔴"; // Red for end
    return "⚪"; // White for regular stops
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-pulse text-center">
          <div className="text-lg text-gray-600">Loading route details...</div>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">
              {error || "Route not found"}
            </div>
            <button
              onClick={() => navigate('/routes')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition mt-4"
            >
              Back to Routes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-6 left-2 text-green-600 font-semibold hover:text-green-800 z-50"
            >
              &larr; Back
            </button>
          <div  className="flex items-center justify-end gap-35">
            <h1 className="text-xl text-center font-bold text-gray-800">
              Bus {route.busName}
            </h1>
            <button
              onClick={handleViewOnMap}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="View on Map"
            >
              <FontAwesomeIcon icon={faMap} className="text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Route Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {route.routeName}
              </h2>
              <p className="text-gray-600 text-sm">Bus Number: {route.busName}</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                Active
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <FontAwesomeIcon icon={faMoneyBill} className="text-green-500 mb-2" />
              <div className="text-sm text-gray-600">Fare</div>
              <div className="font-semibold text-gray-800">NPR {route.fare}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <FontAwesomeIcon icon={faClock} className="text-blue-500 mb-2" />
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-semibold text-gray-800">~{route.estimatedTime}m</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <FontAwesomeIcon icon={faRoute} className="text-purple-500 mb-2" />
              <div className="text-sm text-gray-600">Stops</div>
              <div className="font-semibold text-gray-800">{route.stopsDetails ? route.stopsDetails.length : 0}</div>
            </div>
          </div>

          {/* Journey Summary */}
          {(from || to) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Your Journey</h3>
              <div className="text-sm text-blue-700">
                {from && <div>From: <strong>{from}</strong></div>}
                {to && <div>To: <strong>{to}</strong></div>}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleViewOnMap}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faMap} className="mr-2" />
            View Route on Map
          </button>
        </div>

        {/* Nearby Buses */}
        {buses.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-blue-500" />
              Nearby Buses on This Route ({buses.length})
            </h3>

            <div className="">
              {buses.map((bus) => {
                const distance = userLocation ? calculateDistance(
                  userLocation.latitude, 
                  userLocation.longitude, 
                  bus.latitude, 
                  bus.longitude
                ) : null;

                return (
                  <div
                    key={bus.id}
                    onClick={() => setSelectedBus(bus)}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedBus && selectedBus.id === bus.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                          {bus.bus_number}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            Bus {bus.bus_number}
                          </div>
                          <div className="text-sm text-gray-600">
                            Near: {i18n.language === 'ne' ? bus.current_stop_nepali : bus.current_stop}
                          </div>
                          <div className="text-xs text-gray-500">
                            Direction: {bus.direction}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {distance !== null && (
                          <div className="text-sm font-semibold text-blue-600">
                            {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Lat: {bus.latitude.toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Lng: {bus.longitude.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    
                    {selectedBus && selectedBus.id === bus.id && (
                      <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Bus Details</h4>
                        <div className="text-sm text-blue-700">
                          <div>Current Location: {i18n.language === 'ne' ? bus.current_stop_nepali : bus.current_stop}</div>
                          <div>Direction: {bus.direction}</div>
                          {distance !== null && (
                            <div>Distance from you: {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stops List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-red-500" />
            All Stops ({route.stopsDetails ? route.stopsDetails.length : 0})
          </h3>

          <div className="space-y-3">
            {route.stopsDetails && route.stopsDetails.map((stop, index) => {
              const isFromStop = from && (stop.name.toLowerCase().includes(from.toLowerCase().trim()) || stop.name_nepali.includes(from.trim()));
              const isToStop = to && (stop.name.toLowerCase().includes(to.toLowerCase().trim()) || stop.name_nepali.includes(to.trim()));
              const isHighlighted = isFromStop || isToStop;

              return (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    isHighlighted 
                      ? 'bg-amber-50 border-2 border-amber-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm mr-3">
                    <span className="text-lg">
                      {getStopIcon(stop.name, index, route.stopsDetails ? route.stopsDetails.length : 0)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className={`font-medium ${isHighlighted ? 'text-amber-800' : 'text-gray-800'}`}>
                      {i18n.language === 'ne' ? stop.name_nepali : stop.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Stop {index + 1} • Lat: {stop.latitude.toFixed(4)}, Lng: {stop.longitude.toFixed(4)}
                    </div>
                    {isHighlighted && (
                      <div className="text-xs font-semibold text-amber-600 mt-1">
                        {isFromStop && "📍 Your pickup point"}
                        {isToStop && "🎯 Your destination"}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-xs text-gray-500">
                    {index === 0 && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Start</span>}
                    {route.stopsDetails && index === route.stopsDetails.length - 1 && <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">End</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Route Navigation Helper */}
          {from && to && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Trip Summary</h4>
              <div className="text-sm text-green-700">
                <div className="flex justify-between items-center">
                  <span>Distance:</span>
                  <span className="font-medium">
                    {route.stopsDetails ? Math.abs(
                      route.stopsDetails.findIndex(s => 
                        s.name.toLowerCase().includes(to.toLowerCase().trim()) || (s.name_nepali && s.name_nepali.includes(to.trim()))
                      ) - 
                      route.stopsDetails.findIndex(s => 
                        s.name.toLowerCase().includes(from.toLowerCase().trim()) || (s.name_nepali && s.name_nepali.includes(from.trim()))
                      )
                    ) : 0} stops
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Estimated Time:</span>
                  <span className="font-medium">~{Math.floor(route.estimatedTime * 0.7)}m</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Actions */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/routes')}
            className="bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Other Routes
          </button>
          <button
            onClick={() => {
              // This could trigger a download or sharing feature
              alert(`Route details for Bus ${route.busName} saved!`);
            }}
            className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-medium"
          >
            Save Route
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutePage;