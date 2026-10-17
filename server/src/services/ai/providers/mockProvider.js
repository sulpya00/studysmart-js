const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is", "it", "of", "on", "or", "that", "the", "this", "to", "was", "were", "what", "which", "with",
]);

function sentencesFrom(content) {
  return content
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 18);
}

function paragraphsFrom(content) {
  return content
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function cleanSentence(sentence) {
  return sentence.replace(/[.!?]+$/, "").trim();
}

function keywords(value) {
  return value
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((word) => word.length > 2 && !STOP_WORDS.has(word)) || [];
}

function sentenceScore(sentence, documentFrequency, position) {
  const terms = keywords(sentence);
  const uniqueTerms = [...new Set(terms)];
  const frequencyScore = uniqueTerms.reduce((total, term) => total + (documentFrequency.get(term) || 0), 0);
  const lengthScore = Math.min(terms.length, 24) / 24;
  const positionBonus = position === 0 ? 2 : position === 1 ? 0.75 : 0;
  return frequencyScore + lengthScore + positionBonus;
}

function representativeSentences(content) {
  const paragraphs = paragraphsFrom(content);
  const allSentences = sentencesFrom(content);
  const documentFrequency = new Map();

  for (const term of keywords(content)) {
    documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
  }

  if (paragraphs.length <= 1) {
    return [...allSentences]
      .map((sentence, index) => ({ sentence, index, score: sentenceScore(sentence, documentFrequency, index) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(5, allSentences.length))
      .sort((a, b) => a.index - b.index)
      .map((item) => item.sentence);
  }

  return paragraphs.map((paragraph) => {
    const paragraphSentences = sentencesFrom(paragraph);
    if (paragraphSentences.length === 0) return paragraph;

    return paragraphSentences
      .map((sentence, index) => ({ sentence, score: sentenceScore(sentence, documentFrequency, index) }))
      .sort((a, b) => b.score - a.score)[0].sentence;
  });
}

function lightlyCompress(sentence) {
  let value = cleanSentence(sentence)
    .replace(/^In conclusion,?\s*/i, "")
    .replace(/^One important part of (.+?) is (.+)$/i, "$2 is an important part of $1")
    .replace(/^(.+?) is another major part of (.+)$/i, "$1 is a major part of $2")
    .replace(/^(.+?) should also receive the same attention as (.+)$/i, "$1 deserves the same attention as $2")
    .replace(/^Regular (.+?) is equally important$/i, "Regular $1 is also important")
    .trim();

  if (value) value = value.charAt(0).toUpperCase() + value.slice(1);
  if (!/[.!?]$/.test(value)) value += ".";
  return value;
}

function spreadItems(items, count) {
  if (!items.length || count <= 0) return [];
  if (count >= items.length) return [...items];
  if (count === 1) return [items[Math.floor(items.length / 2)]];

  const selected = [];
  for (let index = 0; index < count; index += 1) {
    const sourceIndex = Math.round((index * (items.length - 1)) / (count - 1));
    selected.push(items[sourceIndex]);
  }
  return selected;
}

function expandFacts(sentences) {
  const verbs = "requires|organizes|uses|allows|helps|prevents|removes|includes|contains|determines|provides|improves|reduces|improve|reduce|supports|strengthens|affects|protects|encourages|maintains";
  const compoundPattern = new RegExp(String.raw`^(.+?)\s+(${verbs})\s+(.+?)\s+and\s+(${verbs})\s+(.+)$`, "i");
  const primaryFacts = sentences.map((sentence) => `${cleanSentence(sentence)}.`);
  const extraFacts = [];

  for (const sentence of sentences) {
    const cleaned = cleanSentence(sentence);
    const match = cleaned.match(compoundPattern);
    if (!match) continue;

    const [, subject, firstVerb, firstPredicate, secondVerb, secondPredicate] = match;
    extraFacts.push(`${subject.trim()} ${firstVerb.toLowerCase()} ${firstPredicate.trim()}.`);
    extraFacts.push(`${subject.trim()} ${secondVerb.toLowerCase()} ${secondPredicate.trim()}.`);
  }

  return [...primaryFacts, ...extraFacts]
    .filter((fact, index, all) => all.indexOf(fact) === index);
}

function analyzeStatement(sentence) {
  const cleaned = cleanSentence(sentence);
  const patterns = [
    { regex: /^(.+?)\s+(preserves)\s+(.+)$/i, question: (subject) => `What does ${subject} preserve?` },
    { regex: /^(.+?)\s+(requires)\s+(.+)$/i, question: (subject) => `What does ${subject} require?` },
    { regex: /^(.+?)\s+(means|refers to|is|are)\s+(.+)$/i, question: (subject) => `What is ${subject}?` },
    { regex: /^(.+?)\s+(organizes|uses|allows|helps|prevents|removes|includes|contains|determines|provides|improves|reduces|improve|reduce|supports|strengthens|affects|protects|encourages|maintains)\s+(.+)$/i, question: (subject, verb) => {
      const baseVerb = {
        organizes: "organize", uses: "use", allows: "allow", helps: "help", prevents: "prevent",
        removes: "remove", includes: "include", contains: "contain", determines: "determine", provides: "provide",
        improves: "improve", reduces: "reduce", improve: "improve", reduce: "reduce", supports: "support",
        strengthens: "strengthen", affects: "affect", protects: "protect", encourages: "encourage", maintains: "maintain",
      }[verb] || verb;
      return `What does ${subject} ${baseVerb}?`;
    } },
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern.regex);
    if (match) {
      const subject = match[1].trim();
      const verb = match[2].toLowerCase();
      const predicate = match[3].trim();
      const answerVerb = { improve: "improves", reduce: "reduces" }[verb] || verb;
      return {
        subject,
        predicate,
        question: pattern.question(subject, verb),
        answer: verb === "is" || verb === "are" || verb === "means" || verb === "refers to"
          ? predicate
          : `${subject} ${answerVerb} ${predicate}.`,
      };
    }
  }

  return {
    subject: cleaned,
    predicate: cleaned,
    question: `Complete this statement from the notes: ${cleaned.split(/\s+/).slice(0, 3).join(" ")} ...`,
    answer: `${cleaned}.`,
  };
}

function rotateOptions(correct, distractors, index) {
  const unique = [correct, ...distractors.filter((item) => item !== correct)]
    .filter((item, position, items) => item && items.indexOf(item) === position)
    .slice(0, 4);

  while (unique.length < 4) {
    unique.push([
      "The supplied notes do not support this statement.",
      "It is unrelated to the main topic.",
      "The notes state the opposite of this explanation.",
    ][unique.length - 1] || "None of the supplied notes support this statement.");
  }

  const offset = index % unique.length;
  return [...unique.slice(offset), ...unique.slice(0, offset)];
}

export async function generateStudyPackWithMock({ content, flashcardCount, questionCount }) {
  const sentences = sentencesFrom(content);
  const source = sentences.length ? sentences : [content.trim()].filter(Boolean);
  const representatives = representativeSentences(content);
  const facts = expandFacts(source);
  const statements = facts
    .map((fact) => ({ ...analyzeStatement(fact), source: fact }))
    .filter((statement, index, all) => all.findIndex((item) => item.question.toLowerCase() === statement.question.toLowerCase()) === index);

  const summarySentences = representatives
    .slice(0, 8)
    .map(lightlyCompress)
    .filter((sentence, index, all) => all.indexOf(sentence) === index);
  const summary = summarySentences.join(" ");
  const keyPoints = representatives
    .slice(0, 8)
    .map(lightlyCompress);

  const flashcardStatements = spreadItems(statements, Math.min(flashcardCount, statements.length));
  const questionStatements = spreadItems(statements, Math.min(questionCount, statements.length));

  const flashcards = flashcardStatements.map((statement) => {
    return { front: statement.question, back: statement.answer };
  });

  const questions = questionStatements.map((statement, index) => {
    const distractors = spreadItems(
      statements.filter((item) => item.answer !== statement.answer),
      3,
    ).map((item) => item.answer);

    return {
      prompt: statement.question,
      options: rotateOptions(statement.answer, distractors, index),
      correctAnswer: statement.answer,
      explanation: `Source note: ${statement.source}`,
    };
  });

  return { summary, keyPoints, flashcards, questions, provider: "mock", model: "paragraph-aware-demo" };
}

export async function generateChatWithMock({ content, message }) {
  const sentences = sentencesFrom(content);
  const queryWords = new Set(keywords(message));
  let bestSentence = "";
  let bestScore = 0;

  for (const sentence of sentences) {
    const score = keywords(sentence).reduce((total, word) => total + (queryWords.has(word) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  }

  const answer = bestScore > 0
    ? `Based on your notes: ${bestSentence}`
    : "The supplied notes do not contain enough information to answer that question. Try asking about one of the concepts included in the summary or key points.";

  return { answer, provider: "mock", model: "paragraph-aware-demo" };
}
