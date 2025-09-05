import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/buses");
        if (response.data.success) {
          setRoutes(response.data.data);
        } else {
          setError("Failed to fetch routes");
        }
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError("Failed to load routes");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleRouteClick = (route) => {
    navigate(`/route/${route.id}`, { 
      state: { 
        selectedRoute: route
      } 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-pulse text-center">
          <div className="text-lg text-gray-600">Loading routes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 text-center">Bus Routes</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Available Routes</h2>
          
          <div className="space-y-3">
            {routes.map((route) => (
              <div
                key={route.id}
                onClick={() => handleRouteClick(route)}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {route.bus_number} - {route.route}
                    </div>
                    <div className="text-sm text-gray-600">
                      Fare: NPR {route.fare} • Time: ~{route.estimatedTime}m
                    </div>
                  </div>
                  <div className="text-blue-500">
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutesPage;