import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";

const CalendarReminder = () => {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tripName, setTripName] = useState("");
  const [note, setNote] = useState("");
  const [reminders, setReminders] = useState({}); // { 'Tue Sep 02 2025': [{tripName, note}] }

  const addReminder = () => {
    if (!tripName.trim()) return;

    const dateKey = selectedDate.toDateString();
    const newReminder = { tripName, note };
    setReminders((prev) => {
      const existing = prev[dateKey] || [];
      return { ...prev, [dateKey]: [...existing, newReminder] };
    });

    setTripName("");
    setNote("");
  };

  const deleteReminder = (index) => {
    const dateKey = selectedDate.toDateString();
    setReminders((prev) => {
      const updated = [...prev[dateKey]];
      updated.splice(index, 1);
      return { ...prev, [dateKey]: updated };
    });
  };

  const remindersForDate = reminders[selectedDate.toDateString()] || [];

  return (
    <div className="page bg-gray-100 min-h-screen p-10 max-w-xl mx-auto relative">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-green-600 font-semibold hover:text-green-800 z-50"
      >
        &larr; Back
      </button>

      <h1 className="text-xl text-center font-bold text-gray-700 mb-2">
        Calendar Reminder
      </h1>

      {/* Calendar */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          className="react-calendar border-none m-auto"
        />
        <p className="mt-2 text-gray-600 font-medium text-center">
          Selected date:{" "}
          <span className="text-green-600">{selectedDate.toDateString()}</span>
        </p>
      </div>

      {/* Add Reminder */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4 space-y-2">
        <input
          type="text"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          placeholder="Trip Name / Route"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note (e.g., catch bus at Ratnapark)"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={addReminder}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Add Reminder
        </button>
      </div>

      {/* Reminders List */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-gray-700 font-semibold mb-2">
          Reminders for {selectedDate.toDateString()}
        </h2>
        {remindersForDate.length === 0 && (
          <p className="text-gray-400">No reminders for this date.</p>
        )}
        <ul className="space-y-2">
          {remindersForDate.map((r, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-green-50 p-2 rounded"
            >
              <div>
                <p className="font-medium text-gray-800">{r.tripName}</p>
                {r.note && <p className="text-gray-600 text-sm">{r.note}</p>}
              </div>
              <button
                onClick={() => deleteReminder(i)}
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

export default CalendarReminder;
