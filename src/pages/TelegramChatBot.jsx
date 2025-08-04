import React, { useState, useRef, useEffect } from "react";
import "../css/TelegramChatBot.css";

const TelegramChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      content: "👋 Hello! I'm your AI assistant. How can I help you today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatBoxRef = useRef(null);

  const webhookUrl = process.env.REACT_APP_WEBHOOK_URL;

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const appendMessage = (content, sender) => {
    setMessages((prev) => [...prev, { sender, content, time: new Date() }]);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    appendMessage(trimmed, "user");
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const botReply =
        data[0]?.output ||
        "Sorry, I didn't understand that. Could you please rephrase?";
      appendMessage(botReply, "bot");
    } catch (err) {
      console.error(err);
      const errMsg = err.message.includes("Failed to fetch")
        ? "Connection error. Please check your internet connection and try again."
        : "Sorry, something went wrong. Please try again in a moment.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="avatar">
          <i className="fas fa-robot"></i>
        </div>
        <div className="chat-info">
          <h3>AI Assistant</h3>
          <p>Online</p>
        </div>
      </div>

      <div className="messages" id="chatBox" ref={chatBoxRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="message-bubble">
              {msg.content}
              <div className="message-time">{formatTime(msg.time)}</div>
            </div>
          </div>
        ))}

        {error && <div className="error-message">{error}</div>}
      </div>

      {loading && (
        <div className="typing-indicator show">
          <div className="typing-bubble">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      <div className="input-area">
        <div className="input-container">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
          />
        </div>
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={loading}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default TelegramChatBot;
