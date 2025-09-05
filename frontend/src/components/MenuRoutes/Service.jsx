import React from "react";
import { useTranslation } from "react-i18next";

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      id: "route_planning",
      icon: "🗺️",
      title: t("menubar.services.route_planning"),
      description: t("menubar.services.route_planning_desc")
    },
    {
      id: "real_time_tracking",
      icon: "📍",
      title: t("menubar.services.real_time_tracking"),
      description: t("menubar.services.real_time_tracking_desc")
    },
    {
      id: "schedule_info",
      icon: "⏰",
      title: t("menubar.services.schedule_info"),
      description: t("menubar.services.schedule_info_desc")
    },
    {
      id: "offline_access",
      icon: "📱",
      title: t("menubar.services.offline_access"),
      description: t("menubar.services.offline_access_desc")
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {t("menubar.services.title")}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{service.icon}</span>
                <h2 className="text-xl font-semibold text-gray-800">
                  {service.title}
                </h2>
              </div>
              <p className="text-gray-600">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;