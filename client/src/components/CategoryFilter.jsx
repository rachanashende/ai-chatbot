import React from "react";

const CATEGORIES = ["Admissions", "Registration", "Exams", "Campus"];

/**
 * Sidebar category pills. Purely a UI filter/quick-prompt shortcut —
 * clicking one can prefill the input with "Tell me about {category}"
 * or just visually indicate current topic context. Wire up onSelect
 * to whatever behavior you want.
 */
export default function CategoryFilter({ active, onSelect }) {
  return (
    <div className="filters">
      <div className="filter-label">Browse by topic</div>
      {CATEGORIES.map((cat) => (
        <div
          key={cat}
          className={`pill ${active === cat ? "active" : ""}`}
          onClick={() => onSelect?.(cat)}
        >
          <span className="pill-dot" />
          {cat}
        </div>
      ))}
    </div>
  );
}
