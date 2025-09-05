import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Navbar from "./components/Navbar";
import RoutePlanner from "./components/RoutePlanner";
import CalendarReminder from "./components/CalendarReminder";
import SavedPlace from "./components/SavedPlace";
import LiveBusTracking from "./components/LiveBusTracking";
import RecentTrips from "./components/RecentTrips";

const App = () => {
  return (
    <Router>
      <Header />
      <Navbar />
      <Routes>
        <Route path="/" element={<RecentTrips />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
        <Route path="/calendar-reminder" element={<CalendarReminder />} />
        <Route path="/saved-place" element={<SavedPlace />} />
        <Route path="/live-bus-tracking" element={<LiveBusTracking />} />
      </Routes>
    </Router>
  );
}

export default App;
