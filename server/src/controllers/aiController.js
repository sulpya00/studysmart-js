import { z } from "zod";
import { generateChatReply, generateFlashcards, generateStudyPack } from "../services/ai/aiService.js";
import { getPrisma } from "../lib/prisma.js";
import {
  prepareChatContext,
  saveChatMessage,
  saveStudyPack,
} from "../services/historyService.js";

const aiSelectionSchema = {
  aiProvider: z.enum(["mock", "gemini", "ollama"]).optional(),
  aiModel: z.string().trim().max(160).optional(),
};

const userSchema = {
  userEmail: z.string().trim().email().max(254),
  userName: z.string().trim().max(100).optional().default(""),
};

const baseNotesSchema = {
  title: z.string().trim().min(2).max(120),
  subject: z.string().trim().max(80).optional().default(""),
  content: z.string().trim().min(40).max(20000),
};

const studyPackRequestSchema = z.object({
  ...userSchema,
  ...baseNotesSchema,
  ...aiSelectionSchema,
  flashcardCount: z.coerce.number().int().min(3).max(20).default(6),
  questionCount: z.coerce.number().int().min(3).max(10).default(5),
});

const flashcardRequestSchema = z.object({
  ...baseNotesSchema,
  ...aiSelectionSchema,
  count: z.coerce.number().int().min(3).max(20).default(6),
});

const chatRequestSchema = z.object({
  ...userSchema,
  ...aiSelectionSchema,
  currentTopicId: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().min(1).max(1000),
});

function cleanFlashcards(cards, limit) {
  if (!Array.isArray(cards)) return [];
  return cards
    .filter((card) => card && typeof card.front === "string" && typeof card.back === "string")
    .map((card) => ({ front: card.front.trim(), back: card.back.trim() }))
    .filter((card) => card.front && card.back)
    .slice(0, limit);
}

function cleanQuestions(questions, limit) {
  if (!Array.isArray(questions)) return [];
  return questions
    .filter((question) => question && typeof question.prompt === "string" && Array.isArray(question.options) && typeof question.correctAnswer === "string")
    .map((question) => ({
      prompt: question.prompt.trim(),
      options: question.options.filter((option) => typeof option === "string").map((option) => option.trim()).filter(Boolean).slice(0, 4),
      correctAnswer: question.correctAnswer.trim(),
      explanation: typeof question.explanation === "string" ? question.explanation.trim() : "Review the relevant point in the summary.",
    }))
    .filter((question) => question.prompt && question.options.length >= 2 && question.options.includes(question.correctAnswer))
    .slice(0, limit);
}

export async function createStudyPack(req, res, next) {
  try {
    const input = studyPackRequestSchema.parse(req.body);
    const generated = await generateStudyPack(input);

    const result = {
      summary: typeof generated.summary === "string" ? generated.summary.trim() : "",
      keyPoints: Array.isArray(generated.keyPoints)
        ? generated.keyPoints.filter((point) => typeof point === "string").map((point) => point.trim()).filter(Boolean).slice(0, 8)
        : [],
      flashcards: cleanFlashcards(generated.flashcards, input.flashcardCount),
      questions: cleanQuestions(generated.questions, input.questionCount),
      provider: generated.provider,
      model: generated.model,
    };

    if (!result.summary || result.flashcards.length === 0 || result.questions.length === 0) {
      throw new Error("The AI provider returned an incomplete study pack. Please try again.");
    }

    const note = await saveStudyPack({
      userEmail: input.userEmail,
      userName: input.userName,
      input,
      result,
    });

    res.json({ ...result, topicId: note.id, saved: true });
  } catch (error) {
    next(error);
  }
}

export async function createChatReply(req, res, next) {
  let context;
  try {
    const input = chatRequestSchema.parse(req.body);
    context = await prepareChatContext({
      userEmail: input.userEmail,
      userName: input.userName,
      message: input.message,
      currentTopicId: input.currentTopicId || null,
    });

    await saveChatMessage({
      sessionId: context.session.id,
      role: "user",
      content: input.message,
    });

    const result = await generateChatReply({
      ...input,
      recentMessages: context.recentMessages,
      allTopicSummaries: context.allTopicSummaries,
      relevantTopicNotes: context.relevantTopicNotes,
    });

    if (typeof result.answer !== "string" || !result.answer.trim()) {
      throw new Error("The AI provider did not return a chat answer.");
    }

    const answer = result.answer.trim();
    await saveChatMessage({
      sessionId: context.session.id,
      role: "assistant",
      content: answer,
    });

    await getPrisma().aIRequest.create({
      data: {
        feature: "chat",
        provider: result.provider,
        model: result.model,
        status: "success",
        approximateSize: input.message.length,
        userId: context.user.id,
      },
    });

    res.json({
      answer,
      provider: result.provider,
      model: result.model,
      sourceTopics: context.sourceTopics,
    });
  } catch (error) {
    next(error);
  }
}

export async function createFlashcards(req, res, next) {
  try {
    const input = flashcardRequestSchema.parse(req.body);
    const result = await generateFlashcards(input);
    const flashcards = cleanFlashcards(result.flashcards, input.count);
    if (flashcards.length === 0) throw new Error("The AI provider did not return any flashcards.");
    res.json({ flashcards, provider: result.provider, model: result.model });
  } catch (error) {
    next(error);
  }
}
