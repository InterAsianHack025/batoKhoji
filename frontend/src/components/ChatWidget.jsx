import React, { useState, useEffect, useRef } from "react";
import botAvatar from "../assets/talking_bus.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faTimes } from "@fortawesome/free-solid-svg-icons";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hello! I can help you with bus routes, schedules, and fares. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setOpen(!open);

  // Frontend two-way chat logic
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setTyping(true); // Show typing indicator

    try {
      const response = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setTyping(false);
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "Sorry, I couldn't process your request right now." },
        ]);
      }
    } catch (error) {
      setTyping(false); 
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-500 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl transition-all duration-300 hover:scale-105"
      >
        <img
          src={botAvatar}
          alt="Bot Profile"
          className="w-full h-full object-cover"
        />
      </button>

      {/* Chat Window */}
      <div
        className={`absolute bottom-16 right-0 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 transform transition-all duration-300 ${
          open
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <img
                src={botAvatar}
                alt="Bot Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Bus Assistant</h3>
              <p className="text-xs opacity-80">
                <span className="w-2 h-2 bg-green-300 rounded-full inline-block mr-1"></span>
                Online
              </p>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="text-white/80 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-4 bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.from === "bot" ? "items-start" : "justify-end"
              } mb-2`}
            >
              {msg.from === "bot" && (
                <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 overflow-hidden">
                  <img
                    src={botAvatar}
                    alt="Bot Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`p-3 rounded-lg max-w-xs shadow-sm ${
                  msg.from === "bot" ? "bg-white" : "bg-green-100 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-start mb-2">
              <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 overflow-hidden">
                <img
                  src={botAvatar}
                  alt="Bot Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 rounded-lg max-w-xs shadow-sm bg-white">
                <span className="animate-pulse text-gray-400">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white rounded-b-2xl border-t border-gray-200 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 rounded-lg px-3 py-2 bg-gray-100 border-0 text-sm text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-white text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
