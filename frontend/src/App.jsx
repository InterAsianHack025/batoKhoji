import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Navbar from "./components/Navbar";
// import RoutePage from "./components/Route";
import RoutePlanner from "./components/RoutePlanner";
import CalendarReminder from "./components/CalendarReminder";
import SavedPlace from "./components/SavedPlace";
// import ChatWidget from "./components/ChatWidget";
import LiveBusTracking from "./components/LiveBusTracking";
import RecentTrips from "./components/RecentTrips";
import { useTranslation } from "react-i18next";
// import { NotificationProvider } from "./components/NotificationContext";

import Home from "./pages/Home";
import RoutesPage from "./pages/Routes";
import Map from "./pages/Map";
// import Notifications from "./pages/Notifications";

import About from "./components/MenuRoutes/About";
import Services from "./components/MenuRoutes/Service";
import Contact from "./components/MenuRoutes/Contact";
import Settings from "./components/MenuRoutes/Settings";
import Help from "./components/MenuRoutes/Help";
import Feedback from "./components/MenuRoutes/Feedback";
import Profile from "./components/MenuRoutes/Profile";
function App() {
  return (
    <Router>
      {/* <NotificationProvider> */}
        <div className="App">
          <Header />

          {/* Content area */}
          <main className="mb-14 bg-gray-50 overflow-y-auto min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<Map />} />
              <Route path="/routes" element={<RoutesPage />} />
              {/* <Route path="routes/:id" element={<RoutePage />} /> */}
              {/* <Route path="/notifications" element={<Notifications />} /> */}
              <Route path="/live-bus" element={<LiveBusTracking />} />
              <Route path="/recent-trips" element={<RecentTrips />} />
              <Route path="/calendar-reminder" element={<CalendarReminder />} />
              <Route path="/saved-place" element={<SavedPlace />} />

              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>

          {/* Navbar */}
          <Navbar />

          {/* Floating Chat Widget */}
          {/* <ChatWidget /> */}
        </div>
      {/* </NotificationProvider> */}
    </Router>
  );
}

export default App;
