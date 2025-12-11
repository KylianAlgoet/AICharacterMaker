import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { enhancePrompt } from "./openaiClient.js";
import { startTextTo3DTask, getTaskStatus } from "./tripoClient.js";
import { saveModel, getModel, listModels } from "./modelsStore.js";
import { generateRiggedVersion } from "./mixamoClient.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// 🔹 STYLE & POSE PRESETS (ID’s MOETEN MATCHEN MET FRONTEND)
const STYLE_PRESETS = {
  default: "",
  stylized:
    " in a stylized hand-painted game-art style with vibrant colors and soft lighting.",
  realistic:
    " in a realistic PBR style with detailed physically based materials and natural lighting.",
  anime:
    " in a cel-shaded anime style with bold outlines and flat shading similar to modern anime games.",
  dark_fantasy:
    " in a dark fantasy style with dramatic lighting, gothic details and gritty textures.",
  sci_fi:
    " in a futuristic sci-fi style with hard-surface armor, emissive lights and metallic materials.",
};

const POSE_PRESETS = {
  none: "",
  idle:
    " standing in a relaxed idle pose, facing slightly toward the camera with neutral expression.",
  hero:
    " in a heroic pose with one foot forward, chest out and confident stance.",
  battle:
    " in an action-ready battle stance with weight shifted forward and arms ready for combat.",
  running:
    " captured mid-run as if sprinting forward with dynamic motion and flowing clothes.",
  jump_attack:
    " mid-air performing a jump attack, body twisted dynamically for an action shot.",
};

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AI 3D Character Maker backend running" });
});

// 🔹 AI Prompt Enhancer (losse knop)
app.post("/api/prompt/enhance", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const enhanced = await enhancePrompt(prompt);
    res.json({ enhancedPrompt: enhanced });
  } catch (err) {
    console.error("[Enhance] Error:", err);
    res.status(500).json({ error: "Failed to enhance prompt" });
  }
});

// 🔹 Nieuw model aanmaken
app.post("/api/models", async (req, res) => {
  try {
    const { prompt, enhance, styleId, poseId } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const styleKey = styleId && STYLE_PRESETS[styleId] ? styleId : "default";
    const poseKey = poseId && POSE_PRESETS[poseId] ? poseId : "none";

    // 1) eventueel prompt laten boosten door OpenAI
    const basePrompt = enhance ? await enhancePrompt(prompt) : prompt;

    // 2) style + pose tekst eraan hangen
    const styleSuffix = STYLE_PRESETS[styleKey] || "";
    const poseSuffix = POSE_PRESETS[poseKey] || "";
    const tripoPrompt = `${basePrompt}${styleSuffix}${poseSuffix}`;

    // 3) Tripo task starten
    const tripoTaskId = await startTextTo3DTask(tripoPrompt);

    const id = randomUUID();
    const model = {
      id,
      tripoTaskId,
      prompt,
      enhancedPrompt: basePrompt,
      finalPrompt: tripoPrompt,
      styleId: styleKey,
      poseId: poseKey,
      status: "pending",
      progress: 0,
      downloadUrl: null,
      previewImages: null,
      createdAt: Date.now(),
      rigged: false,
      riggedDownloadUrl: null,
    };

    saveModel(model);
    res.status(201).json(model);
  } catch (err) {
    console.error("Error in /api/models:", err);
    res.status(500).json({ error: "Failed to create model" });
  }
});

// 🔹 Status + progress + preview images
app.get("/api/models/:id/status", async (req, res) => {
  try {
    const model = getModel(req.params.id);
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }

    if (model.status === "ready" || model.status === "failed") {
      return res.json(model);
    }

    const { status, downloadUrl, progress, images } = await getTaskStatus(
      model.tripoTaskId
    );

    if (images && !model.previewImages) {
      model.previewImages = images;
    }

    if (status === "success" || status === "SUCCEEDED" || status === "completed") {
      model.status = "ready";
      model.downloadUrl = downloadUrl || model.downloadUrl;
      model.progress = progress ?? 100;
      saveModel(model);
    } else if (status === "FAILED" || status === "failed") {
      model.status = "failed";
      model.progress = progress ?? 100;
      saveModel(model);
    } else {
      model.status = "pending";
      model.progress = progress ?? model.progress ?? 0;
      saveModel(model);
    }

    res.json(model);
  } catch (err) {
    console.error("Error in /api/models/:id/status:", err);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

app.get("/api/models", (req, res) => {
  res.json(listModels());
});

app.post("/api/models/:id/rig", async (req, res) => {
  try {
    const riggedModel = await generateRiggedVersion(req.params.id);
    res.json(riggedModel);
  } catch (err) {
    console.error("Error in /api/models/:id/rig:", err);
    res.status(500).json({ error: "Failed to rig model" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
