import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Navigation,
  RefreshCw,
  AlertCircle,
  Bus,
  Users,
  Zap,
  Phone,
} from "lucide-react";
import { useTranslation } from "react-i18next";


const LiveBusTracking = () => {
  const [selectedBus, setSelectedBus] = useState(null);
  const [buses, setBuses] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [userLocation, setUserLocation] = useState(null);
  const [nearestStop, setNearestStop] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [trackingError, setTrackingError] = useState(null);
  const mapRef = useRef(null);
  const intervalRef = useRef(null);

  // Mock bus data - replace with real API
  const mockBuses = [
    {
      id: "bus_25",
      busNumber: "25",
      route: "Ratna Park ↔ New Baneshwor",
      currentLocation: { lat: 27.7172, lng: 85.324 },
      heading: 45,
      speed: 15,
      capacity: 40,
      occupancy: 28,
      status: "moving",
      driver: "Ram Bahadur",
      phone: "+977-9841234567",
      nextStops: [
        { name: "Ratna Park", distance: 0.5, eta: 3 },
        { name: "New Road", distance: 1.2, eta: 7 },
        { name: "Basantapur", distance: 2.1, eta: 12 },
      ],
      lastUpdate: new Date(),
      batteryLevel: 85,
      isOnline: true,
    },
    {
      id: "bus_15",
      busNumber: "15",
      route: "Lagankhel ↔ Maharajgunj",
      currentLocation: { lat: 27.6966, lng: 85.3191 },
      heading: 180,
      speed: 20,
      capacity: 45,
      occupancy: 35,
      status: "moving",
      driver: "Shyam Thapa",
      phone: "+977-9851234567",
      nextStops: [
        { name: "Pulchowk", distance: 0.8, eta: 4 },
        { name: "Kupondole", distance: 1.5, eta: 8 },
        { name: "Tripureshwor", distance: 2.3, eta: 15 },
      ],
      lastUpdate: new Date(),
      batteryLevel: 92,
      isOnline: true,
    },
    {
      id: "bus_12",
      busNumber: "12",
      route: "Bhaktapur ↔ Kalanki",
      currentLocation: { lat: 27.7089, lng: 85.3059 },
      heading: 270,
      speed: 0,
      capacity: 35,
      occupancy: 12,
      status: "stopped",
      driver: "Hari Gurung",
      phone: "+977-9861234567",
      nextStops: [
        { name: "Bhaktapur Durbar Square", distance: 0, eta: 0 },
        { name: "Thimi", distance: 3.2, eta: 8 },
        { name: "Gatthaghar", distance: 5.1, eta: 15 },
      ],
      lastUpdate: new Date(Date.now() - 30000),
      batteryLevel: 45,
      isOnline: true,
    },
  ];

  useEffect(() => {
    setBuses(mockBuses);
    getUserLocation();
    startTracking();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
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
          setTrackingError("Unable to get your location");
        }
      );
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    intervalRef.current = setInterval(() => {
      updateBusPositions();
      setLastUpdated(new Date());
    }, 5000); // Update every 5 seconds
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const updateBusPositions = () => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        // Simulate bus movement
        const speedKmh = bus.speed;
        const speedMs = (speedKmh * 1000) / 3600; // Convert to m/s
        const timeInterval = 5; // 5 seconds
        const distance = speedMs * timeInterval; // Distance in meters

        if (bus.status === "moving" && speedKmh > 0) {
          // Simple simulation - move bus slightly based on heading
          const deltaLat =
            (distance / 111000) * Math.cos((bus.heading * Math.PI) / 180);
          const deltaLng =
            (distance / 111000) * Math.sin((bus.heading * Math.PI) / 180);

          return {
            ...bus,
            currentLocation: {
              lat: bus.currentLocation.lat + deltaLat,
              lng: bus.currentLocation.lng + deltaLng,
            },
            lastUpdate: new Date(),
            // Randomly update occupancy
            occupancy: Math.max(
              5,
              Math.min(
                bus.capacity,
                bus.occupancy +
                  (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)
              )
            ),
          };
        }

        return {
          ...bus,
          lastUpdate: new Date(),
        };
      })
    );
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceToUser = (bus) => {
    if (!userLocation) return null;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      bus.currentLocation.lat,
      bus.currentLocation.lng
    );
    return distance.toFixed(2);
  };

  const getStatusColor = (status, isOnline) => {
    if (!isOnline) return "text-gray-400 bg-gray-100";
    switch (status) {
      case "moving":
        return "text-green-600 bg-green-100";
      case "stopped":
        return "text-yellow-600 bg-yellow-100";
      case "offline":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const BusCard = ({ bus }) => {
    const distanceToUser = getDistanceToUser(bus);
    const occupancyPercentage = (bus.occupancy / bus.capacity) * 100;

    return (
      <div
        className={`bg-white rounded-lg p-4 shadow-sm border-2 transition-all cursor-pointer ${
          selectedBus?.id === bus.id
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => setSelectedBus(selectedBus?.id === bus.id ? null : bus)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                Bus {bus.busNumber}
              </h3>
              <p className="text-sm text-gray-600">{bus.route}</p>
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              bus.status,
              bus.isOnline
            )}`}
          >
            {bus.isOnline ? bus.status : "offline"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{bus.speed} km/h</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {bus.occupancy}/{bus.capacity}
            </span>
          </div>
          {distanceToUser && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {distanceToUser} km away
              </span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{bus.batteryLevel}%</span>
          </div>
        </div>

        {/* Occupancy Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Occupancy</span>
            <span>{Math.round(occupancyPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                occupancyPercentage > 80
                  ? "bg-red-500"
                  : occupancyPercentage > 60
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Next Stops */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Next Stops:</h4>
          {bus.nextStops.slice(0, 2).map((stop, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-700">{stop.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">{stop.distance} km</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                  {stop.eta} min
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Expanded Details */}
        {selectedBus?.id === bus.id && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Driver:
                </span>
                <span className="text-sm text-gray-900">{bus.driver}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Contact:
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">{bus.phone}</span>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Last Update:
                </span>
                <span className="text-sm text-gray-900">
                  {formatTime(bus.lastUpdate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Location:
                </span>
                <span className="text-sm text-gray-900">
                  {bus.currentLocation.lat.toFixed(4)},{" "}
                  {bus.currentLocation.lng.toFixed(4)}
                </span>
              </div>
            </div>

            {/* All Stops */}
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                All Upcoming Stops:
              </h5>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {bus.nextStops.map((stop, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-xs py-1"
                  >
                    <span className="text-gray-600">{stop.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">{stop.distance} km</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {stop.eta} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                Set Reminder
              </button>
              <button className="bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                Share Location
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Live Tracking
                </h1>
                <p className="text-xs text-gray-500">
                  Last updated: {formatTime(lastUpdated)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={isTracking ? stopTracking : startTracking}
                className={`p-2 rounded-full transition-colors ${
                  isTracking
                    ? "bg-red-100 hover:bg-red-200"
                    : "bg-green-100 hover:bg-green-200"
                }`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${
                    isTracking ? "text-red-600 animate-spin" : "text-green-600"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Status Banner */}
        <div
          className={`mb-6 p-4 rounded-lg border ${
            trackingError
              ? "bg-red-50 border-red-200"
              : isTracking
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {trackingError ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <div
                className={`w-3 h-3 rounded-full ${
                  isTracking ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                }`}
              />
            )}
            <span
              className={`text-sm font-medium ${
                trackingError
                  ? "text-red-800"
                  : isTracking
                  ? "text-green-800"
                  : "text-yellow-800"
              }`}
            >
              {trackingError ||
                (isTracking ? "Live tracking active" : "Tracking paused")}
            </span>
          </div>
          {!trackingError && (
            <p
              className={`text-xs mt-1 ${
                isTracking ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {isTracking
                ? `Tracking ${buses.length} buses • Updates every 5 seconds`
                : "Tap the refresh button to resume tracking"}
            </p>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {buses.length}
            </div>
            <div className="text-xs text-gray-600">Active Buses</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {buses.filter((b) => b.status === "moving").length}
            </div>
            <div className="text-xs text-gray-600">Moving</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {buses.filter((b) => b.status === "stopped").length}
            </div>
            <div className="text-xs text-gray-600">Stopped</div>
          </div>
        </div>

        {/* Bus List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Buses</h2>
          {buses.length === 0 ? (
            <div className="text-center py-12">
              <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No buses available
              </h3>
              <p className="text-gray-600">
                Check back later for live tracking data.
              </p>
            </div>
          ) : (
            buses.map((bus) => <BusCard key={bus.id} bus={bus} />)
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="flex items-center justify-center space-x-2 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                Find Nearest Bus
              </span>
            </button>
            <button className="flex items-center justify-center space-x-2 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Set Arrival Alert
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBusTracking;
