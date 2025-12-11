import React from "react";

export default function HistoryList({ history, onSelect }) {
  if (!history || history.length === 0) {
    return (
      <p style={{ marginTop: "1rem", fontSize: "0.85rem", opacity: 0.7 }}>
        No characters generated yet.
      </p>
    );
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3 style={{ marginBottom: "0.5rem", fontSize: "0.95rem" }}>
        Recent characters
      </h3>
      <div
        style={{
          maxHeight: "180px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {history.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            style={{
              textAlign: "left",
              borderRadius: "0.7rem",
              padding: "0.5rem 0.6rem",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(15,20,35,0.9)",
            }}
          >
            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
              {new Date(m.createdAt).toLocaleTimeString()}
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {m.enhancedPrompt || m.prompt}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                opacity: 0.8,
                marginTop: "0.2rem",
              }}
            >
              Status: {m.status}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}