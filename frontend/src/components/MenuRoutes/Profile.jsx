import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+977-1-1234567",
    location: "Kathmandu, Nepal"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setEditing(false);
    alert(t("menubar.profile.saved"));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {t("menubar.profile.title")}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Account Details */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {t("menubar.profile.account_details")}
          </h2>

          {editing ? (
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {t("menubar.profile.save_button")}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>{t("menubar.profile.name")}:</strong> {profile.name}</p>
              <p><strong>{t("menubar.profile.email")}:</strong> {profile.email}</p>
              <p><strong>{t("menubar.profile.phone")}:</strong> {profile.phone}</p>
              <p><strong>{t("menubar.profile.location")}:</strong> {profile.location}</p>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {t("menubar.profile.edit_button")}
              </button>
            </div>
          )}
        </div>

        {/* Account Preferences */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {t("menubar.profile.preferences")}
          </h2>
          <p className="text-gray-600">{t("menubar.profile.preferences_desc")}</p>
        </div>

        {/* Security / Logout */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {t("menubar.profile.security")}
          </h2>
          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            {t("menubar.profile.logout")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
