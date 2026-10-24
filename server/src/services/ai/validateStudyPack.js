import { z } from 'zod';

const text = z.string().trim().min(1);
const normalized = value => value.toLowerCase().replace(/\s+/g, ' ').trim();
const card = z.object({ front: text, back: text });
const question = z.object({
  prompt: text,
  options: z.array(text).length(4),
  correctAnswer: text,
  explanation: text,
}).superRefine((value, ctx) => {
  if (new Set(value.options.map(normalized)).size !== 4) {
    ctx.addIssue({ code: 'custom', path: ['options'], message: 'Four distinct options are required.' });
  }
  if (!value.options.includes(value.correctAnswer)) {
    ctx.addIssue({ code: 'custom', path: ['correctAnswer'], message: 'Answer must match an option.' });
  }
});

// Shape checks cannot establish factual grounding or semantic uniqueness.
// Shortfalls are allowed; controllers already report requested/returned counts.
export function validateStudyPack(generated, { flashcardCount, questionCount }) {
  const schema = z.object({
    summary: text,
    keyPoints: z.array(text).max(8),
    flashcards: z.array(card).min(1).max(flashcardCount),
    questions: z.array(question).min(1).max(questionCount),
    provider: text,
    model: text,
  }).superRefine((value, ctx) => {
    for (const [field, key] of [['flashcards', 'front'], ['questions', 'prompt']]) {
      const seen = new Set();
      value[field].forEach((item, index) => {
        const label = normalized(item[key]);
        if (seen.has(label)) ctx.addIssue({ code: 'custom', path: [field, index, key], message: 'Duplicate prompt.' });
        seen.add(label);
      });
    }
  });
  const result = schema.safeParse(generated);
  if (!result.success) {
    // Wrap ZodError so a bad provider response is not classified as a bad user request (400).
    const error = new Error('The AI provider returned an invalid study pack. Please try again.');
    error.statusCode = 502;
    error.code = 'INVALID_STUDY_PACK';
    // Non-enumerable: available to the synthetic benchmark, not console error dumps.
    Object.defineProperty(error, 'validationIssues', { value: result.error.issues });
    Object.defineProperty(error, 'rawOutput', { value: generated });
    throw error;
  }
  return result.data;
}
