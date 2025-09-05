
import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Bus,
  MapPin,
  Calendar,
  CheckCircle,
  Settings,
} from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    busAlerts: true,
    routeUpdates: true,
    calendarReminders: true,
    systemAlerts: true,
    soundEnabled: true,
    pushEnabled: true,
  });

  // Initial notifications and real-time updates
  useEffect(() => {
    fetchInitialNotifications();
    const interval = setInterval(addRandomNotification, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchInitialNotifications = () => {
    const initial = [
      {
        id: 1,
        type: "bus_alert",
        title: "Bus 25 Delayed",
        message: "Your bus is running 10 minutes late.",
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
        priority: "high",
        icon: Bus,
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        actionable: true,
        actions: ["View Route", "Find Alternative"],
      },
      {
        id: 2,
        type: "route_update",
        title: "Route Change Alert",
        message: "Temporary route diversion on Ratna Park.",
        timestamp: new Date(Date.now() - 15 * 60000),
        read: false,
        priority: "medium",
        icon: MapPin,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        actionable: true,
        actions: ["View Map", "See Details"],
      },
    ];
    setNotifications(initial);
    setUnreadCount(initial.filter((n) => !n.read).length);
  };

  const addRandomNotification = () => {
    const types = [
      {
        type: "bus_alert",
        title: "Bus Arriving Soon",
        message: "Bus 15 will arrive in 3 minutes.",
        icon: Bus,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        actions: ["Track Live", "Get Directions"],
      },
      {
        type: "system_alert",
        title: "System Update",
        message: "Live tracking now available for all routes!",
        icon: CheckCircle,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        actions: [],
      },
      {
        type: "calendar_reminder",
        title: "Meeting Reminder",
        message: "Board bus at 2:30 PM for your 3:00 PM meeting.",
        icon: Calendar,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        actions: ["Set Alarm", "View Route"],
      },
    ];

    const random = types[Math.floor(Math.random() * types.length)];
    const newNotification = {
      ...random,
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
      actionable: random.actions.length > 0,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => {
      const notif = prev.find((n) => n.id === id);
      if (notif && !notif.read)
        setUnreadCount((count) => Math.max(0, count - 1));
      return prev.filter((n) => n.id !== id);
    });
  };

  const handleAction = (id, action) => {
    console.log(`Action "${action}" triggered for notification ${id}`);
    markAsRead(id);
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;
    if (filter === "unread") filtered = filtered.filter((n) => !n.read);
    else if (filter !== "all")
      filtered = filtered.filter((n) => n.type === filter);

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return filtered.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority])
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  };

  const formatTimestamp = (timestamp) => {
    const diffMins = Math.floor((new Date() - timestamp) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getTypeLabel = (type) =>
    ({
      bus_alert: "Bus Alert",
      route_update: "Route Update",
      calendar_reminder: "Calendar",
      system_alert: "System",
    }[type] || "General");

  const NotificationItem = ({ notification }) => {
    const IconComponent = notification.icon;
    return (
      <div
        className={`border ${
          notification.borderColor
        } rounded-lg mb-4 overflow-hidden ${
          notification.read ? "bg-white opacity-75" : notification.bgColor
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex space-x-3 flex-1">
              <div className={`p-2 rounded-full ${notification.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${notification.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`font-semibold text-sm ${
                          notification.read ? "text-gray-600" : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm mt-1 text-gray-700">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{getTypeLabel(notification.type)}</span>
                      <span>•</span>
                      <span>{formatTimestamp(notification.timestamp)}</span>
                      <span>•</span>
                      <span
                        className={`px-2 py-1 rounded-full ${
                          notification.priority === "high"
                            ? "bg-red-100 text-red-600"
                            : notification.priority === "medium"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {notification.actionable && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {notification.actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(notification.id, action)}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
          {!notification.read && (
            <div className="px-4 pt-2">
              <button
                onClick={() => markAsRead(notification.id)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark as read
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SettingsPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Notification Settings
          </h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between mb-3">
            <label className="capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            <button
              onClick={() =>
                setSettings((prev) => ({ ...prev, [key]: !value }))
              }
              className={`w-12 h-6 rounded-full relative ${
                value ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  value ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
        <button
          onClick={() => setShowSettings(false)}
          className="w-full mt-6 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="bus_alert">Bus Alerts</option>
            <option value="route_update">Route Updates</option>
            <option value="calendar_reminder">Calendar</option>
            <option value="system_alert">System</option>
          </select>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="space-y-1">
          {getFilteredNotifications().length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "No notifications found for this filter."}
              </p>
            </div>
          ) : (
            getFilteredNotifications().map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))
          )}
        </div>
      </div>

      {showSettings && <SettingsPanel />}
    </div>
  );
};

export default Notifications;
