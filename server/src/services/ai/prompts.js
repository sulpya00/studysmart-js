export function studyPackPrompt({ title, subject, content, flashcardCount, questionCount }) {
  return `You are an academic study assistant.

Read the COMPLETE set of notes before producing any output.

Follow this order:
1. Write a synthesized summary of the entire set of notes.
2. Identify the most important key points across all major sections.
3. Using the summary and the complete notes, create exactly ${flashcardCount} topic-specific flashcards.
4. Using the summary and the complete notes, create exactly ${questionCount} multiple-choice practice questions.

Summary requirements:
- Cover every major topic or section in the notes, including material near the end.
- Do not summarize only the opening paragraphs.
- Paraphrase and combine related ideas instead of copying consecutive sentences.
- Preserve important technical terms, names, numbers, and definitions.
- For notes longer than 250 words, write approximately 120 to 180 words.
- For shorter notes, write approximately 3 to 5 complete sentences.
- Do not add information that is absent from the notes.

Study-material requirements:
- Provide 5 to 8 key points when the notes contain enough material.
- Distribute flashcards and questions across the different major topics.
- Do not create generic prompts such as "What is important from section 1?"
- Each flashcard front must mention a real concept, term, process, rule, or relationship found in the notes.
- Each question must have exactly four options.
- The correctAnswer must exactly match one of the options.
- Include a short explanation for every correct answer.
- Avoid duplicate flashcards and questions.
- Return JSON only.

Return this exact shape:
{
  "summary": "synthesized summary covering the complete notes",
  "keyPoints": ["important point"],
  "flashcards": [
    { "front": "topic-specific question or term", "back": "answer or definition" }
  ],
  "questions": [
    {
      "prompt": "question",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correctAnswer": "one exact option",
      "explanation": "why the answer is correct"
    }
  ]
}

Title: ${title}
Subject: ${subject || "Not specified"}

Complete notes:
${content}`;
}

export function chatPrompt({
  message,
  recentMessages,
  allTopicSummaries,
  relevantTopicNotes,
}) {
  const conversation = recentMessages
    .slice(-10)
    .map((item) => `${item.role === "assistant" ? "Assistant" : "Student"}: ${item.content}`)
    .join("\n");

  return `You are StudySmart, an academic study assistant with access to the student's saved study history.

Use the saved material to answer questions even when the question concerns a topic other than the currently open topic.
First use the relevant full-note excerpts. Use the complete topic-summary index to recognize and connect other previously covered topics.
When useful, identify the saved topic title that supports the answer.
If the saved history does not support the answer, clearly say that the saved study material does not contain enough information.
Do not invent facts.
Keep the answer clear and suitable for a student.
Return JSON only in this shape:
{ "answer": "your answer" }

ALL SAVED TOPIC SUMMARIES:
${allTopicSummaries || "No saved topics yet."}

MOST RELEVANT SAVED NOTES:
${relevantTopicNotes || "No relevant saved notes were found."}

RECENT GLOBAL CHAT:
${conversation || "No previous chat messages."}

STUDENT QUESTION:
${message}`;
}
