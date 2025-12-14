import React, { useState, useEffect } from "react";
import PromptForm from "./components/PromptForm.jsx";
import ModelViewer from "./components/ModelViewer.jsx";
import HistoryList from "./components/HistoryList.jsx";

const API_BASE = "http://localhost:4000";

export default function App() {
  const [currentModel, setCurrentModel] = useState(null);
  const [history, setHistory] = useState([]);

  const refreshHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/models`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleCreateModel = async ({ prompt, enhance, styleId, poseId }) => {
    try {
      const res = await fetch(`${API_BASE}/api/models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, enhance, styleId, poseId }),
      });
      const data = await res.json();
      setCurrentModel(data);
      refreshHistory();
      startPollingStatus(data.id);
    } catch (err) {
      console.error("Create model failed:", err);
    }
  };

  const startPollingStatus = (id) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/models/${id}/status`);
        const data = await res.json();
        setCurrentModel(data);
        if (data.status === "ready" || data.status === "failed") {
          clearInterval(interval);
          refreshHistory();
        }
      } catch (err) {
        console.error("Status polling failed:", err);
        clearInterval(interval);
      }
    }, 4000);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI 3D Character Forge</h1>
        <span style={{ opacity: 0.7, fontSize: "0.9rem" }}>
        By Kylian Algoet
        </span>
      </header>

      <main className="main">
        <section className="card">
          <PromptForm onGenerate={handleCreateModel} currentModel={currentModel} />
          <HistoryList history={history} onSelect={setCurrentModel} />
        </section>

        <section className="card">
          <ModelViewer model={currentModel} />
        </section>
      </main>
    </div>
  );
}
