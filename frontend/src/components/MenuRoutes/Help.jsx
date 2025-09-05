import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const { t } = useTranslation();
  const [openFAQ, setOpenFAQ] = useState(null);
  const navigate = useNavigate();

  const faqs = [
    {
      id: 1,
      question: t("menubar.help.faq1_question"),
      answer: t("menubar.help.faq1_answer"),
    },
    {
      id: 2,
      question: t("menubar.help.faq2_question"),
      answer: t("menubar.help.faq2_answer"),
    },
    {
      id: 3,
      question: t("menubar.help.faq3_question"),
      answer: t("menubar.help.faq3_answer"),
    },
    {
      id: 4,
      question: t("menubar.help.faq4_question"),
      answer: t("menubar.help.faq4_answer"),
    },
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {t("menubar.help.title")}
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            {t("menubar.help.faq_title")}
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-800">
                    {faq.question}
                  </span>
                  <span
                    className={`transform transition-transform ${
                      openFAQ === faq.id ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {openFAQ === faq.id && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              {t("menubar.help.need_more_help")}
            </h3>
            <p className="text-gray-600 mb-3">
              {t("menubar.help.contact_support")}
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t("menubar.help.contact_button")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
