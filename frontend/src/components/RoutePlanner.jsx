import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
// import { useNavigate } from "react-router-dom";

const RoutePlanner = () => {
  const { t } = useTranslation();
  // const navigate = useNavigate();

  // Commented out state and handlers to avoid ReferenceError
  /*
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busStops, setBusStops] = useState([]);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  */

  // Fetch bus stops on mount
  useEffect(() => {
    /*
    fetch("http://localhost:5001/api/bus-stops")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBusStops(data.data);
        }
      })
      .catch((err) => console.error("Error fetching bus stops:", err));
    */
  }, []);

  // Handlers commented out
  /*
  const handleFromChange = (e) => { ... };
  const handleToChange = (e) => { ... };
  const selectFromSuggestion = (stop) => { ... };
  const selectToSuggestion = (stop) => { ... };
  const handleSubmit = (e) => { ... };
  */

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center mb-4">
        <FontAwesomeIcon icon={faRoute} className="text-green-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-700">RoutePlanner</h2>
      </div>

      {/* Form commented out */}

      {/* <form onSubmit={handleSubmit}> */}
      <form>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Current Location"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Destination"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoutePlanner;
