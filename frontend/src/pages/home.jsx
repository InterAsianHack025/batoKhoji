import React, { useState } from "react";
import RoutePlanner from "../components/RoutePlanner";
import QuickActions from "../components/QuickActions";



const Home = () => {
  const { t } = useTranslation();
  const [view, setView] = useState("home");

  return (
    <div className="bg-gray-100 min-h-screen p-10 max-w-xl mx-auto">
       <h1 className="text-2xl font-bold mb-4">{t("pages.home")}</h1>
      <RoutePlanner />
      {view === "home" && <QuickActions showPage={setView} />}
    
      
    </div>
  );
};
export default Home;
