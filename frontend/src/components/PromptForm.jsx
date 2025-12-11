import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:4000";

// Deze ID's moeten overeenkomen met backend STYLE_PRESETS & POSE_PRESETS
const STYLE_PRESETS = [
  { id: "default", label: "Default" },
  { id: "stylized", label: "Stylized" },
  { id: "realistic", label: "Realistic" },
  { id: "anime", label: "Anime" },
  { id: "dark_fantasy", label: "Dark fantasy" },
  { id: "sci_fi", label: "Sci-Fi" },
];

const POSE_PRESETS = [
  { id: "none", label: "Any pose" },
  { id: "idle", label: "Idle" },
  { id: "hero", label: "Hero pose" },
  { id: "battle", label: "Battle ready" },
  { id: "running", label: "Running" },
  { id: "jump_attack", label: "Jump attack" },
];

const RANDOM_PROMPTS = [
  {
    text: "Create a stylized fantasy rogue with light leather armor, hood, daggers and agile proportions, suitable as a game-ready RPG character.",
    styleId: "stylized",
    poseId: "idle",
  },
  {
    text: "Design a cyberpunk bounty hunter with neon-lit armor, visor helmet, tech gadgets and a long coat, ready for a futuristic shooter game.",
    styleId: "sci_fi",
    poseId: "battle",
  },
  {
    text: "Create an anime-style swordfighter with flowing hair, ornate katana and heroic silhouette, optimized for cel-shaded rendering.",
    styleId: "anime",
    poseId: "hero",
  },
  {
    text: "Generate a realistic medieval knight in full plate armor with shield and longsword, suitable for realistic PBR rendering.",
    styleId: "realistic",
    poseId: "hero",
  },
];

export default function PromptForm({ onGenerate, currentModel }) {
  const [prompt, setPrompt] = useState(
    "Stylized fantasy warrior, medium build, leather armor, cape, boots, game-ready proportions"
  );
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState("stylized");
  const [selectedPoseId, setSelectedPoseId] = useState("hero");

  useEffect(() => {
    // textarea auto-resize
    const el = document.getElementById("prompt-input");
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [prompt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      await onGenerate({
        prompt: prompt.trim(),
        enhance: autoEnhance,
        styleId: selectedStyleId,
        poseId: selectedPoseId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceClick = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch(`${API_BASE}/api/prompt/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.error("Enhance failed:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleRandom = () => {
    const rnd = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setPrompt(rnd.text);
    setSelectedStyleId(rnd.styleId);
    setSelectedPoseId(rnd.poseId);
  };

  const statusText =
    currentModel?.status === "ready"
      ? "ready"
      : currentModel?.status === "failed"
      ? "failed"
      : currentModel?.status === "pending"
      ? `generating… ${currentModel?.progress ?? 0}%`
      : "idle";

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <h2>Generate a new character</h2>

      <div className="prompt-box">
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="prompt-textarea"
        />
      </div>

      <div className="prompt-row">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={autoEnhance}
            onChange={(e) => setAutoEnhance(e.target.checked)}
          />
          <span>Use AI prompt enhancer automatically</span>
        </label>

        <button
          type="button"
          className="btn secondary small"
          onClick={handleEnhanceClick}
          disabled={isEnhancing}
        >
          {isEnhancing ? "Enhancing…" : "✨ Enhance prompt"}
        </button>

        <button
          type="button"
          className="btn ghost small"
          onClick={handleRandom}
        >
          🎲 Random character
        </button>
      </div>

      <div className="preset-section">
        <span className="preset-label">Style</span>
        <div className="pill-row">
          {STYLE_PRESETS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={
                "pill" + (selectedStyleId === s.id ? " pill--active" : "")
              }
              onClick={() => setSelectedStyleId(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="preset-section">
        <span className="preset-label">Pose</span>
        <div className="pill-row">
          {POSE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={
                "pill" + (selectedPoseId === p.id ? " pill--active" : "")
              }
              onClick={() => setSelectedPoseId(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="prompt-footer">
        <div className="status-text">
          <strong>Current status:</strong>{" "}
          <span className={`status-tag status-${statusText}`}>
            {statusText}
          </span>
        </div>

        <button
          type="submit"
          className="btn primary big"
          disabled={isGenerating}
        >
          {isGenerating ? "Generating…" : "Generate Character"}
        </button>
      </div>
    </form>
  );
}
