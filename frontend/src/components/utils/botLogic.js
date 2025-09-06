// src/utils/botLogic.js
export const botResponse = (message) => {
  message = message.toLowerCase();
  if (message.includes("bus")) return "🚌 Buses run every 15 mins from 6 AM to 10 PM.";
  if (message.includes("fare")) return "💰 The fare from city center → airport is 150 Rs.";
  if (message.includes("schedule")) return "⏰ Bus schedules are available on our website or station boards.";
  return "🤖 Sorry, I didn't understand that. Try asking about bus, fare, or schedule.";
};
