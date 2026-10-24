import { validateStudyPack } from "./validateStudyPack.js";
import { resolveAiSelection } from "../../ai/selection.js";
import { chatPrompt, studyPackPrompt } from "./prompts.js";
import { generateWithGemini } from "./providers/geminiProvider.js";
import { generateChatWithMock, generateStudyPackWithMock } from "./providers/mockProvider.js";
import { generateWithOllama } from "./providers/ollamaProvider.js";

async function generateJson(prompt, selection) {
  if (selection.provider === "gemini") {
    return generateWithGemini({ prompt, model: selection.model });
  }
  if (selection.provider === "ollama") {
    return generateWithOllama({ prompt, model: selection.model });
  }
  throw new Error(`Unsupported AI provider: ${selection.provider}`);
}

export async function generateStudyPack(input) {
  const selection = resolveAiSelection(input);
  if (selection.provider === "mock") {
    return generateStudyPackWithMock(input);
  }
  const generated = await generateJson(studyPackPrompt(input), selection);
  return validateStudyPack(generated, input);
}

export async function generateChatReply(input) {
  const selection = resolveAiSelection(input);
  if (selection.provider === "mock") {
    return generateChatWithMock({
      content: `${input.allTopicSummaries}\n\n${input.relevantTopicNotes}`,
      message: input.message,
    });
  }
  return generateJson(chatPrompt(input), selection);
}

export async function generateFlashcards(input) {
  const result = await generateStudyPack({
    ...input,
    flashcardCount: input.count,
    questionCount: 3,
  });
  return { flashcards: result.flashcards, provider: result.provider, model: result.model };
}
