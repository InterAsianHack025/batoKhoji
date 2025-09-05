import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Header from "./components/Header";
import Navbar from "./components/Navbar";
import RoutePage from "./components/Route";
import RoutePlanner from "./components/RoutePlanner";
import CalendarReminder from "./components/CalendarReminder";
import SavedPlace from "./components/SavedPlace";

import LiveBusTracking from "./components/LiveBusTracking";
import RecentTrips from "./components/RecentTrips";
import { useTranslation } from "react-i18next";

import Home from "./pages/Home";
import RoutesPage from "./pages/Routes";
import Map from "./pages/Map";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />

        {/* Content area */}
        <main className="mb-14 bg-gray-50 overflow-y-auto min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Map />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="routes/:id" element={<RoutePage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/live-bus" element={<LiveBusTracking />} />
            <Route path="/recent-trips" element={<RecentTrips />} />
            <Route path="/calendar-reminder" element={<CalendarReminder />} />
            <Route path="/saved-place" element={<SavedPlace />} />
          </Routes>
        </main>

    
        <Navbar />

      </div>
    </Router>
  );
}

export default App;
