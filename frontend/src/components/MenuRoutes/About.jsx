import React from "react";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1>{t("menubar.about.title")}</h1>
        <h2>{t("menubar.about.app_info")}</h2>
        <p>{t("menubar.about.description")}</p>
        <h3>{t("menubar.about.features")}</h3>
        <li>{t("menubar.about.feature1")}</li>
        <li>{t("menubar.about.feature2")}</li>
        <li>{t("menubar.about.feature3")}</li>
        <li>{t("menubar.about.feature4")}</li>
        <h3>{t("menubar.about.team")}</h3>
        <p>{t("menubar.about.team_description")}</p>
      </div>
    </div>
  );
};

export default About;
