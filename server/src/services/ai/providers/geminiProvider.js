import { GoogleGenAI } from "@google/genai";
import { parseJsonObject } from "../../../utils/parseJson.js";

export async function generateWithGemini({ prompt, model }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to server/.env or choose another model.");
  }

  const selectedModel = model || process.env.GEMINI_MODEL;
  if (!selectedModel) throw new Error("No Gemini model is configured.");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: selectedModel,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });
  const parsed = parseJsonObject(response.text);

  return { ...parsed, provider: "gemini", model: selectedModel };
}
