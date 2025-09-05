import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Feedback = () => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState({
    rating: 0,
    category: "",
    message: "",
    email: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRating = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback submitted:", feedback);
    alert(t("menubar.feedback.thank_you"));
    setFeedback({ rating: 0, category: "", message: "", email: "" });
  };

  const categories = [
    { value: "bug", label: t("menubar.feedback.bug_report") },
    { value: "feature", label: t("menubar.feedback.feature_request") },
    { value: "improvement", label: t("menubar.feedback.improvement") },
    { value: "general", label: t("menubar.feedback.general_feedback") }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {t("menubar.feedback.title")}
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-6">
            {t("menubar.feedback.description")}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t("menubar.feedback.rating")}
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    className={`text-3xl ${
                      star <= feedback.rating 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("menubar.feedback.category")}
              </label>
              <select
                name="category"
                value={feedback.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">{t("menubar.feedback.select_category")}</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("menubar.feedback.message")}
              </label>
              <textarea
                name="message"
                value={feedback.message}
                onChange={handleInputChange}
                rows="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t("menubar.feedback.message_placeholder")}
                required
              ></textarea>
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("menubar.feedback.email")} {t("menubar.feedback.optional")}
              </label>
              <input
                type="email"
                name="email"
                value={feedback.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t("menubar.feedback.email_placeholder")}
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              {t("menubar.feedback.submit_button")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;