import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
      <div className="flex space-x-1 overflow-x-auto">
        <button onClick={() => navigate("/live-bus-tracking")} className="...">
          📍 "nearest
        </button>
        <button onClick={() => navigate("/route-planner")} className="...">
          🚌 route
        </button>
        <button onClick={() => navigate("/saved-place")} className="...">
          💰 "fare
        </button>
        <button onClick={() => navigate("/calendar-reminder")} className="...">
          🕐 "time
        </button>
      </div>
    </div>
  );
};
export default QuickActions;