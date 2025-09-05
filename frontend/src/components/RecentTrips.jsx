import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RecentTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ===== SAMPLE DATA (for testing UI without backend) =====
    const sampleData = [
      { start: "Koteshwor", end: "Ratna Park", date: "2025-08-30", fare: 20 },
      { start: "Lagankhel", end: "Koteshwor", date: "2025-08-28", fare: 25 },
      { start: "Bhaktapur", end: "Ratna Park", date: "2025-08-25", fare: 30 },
    ];
    setTrips(sampleData);
    setLoading(false);

    // ===== REAL DATA FETCH (comment out above sampleData when ready) =====
    /*
    fetch("http://localhost:5000/api/recent-trips")
      .then((res) => res.json())
      .then((data) => {
        setTrips(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching trips:", err);
        setLoading(false);
      });
    */
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-10 max-w-xl mx-auto relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-green-600 font-semibold hover:text-green-800 z-50"
      > 
        &larr; Back
      </button>

      <h2 className="text-lg font-bold mb-3 text-center">Recent Trips</h2>

      {loading && <p className="text-gray-500">Loading trips...</p>}

      {!loading && trips.length === 0 && (
        <p className="text-gray-500">No recent trips found.</p>
      )}

      <div className="space-y-3">
        {trips.map((trip, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium text-gray-900">
                {trip.start} → {trip.end}
              </h4>
              <p className="text-sm text-gray-500">
                {trip.date} • {trip.fare} Rs.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTrips;
