import React, { useState } from "react";
import MessageBubble from "./MessageBubble";
import CategoryFilter from "./CategoryFilter";
import VoiceButton from "./VoiceButton";
import { speak } from "../hooks/useSpeechRecognition";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CATEGORY_STARTERS = {
  Admissions: "What do I need to know about admissions?",
  Registration: "How does course registration work?",
  Exams: "What should I know about exams?",
  Campus: "Tell me about general campus info.",
};

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      tag: "Admissions",
      text: "Hi! I can help with admissions, registration, exams, and general campus questions. What do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Admissions");
  const [loading, setLoading] = useState(false);

  async function sendQuestion(question) {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "bot", tag: data.tier, text: data.answer },
      ]);
      speak(data.answer);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          tag: "CampusInfo",
          text: "Something went wrong reaching the assistant. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Clicking a category pill updates the header AND sends a starter
  // question for that topic, so the chat visibly responds instead of
  // just relabeling an unchanged conversation.
  function handleCategorySelect(category) {
    setActiveCategory(category);
    sendQuestion(CATEGORY_STARTERS[category]);
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="brand">
          <div className="brand-dot" />
          <div>
            <div className="brand-name">Campus Companion</div>
            <div className="brand-sub">Ask me anything</div>
          </div>
        </div>
        <CategoryFilter active={activeCategory} onSelect={handleCategorySelect} />
      </div>

      <div className="chat">
        <div className="chat-header">
          <div>
            <div className="chat-title">{activeCategory} help</div>
            <div className="chat-status">
              <span className="status-dot" />
              Online — text or voice
            </div>
          </div>
        </div>

        <div className="messages">
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} text={m.text} tag={m.tag} />
          ))}
          {loading && <div className="msg bot">Thinking…</div>}
        </div>

        <div className="input-row">
          <input
            className="input-text"
            value={input}
            placeholder="Type your question, or tap to speak…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendQuestion(input)}
          />
          <VoiceButton onTranscript={(text) => sendQuestion(text)} />
          <div className="send-btn" onClick={() => sendQuestion(input)}>
            <div className="send-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}