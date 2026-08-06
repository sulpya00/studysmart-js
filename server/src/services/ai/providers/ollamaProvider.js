import { parseJsonObject } from "../../../utils/parseJson.js";

function normalizeBaseUrl(value) {
  return (value || "http://localhost:11434")
    .replace(/\/$/, "")
    .replace(/\/api$/, "");
}

export async function generateWithOllama({ prompt, model }) {
  const baseUrl = normalizeBaseUrl(process.env.OLLAMA_BASE_URL);
  const selectedModel = model || process.env.OLLAMA_MODEL;
  if (!selectedModel) throw new Error("No Ollama model is configured or installed.");

  let response;
  try {
    response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: selectedModel, prompt, stream: false, format: "json" }),
      signal: AbortSignal.timeout(120000),
    });
  } catch (error) {
    throw new Error(`Could not reach Ollama at ${baseUrl}. Confirm Ollama is running. ${error.message}`);
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Ollama returned ${response.status}: ${details}`);
  }

  const result = await response.json();
  const parsed = parseJsonObject(result.response);
  return { ...parsed, provider: "ollama", model: selectedModel };
}
