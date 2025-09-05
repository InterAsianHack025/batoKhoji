import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Navbar from "./components/Navbar";
import QuickActions from "./components/ QuickActions";
import RoutePlanner from "./components/RoutePlanner";
import CalendarReminder from "./components/CalendarReminder";
import SavedPlace from "./components/SavedPlace";
import LiveBusTracking from "./components/LiveBusTracking";
import RecentTrips from "./components/RecentTrips";

import Home from "./pages/Home";
import Map from "./pages/Map";
import RoutesPage from "./pages/Routes";

const App = () => {
  return (
    <Router>
      <Header />
      <RoutePlanner />
      <QuickActions />
      <Navbar />
      <Routes>
        <Route path="/" element={<RecentTrips />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
        <Route path="/calendar-reminder" element={<CalendarReminder />} />
        <Route path="/saved-place" element={<SavedPlace />} />
        <Route path="/live-bus-tracking" element={<LiveBusTracking />} />

        <Route path="/map" element={<Map />} />

        <Route path="/routes" element={<Routes />} />
      </Routes>
    </Router>
  );
};

export default App;
