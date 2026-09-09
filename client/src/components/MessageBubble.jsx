import React from "react";

const TAG_LABELS = {
  Admissions: "Admissions",
  Registration: "Registration",
  Exams: "Exams",
  Campus: "Campus",
  CampusInfo: "Campus info",
};

/**
 * Renders a single chat message. Bot messages show a tier tag
 * (e.g. "Admissions" for an exact FAQ hit, "Campus info" when the
 * answer came from general reasoning rather than a specific FAQ)
 * so the student can see how confident/sourced the answer is.
 */
export default function MessageBubble({ role, text, tag }) {
  const isBot = role === "bot";

  return (
    <div className={`msg ${isBot ? "bot" : "user"}`}>
      {isBot && tag && (
        <span
          className="msg-tag"
          style={{ color: `var(--tag-${tag.toLowerCase()}, var(--ink-soft))` }}
        >
          {TAG_LABELS[tag] || tag}
        </span>
      )}
      <div>{text}</div>
    </div>
  );
}
