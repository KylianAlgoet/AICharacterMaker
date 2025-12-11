import fetch from "node-fetch";

const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_BASE_URL =
  process.env.TRIPO_BASE_URL || "https://api.tripo3d.ai/v2/openapi";

if (!TRIPO_API_KEY) {
  console.error("TRIPO_API_KEY is missing in .env");
}

// Start text→3D task
export async function startTextTo3DTask(prompt) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt is required and must be a string");
  }

  const body = {
    type: "text_to_model",
    prompt,
    model_version: "v2.5-20250123",
    texture: true,
    pbr: true,
  };

  console.log("[Tripo] Sending payload to /task:", JSON.stringify(body, null, 2));

  const res = await fetch(`${TRIPO_BASE_URL}/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TRIPO_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  console.log("[Tripo] Start response:", data);

  if (!res.ok || data.code !== 0) {
    console.error("[Tripo] Start error:", data);
    throw new Error("Failed to start Tripo task");
  }

  const taskId = data?.data?.task_id;
  if (!taskId) {
    console.error("[Tripo] No task_id in response:", data);
    throw new Error("No task_id returned from Tripo");
  }

  console.log("[Tripo] Task started with id:", taskId);
  return taskId;
}

// Poll status
export async function getTaskStatus(taskId) {
  const url = `${TRIPO_BASE_URL}/task/${taskId}`;
  console.log("[Tripo] Polling task:", taskId, "→", url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${TRIPO_API_KEY}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  console.log("[Tripo] Polling response:", data);

  if (!res.ok) {
    console.error("[Tripo] HTTP error on status:", res.status);
    throw new Error("Failed to fetch Tripo task status");
  }

  if (data.code !== 0) {
    console.error("[Tripo] Status error:", data);
    throw new Error("Failed to fetch Tripo task status");
  }

  const status = data?.data?.status;
  const progress = data?.data?.progress ?? null;
  const output = data?.data?.output || {};

  const downloadUrl =
    output.pbr_model || output.model || output.base_model || null;

  const images = {
    thumbnail: data?.data?.thumbnail || null,
    rendered: output.rendered_image || null,
    generated: output.generated_image || null,
  };

  console.log(
    `[Tripo] Task ${taskId} status: ${status} (${progress ?? 0}%)`
  );
  if (downloadUrl) {
    console.log(`[Tripo] Task ${taskId} model URL: ${downloadUrl}`);
  }

  return { status, downloadUrl, progress, images, raw: data };
}
