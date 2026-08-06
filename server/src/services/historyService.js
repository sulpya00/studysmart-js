import { getPrisma } from "../lib/prisma.js";

function db() {
  return getPrisma();
}

const GLOBAL_CHAT_TITLE = "StudySmart Global Chat";
const MAX_TOPIC_SUMMARIES = 50;
const MAX_RELEVANT_TOPICS = 6;

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "by", "for", "from", "has", "have", "how", "i", "in", "is", "it", "of", "on", "or", "that", "the", "this", "to", "was", "were", "what", "when", "where", "which", "who", "why", "with", "you", "your",
]);

function keywords(value = "") {
  return String(value)
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((word) => word.length > 2 && !STOP_WORDS.has(word)) || [];
}

function truncate(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function scoreTopic(topic, queryWords, currentTopicId) {
  const titleWords = keywords(topic.title);
  const subjectWords = keywords(topic.subject);
  const summaryWords = keywords(topic.summaries[0]?.content);
  const contentWords = keywords(topic.content);
  const counts = new Map();

  for (const word of titleWords) counts.set(word, (counts.get(word) || 0) + 8);
  for (const word of subjectWords) counts.set(word, (counts.get(word) || 0) + 5);
  for (const word of summaryWords) counts.set(word, (counts.get(word) || 0) + 3);
  for (const word of contentWords) counts.set(word, (counts.get(word) || 0) + 1);

  let score = topic.id === currentTopicId ? 12 : 0;
  for (const word of queryWords) score += counts.get(word) || 0;
  return score;
}

export async function ensureUser({ email, name }) {
  return db().user.upsert({
    where: { email },
    update: { name: name || undefined },
    create: { email, name: name || email.split("@")[0] },
  });
}

export async function saveStudyPack({ userEmail, userName, input, result }) {
  const user = await ensureUser({ email: userEmail, name: userName });

  return db().$transaction(async (tx) => {
    const note = await tx.note.create({
      data: {
        title: input.title,
        subject: input.subject || null,
        content: input.content,
        userId: user.id,
        summaries: {
          create: {
            title: `${input.title} summary`,
            content: result.summary,
            keyPoints: result.keyPoints,
          },
        },
        flashcardSets: {
          create: {
            title: `${input.title} flashcards`,
            cards: {
              create: result.flashcards.map((card) => ({
                front: card.front,
                back: card.back,
              })),
            },
          },
        },
        questionSets: {
          create: {
            title: `${input.title} questions`,
            questions: {
              create: result.questions.map((question) => ({
                prompt: question.prompt,
                options: question.options,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
              })),
            },
          },
        },
      },
    });

    await tx.aIRequest.create({
      data: {
        feature: "study-pack",
        provider: result.provider,
        model: result.model,
        status: "success",
        approximateSize: input.content.length,
        userId: user.id,
      },
    });

    return note;
  });
}

export async function listStudyTopics(userEmail) {
  const user = await db().user.findUnique({ where: { email: userEmail } });
  if (!user) return [];

  const notes = await db().note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      summaries: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { flashcardSets: true, questionSets: true } },
    },
  });

  return notes.map((note) => ({
    id: note.id,
    title: note.title,
    subject: note.subject || "",
    summary: note.summaries[0]?.content || "",
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }));
}

export async function getStudyTopic({ topicId, userEmail }) {
  const user = await db().user.findUnique({ where: { email: userEmail } });
  if (!user) return null;

  const note = await db().note.findFirst({
    where: { id: topicId, userId: user.id },
    include: {
      summaries: { orderBy: { createdAt: "desc" }, take: 1 },
      flashcardSets: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { cards: { orderBy: { createdAt: "asc" } } },
      },
      questionSets: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { questions: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!note) return null;

  const summary = note.summaries[0];
  const flashcardSet = note.flashcardSets[0];
  const questionSet = note.questionSets[0];

  return {
    id: note.id,
    title: note.title,
    subject: note.subject || "",
    content: note.content,
    summary: summary?.content || "",
    keyPoints: Array.isArray(summary?.keyPoints) ? summary.keyPoints : [],
    flashcards: (flashcardSet?.cards || []).map((card) => ({
      front: card.front,
      back: card.back,
      reviewStatus: card.reviewStatus,
    })),
    questions: (questionSet?.questions || []).map((question) => ({
      prompt: question.prompt,
      options: Array.isArray(question.options) ? question.options : [],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "Review the relevant point in the notes.",
    })),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export async function deleteStudyTopic({ topicId, userEmail }) {
  const user = await db().user.findUnique({ where: { email: userEmail } });
  if (!user) return false;

  const result = await db().note.deleteMany({
    where: { id: topicId, userId: user.id },
  });
  return result.count > 0;
}

async function getOrCreateGlobalChatSession(userId) {
  const existing = await db().chatSession.findFirst({
    where: { userId, title: GLOBAL_CHAT_TITLE, noteId: null },
  });

  if (existing) return existing;

  return db().chatSession.create({
    data: { title: GLOBAL_CHAT_TITLE, userId },
  });
}

export async function getChatHistory(userEmail) {
  const user = await db().user.findUnique({ where: { email: userEmail } });
  if (!user) return [];

  const session = await db().chatSession.findFirst({
    where: { userId: user.id, title: GLOBAL_CHAT_TITLE, noteId: null },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 100 } },
  });

  return session?.messages.slice().reverse().map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
  })) || [];
}

export async function prepareChatContext({ userEmail, userName, message, currentTopicId }) {
  const user = await ensureUser({ email: userEmail, name: userName });
  const session = await getOrCreateGlobalChatSession(user.id);

  const [topics, recentMessages] = await Promise.all([
    db().note.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: MAX_TOPIC_SUMMARIES,
      include: { summaries: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    db().chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const queryWords = [...new Set(keywords(message))];
  const scored = topics
    .map((topic) => ({ topic, score: scoreTopic(topic, queryWords, currentTopicId) }))
    .sort((a, b) => b.score - a.score || b.topic.createdAt - a.topic.createdAt);

  const relevant = scored.filter((item) => item.score > 0).slice(0, MAX_RELEVANT_TOPICS);
  const selected = relevant.length ? relevant : scored.slice(0, Math.min(4, scored.length));

  const allTopicSummaries = topics
    .map((topic) => [
      `Topic ID: ${topic.id}`,
      `Title: ${topic.title}`,
      `Subject: ${topic.subject || "Not specified"}`,
      `Summary: ${truncate(topic.summaries[0]?.content || topic.content, 550)}`,
    ].join("\n"))
    .join("\n\n---\n\n");

  const relevantTopicNotes = selected
    .map(({ topic }) => [
      `Title: ${topic.title}`,
      `Subject: ${topic.subject || "Not specified"}`,
      `Summary: ${truncate(topic.summaries[0]?.content, 900)}`,
      `Full notes excerpt: ${truncate(topic.content, 3200)}`,
    ].join("\n"))
    .join("\n\n---\n\n");

  return {
    user,
    session,
    topics,
    sourceTopics: selected.map(({ topic }) => ({ id: topic.id, title: topic.title })),
    allTopicSummaries,
    relevantTopicNotes,
    recentMessages: recentMessages.reverse().map((item) => ({ role: item.role, content: item.content })),
  };
}

export async function saveChatMessage({ sessionId, role, content }) {
  return db().chatMessage.create({
    data: { sessionId, role, content },
  });
}
