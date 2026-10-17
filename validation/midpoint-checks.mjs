import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { generateStudyPackWithMock } from '../server/src/services/ai/providers/mockProvider.js';

const out = process.argv[2] || 'evidence/midpoint-after/regression';
mkdirSync(out, { recursive: true });
const acid = JSON.parse(readFileSync(new URL('../evidence/core-run-1/input.json', import.meta.url), 'utf8'));
const results = [];
const outputs = [];
async function check(id, name, fn) {
  try { await fn(); results.push({ id, name, status: 'PASS' }); }
  catch (error) { results.push({ id, name, status: 'FAIL', error: error.message }); }
}
function uniqueItems(pack) {
  assert.ok(pack.flashcards.length > 0);
  assert.ok(pack.questions.length > 0);
  assert.equal(new Set(pack.flashcards.map(c => c.front.toLowerCase())).size, pack.flashcards.length);
  assert.equal(new Set(pack.questions.map(q => q.prompt.toLowerCase())).size, pack.questions.length);
  for (const q of pack.questions) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.includes(q.correctAnswer));
    assert.ok(q.explanation.startsWith('Source note: '));
  }
}
await check('M01', 'Same ACID fixture returns four unique items, not padded requested counts', async () => {
  const pack = await generateStudyPackWithMock(acid); outputs.push({ input: acid, output: pack });
  uniqueItems(pack); assert.equal(pack.flashcards.length, 4); assert.equal(pack.questions.length, 4);
  assert.equal(pack.flashcards.find(c => c.front === 'What does Consistency preserve?').back, 'Consistency preserves database rules before and after a transaction.');
  assert.deepEqual(await generateStudyPackWithMock(acid), pack);
});
await check('M02', 'Adequate notes still fulfill six cards and five questions', async () => {
  const input = { ...acid, content: acid.content + '\n\nA primary key identifies each database record.\n\nA foreign key refers to a record in another table.' };
  const pack = await generateStudyPackWithMock(input); outputs.push({ input, output: pack });
  uniqueItems(pack); assert.equal(pack.flashcards.length, 6); assert.equal(pack.questions.length, 5);
});
await check('M03', 'Repeated source sentences do not produce repeated items', async () => {
  const input = { ...acid, content: acid.content + '\n\n' + acid.content };
  const pack = await generateStudyPackWithMock(input); outputs.push({ input, output: pack });
  uniqueItems(pack); assert.equal(pack.flashcards.length, 4);
});
await check('M04', 'Single fact returns one item and neutral distractors', async () => {
  const input = { ...acid, content: 'Photosynthesis uses light energy to produce sugars in plants.' };
  const pack = await generateStudyPackWithMock(input); outputs.push({ input, output: pack });
  uniqueItems(pack); assert.equal(pack.flashcards.length, 1); assert.equal(pack.questions.length, 1);
  assert.equal(pack.flashcards[0].back, input.content);
  assert.ok(!JSON.stringify(pack).includes('healthy habits'));
});
await check('M05', 'Ambiguous and incomplete notes retain source wording without invented completion', async () => {
  const input = { ...acid, content: 'The experiment may depend on an unspecified temperature.\n\nThe author left the explanation unfinished because' };
  const pack = await generateStudyPackWithMock(input); outputs.push({ input, output: pack });
  uniqueItems(pack); assert.equal(pack.flashcards.length, 2);
  assert.equal(pack.flashcards[1].back, 'The author left the explanation unfinished because.');
  assert.ok(!pack.flashcards.some(c => c.front.includes('before and after?')));
});
await check('M06', 'Long notes use later facts for items; eight-point summary limit remains explicit', async () => {
  const input = { ...acid, content: Array.from({length: 12}, (_, i) => `Concept ${i + 1} means the source definition numbered ${i + 1}.`).join('\n\n') };
  const pack = await generateStudyPackWithMock(input); outputs.push({ input, output: pack });
  uniqueItems(pack); assert.equal(pack.flashcards.length, 6);
  assert.ok(pack.flashcards.some(c => c.front.includes('Concept 12')));
  assert.equal(pack.keyPoints.length, 8);
});
await check('M07', 'Empty direct input returns no fabricated study items', async () => {
  const pack = await generateStudyPackWithMock({ ...acid, content: ' ' });
  assert.equal(pack.flashcards.length, 0); assert.equal(pack.questions.length, 0);
});

process.env.AI_PROVIDER = 'mock'; delete process.env.GEMINI_API_KEY;
const { default: app } = await import('../server/src/app.js');
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
try {
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [id, content, expected, count] of [['M08', acid.content, 4, 6], ['M09', acid.content, 3, 3]]) {
    await check(id, 'HTTP flashcard count and shortfall notice', async () => {
      const response = await fetch(base + '/api/ai/flashcards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Midpoint fixture', content, count, aiProvider: 'mock' }) });
      assert.equal(response.status, 200); const body = await response.json();
      outputs.push({ id, response: body }); assert.equal(body.flashcards.length, expected);
      assert.equal(new Set(body.flashcards.map(c => c.front)).size, expected);
      assert.equal(body.warnings.length, expected < count ? 1 : 0);
      if (expected < count) assert.ok(body.warnings[0].includes('4 flashcards out of 6'));
    });
  }
} finally { await new Promise(resolve => server.close(resolve)); }
writeFileSync(`${out}/outputs.json`, JSON.stringify(outputs, null, 2));
const report = { recordedAt: new Date().toISOString(), runtime: process.version, platform: process.platform, scope: 'Mock direct-function and isolated HTTP regression only. No database, browser interaction or live-provider validation. Original count targets and SC2 remain separate.', results };
writeFileSync(`${out}/results.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = results.some(r => r.status === 'FAIL') ? 1 : 0;
