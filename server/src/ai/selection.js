const SUPPORTED_PROVIDERS = new Set(["mock", "gemini", "ollama"]);

export function resolveAiSelection(body = {}) {
  const provider = String(body.aiProvider || process.env.AI_PROVIDER || "mock")
    .trim()
    .toLowerCase();

  if (!SUPPORTED_PROVIDERS.has(provider)) {
    const error = new Error(`Unsupported AI provider: ${provider}`);
    error.statusCode = 400;
    throw error;
  }

  if (provider === "mock") {
    return { provider: "mock", model: "paragraph-aware-demo" };
  }

  const requestedModel = String(body.aiModel || "").trim();
  const configuredModel = provider === "ollama"
    ? process.env.OLLAMA_MODEL
    : process.env.GEMINI_MODEL;

  const model = requestedModel && requestedModel !== "configured-default"
    ? requestedModel
    : configuredModel;

  if (!model) {
    const error = new Error(`No model is configured for ${provider}.`);
    error.statusCode = 400;
    throw error;
  }

  if (provider === "gemini" && !process.env.GEMINI_API_KEY) {
    const error = new Error("Gemini is selected, but GEMINI_API_KEY is missing.");
    error.statusCode = 400;
    throw error;
  }

  return { provider, model };
}
