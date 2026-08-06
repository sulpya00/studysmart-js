import express from "express";

const router = express.Router();

function normalizeOllamaBaseUrl(value) {
  return (value || "http://localhost:11434")
    .replace(/\/$/, "")
    .replace(/\/api$/, "");
}

async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return [];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
    { signal: AbortSignal.timeout(10000) },
  );

  if (!response.ok) {
    throw new Error(`Gemini model discovery failed with HTTP ${response.status}.`);
  }

  const data = await response.json();
  return (data.models || [])
    .filter((item) =>
      item.name?.startsWith("models/gemini-")
      && item.supportedGenerationMethods?.includes("generateContent"),
    )
    .map((item) => {
      const model = item.name.replace(/^models\//, "");
      return {
        id: `gemini:${model}`,
        provider: "gemini",
        model,
        label: `Gemini — ${item.displayName || model}`,
        available: true,
      };
    });
}

async function listOllamaModels() {
  const baseUrl = normalizeOllamaBaseUrl(process.env.OLLAMA_BASE_URL);
  const response = await fetch(`${baseUrl}/api/tags`, {
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) {
    throw new Error(`Ollama model discovery failed with HTTP ${response.status}.`);
  }

  const data = await response.json();
  return (data.models || []).map((item) => ({
    id: `ollama:${item.name}`,
    provider: "ollama",
    model: item.name,
    label: `Ollama — ${item.name}`,
    available: true,
  }));
}

function configuredFallbacks() {
  const models = [{
    id: "mock:paragraph-aware-demo",
    provider: "mock",
    model: "paragraph-aware-demo",
    label: "Local demo — no external AI",
    available: true,
  }];

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL) {
    models.push({
      id: `gemini:${process.env.GEMINI_MODEL}`,
      provider: "gemini",
      model: process.env.GEMINI_MODEL,
      label: `Gemini — ${process.env.GEMINI_MODEL}`,
      available: true,
    });
  }

  if (process.env.OLLAMA_MODEL) {
    models.push({
      id: `ollama:${process.env.OLLAMA_MODEL}`,
      provider: "ollama",
      model: process.env.OLLAMA_MODEL,
      label: `Ollama — ${process.env.OLLAMA_MODEL}`,
      available: true,
    });
  }

  return models;
}

function deduplicateModels(models) {
  return [...new Map(models.map((item) => [item.id, item])).values()];
}

router.get("/models", async (_request, response) => {
  const results = await Promise.allSettled([listGeminiModels(), listOllamaModels()]);
  const discovered = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const models = deduplicateModels([...discovered, ...configuredFallbacks()]);

  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();
  const configuredModel = provider === "gemini"
    ? process.env.GEMINI_MODEL
    : provider === "ollama"
      ? process.env.OLLAMA_MODEL
      : "paragraph-aware-demo";
  const requestedDefault = `${provider}:${configuredModel || ""}`;
  const defaultModel = models.some((item) => item.id === requestedDefault)
    ? requestedDefault
    : models[0].id;

  response.json({
    models,
    defaultModel,
    discovery: {
      gemini: results[0].status,
      ollama: results[1].status,
    },
  });
});

export default router;
