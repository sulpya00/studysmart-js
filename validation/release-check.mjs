import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateStudyPackWithMock } from '../server/src/services/ai/providers/mockProvider.js';

const location = new URL('../evidence/core-run-1/input.json', import.meta.url);
const input = JSON.parse(await readFile(location, 'utf8'));
const { flashcards, questions } = await generateStudyPackWithMock(input);

assert.equal(flashcards.length, 4);
assert.equal(new Set(flashcards.map(card => card.front)).size, 4);
assert.equal(questions.length, 4);
assert.equal(new Set(questions.map(question => question.prompt)).size, 4);
for (const question of questions) {
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options).size, 4);
  assert.ok(question.options.includes(question.correctAnswer));
}
console.log('PASS: packaged fixture generated four unique cards and four unique questions with valid answer choices.');
