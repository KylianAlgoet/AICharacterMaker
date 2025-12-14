import React from "react";

export default function HistoryList({ history, onSelect }) {
  if (!history || history.length === 0) {
    return <p className="history-empty">No characters generated yet.</p>;
  }

  return (
    <div className="history-wrapper">
      <h3>Recent characters</h3>

      <div className="history-list">
        {history.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            className="history-item"
            type="button"
          >
            <div className="history-time">
              {new Date(m.createdAt).toLocaleTimeString()}
            </div>

            <div className="history-prompt">
              {m.enhancedPrompt || m.prompt}
            </div>

            <div className="history-status">
              Status: <span className={`history-status-pill s-${m.status}`}>{m.status}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
