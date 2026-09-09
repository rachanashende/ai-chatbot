import React, { useState } from "react";
import MessageBubble from "./MessageBubble";
import CategoryFilter from "./CategoryFilter";
import VoiceButton from "./VoiceButton";
import { speak } from "../hooks/useSpeechRecognition";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CATEGORIES = ["Admissions", "Registration", "Exams", "Campus"];

const GREETINGS = {
  Admissions: "Hi! Ask me about applications, deadlines, or required documents.",
  Registration: "Hi! Ask me about course registration or the add/drop process.",
  Exams: "Hi! Ask me about exam schedules, hall tickets, or revaluation.",
  Campus: "Hi! Ask me about library hours, hostel, or general campus life.",
};

function buildInitialMessages() {
  const initial = {};
  CATEGORIES.forEach((cat) => {
    initial[cat] = [{ role: "bot", tag: cat, text: GREETINGS[cat] }];
  });
  return initial;
}

export default function ChatWindow() {
  // Each category keeps its own message history, keyed by name, so
  // switching tabs shows a genuinely separate conversation rather than
  // one shared thread with a relabeled header.
  const [messagesByCategory, setMessagesByCategory] = useState(buildInitialMessages);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Admissions");
  const [loading, setLoading] = useState(false);

  const messages = messagesByCategory[activeCategory];

  function appendMessage(category, message) {
    setMessagesByCategory((prev) => ({
      ...prev,
      [category]: [...prev[category], message],
    }));
  }

  async function sendQuestion(question) {
    if (!question.trim()) return;

    const category = activeCategory;
    appendMessage(category, { role: "user", text: question });
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      appendMessage(category, { role: "bot", tag: data.tier, text: data.answer });
      speak(data.answer);
    } catch (err) {
      appendMessage(category, {
        role: "bot",
        tag: "CampusInfo",
        text: "Something went wrong reaching the assistant. Please try again.",
      });
    } finally {
      setLoading(false);
    }
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
        <CategoryFilter active={activeCategory} onSelect={setActiveCategory} />
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