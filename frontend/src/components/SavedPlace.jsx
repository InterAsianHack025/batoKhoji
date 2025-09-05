import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SavedPlace = () => {
  const navigate = useNavigate();

  // Sample saved places state
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [placeName, setPlaceName] = useState("");
  const [note, setNote] = useState("");

  const addSavedPlace = () => {
    if (!placeName.trim()) return;
    setSavedPlaces([...savedPlaces, { placeName, note }]);
    setPlaceName("");
    setNote("");
  };

  const deleteSavedPlace = (index) => {
    const updated = [...savedPlaces];
    updated.splice(index, 1);
    setSavedPlaces(updated);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen relative">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-green-600 font-semibold hover:text-green-800 z-50"
      >
        &larr; Back
      </button>

      <h1 className="text-xl text-center font-bold text-gray-700 mb-2">Saved Places</h1>

      {/* Add New Place */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4 space-y-2">
        <input
          type="text"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          placeholder="Place / Stop Name"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note (e.g., near school, bus stop)"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={addSavedPlace}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Save Place
        </button>
      </div>

      {/* Saved Places List */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-gray-700 font-semibold mb-2">Your Saved Places</h2>
        {savedPlaces.length === 0 && (
          <p className="text-gray-400">No saved places yet.</p>
        )}
        <ul className="space-y-2">
          {savedPlaces.map((p, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-green-50 p-2 rounded"
            >
              <div>
                <p className="font-medium text-gray-800">{p.placeName}</p>
                {p.note && <p className="text-gray-600 text-sm">{p.note}</p>}
              </div>
              <button
                onClick={() => deleteSavedPlace(i)}
                className="text-red-500 font-semibold hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SavedPlace;
