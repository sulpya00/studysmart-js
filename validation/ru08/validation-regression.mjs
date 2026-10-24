import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { validateStudyPack } from '../../server/src/services/ai/validateStudyPack.js';
const out=process.argv[2]||`evidence/ru08/validation-fix-${Date.now()}`;
if(existsSync(out))throw Error('Use a new output directory.');mkdirSync(out,{recursive:true});
const raw=readFileSync('evidence/ru08/gemini-windows-1/runs.jsonl');
const rows=raw.toString().trim().split('\n').map(JSON.parse),results=[];
async function check(id,fn){try{const details=await fn();results.push({id,status:'PASS',details});}catch(e){results.push({id,status:'FAIL',error:e.message});}}
for(const r of rows)await check(`replay-${r.fixture}-${r.repeat}`,()=>{
 if(r.fixture==='F05'&&r.repeat===3){assert.throws(()=>validateStudyPack(r.output,r.input),e=>e.statusCode===502&&e.validationIssues.some(i=>i.path.join('.')==='questions.4.options'));return 'Historical malformed output rejected; this is a replay, not a new generation.';}
 const p=validateStudyPack(r.output,r.input);assert.equal(p.flashcards.length,6);assert.equal(p.questions.length,5);return 'Historical structurally valid pack accepted; semantics not assessed.';
});
const source=rows[0];
const cases=[['missing-summary',p=>delete p.summary],['empty-card-answer',p=>p.flashcards[0].back=' '],['duplicate-options',p=>p.questions[0].options[1]=' '+p.questions[0].options[0].toUpperCase()+' '],['answer-not-in-options',p=>p.questions[0].correctAnswer='not an option'],['missing-explanation',p=>delete p.questions[0].explanation],['duplicate-card',p=>p.flashcards[1]=p.flashcards[0]],['duplicate-question',p=>p.questions[1]=p.questions[0]],['empty-items',p=>p.flashcards=[]],['too-many-cards',p=>p.flashcards.push(p.flashcards[0])]];
for(const [id,mutate]of cases)await check(id,()=>{const p=structuredClone(source.output);mutate(p);assert.throws(()=>validateStudyPack(p,source.input),e=>e.statusCode===502);});
await check('valid-shortfall',()=>{const p=structuredClone(source.output);p.flashcards=p.flashcards.slice(0,1);p.questions=p.questions.slice(0,1);assert.equal(validateStudyPack(p,source.input).flashcards.length,1);});
// Local Ollama-protocol stub exercises the real provider adapter/service/controller chain.
// It replays captured Gemini objects; it is not an Ollama or Gemini model evaluation.
let payload=rows.find(r=>r.fixture==='F05'&&r.repeat===3).output;
const stub=createServer((req,res)=>{req.resume();req.on('end',()=>{res.setHeader('content-type','application/json');res.end(JSON.stringify({response:JSON.stringify(payload)}));});});
stub.listen(0,'127.0.0.1');await new Promise(r=>stub.once('listening',r));
process.env.OLLAMA_BASE_URL=`http://127.0.0.1:${stub.address().port}`;
const {default:app}=await import('../../server/src/app.js');const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const url=`http://127.0.0.1:${server.address().port}`;
try{
 await check('HTTP-invalid-pack-502-before-save',async()=>{
  const r=await fetch(url+'/api/ai/study-pack',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...source.input,aiProvider:'ollama',aiModel:'fixture-replay',userEmail:'ru08@example.test'})});const body=await r.json();assert.equal(r.status,502);assert.deepEqual(Object.keys(body),['message']);assert.match(body.message,/invalid study pack/);return {status:r.status,body};
 });
 await check('HTTP-valid-shortfall-warning',async()=>{
  payload=structuredClone(source.output);payload.flashcards=payload.flashcards.slice(0,1);payload.questions=payload.questions.slice(0,1);
  const r=await fetch(url+'/api/ai/flashcards',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:source.input.title,content:source.input.content,count:6,aiProvider:'ollama',aiModel:'fixture-replay'})});const body=await r.json();assert.equal(r.status,200);assert.equal(body.flashcards.length,1);assert.equal(body.warnings.length,1);assert.match(body.warnings[0],/1 flashcards out of 6/);return {status:r.status,returned:body.flashcards.length,warnings:body.warnings};
 });
}finally{await new Promise(r=>server.close(r));await new Promise(r=>stub.close(r));}
const report={recordedAt:new Date().toISOString(),runtime:process.version,platform:process.platform,scope:'Historical provider-output replay, deliberate malformed payloads, and local Ollama-protocol stub through real HTTP routes. No live generation, database persistence or semantic-quality measurement.',sourceSha256:createHash('sha256').update(raw).digest('hex'),results};writeFileSync(`${out}/results.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({pass:results.filter(r=>r.status==='PASS').length,fail:results.filter(r=>r.status==='FAIL').length},null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
