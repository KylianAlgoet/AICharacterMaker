import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function enhancePrompt(userPrompt) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in .env");
  }

  const body = {
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert 3D character artist. Improve user prompts for text-to-3D character generation. Add details about style, proportions, topology, rig suitability. Max 80 words.",
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("OpenAI error:", text);
    throw new Error("Failed to enhance prompt");
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}