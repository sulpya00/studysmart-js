import { readFileSync, mkdirSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import { generateStudyPack } from '../../server/src/services/ai/aiService.js';
const provider=process.argv[2] || 'mock';
if(!['mock','gemini'].includes(provider)) throw Error('Choose mock or gemini');
if(provider==='gemini' && (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL)) throw Error('Load server/.env with GEMINI_API_KEY and GEMINI_MODEL configured.');
const out=process.argv[3] || `evidence/ru08/${provider}-${new Date().toISOString().replace(/[:.]/g,'-')}`;
if(existsSync(out)) throw Error('Output directory already exists; choose a new directory to preserve evidence.');
mkdirSync(out,{recursive:true});
const fixtureBytes=readFileSync(new URL('./fixtures.json',import.meta.url));
const fixtures=JSON.parse(fixtureBytes);
const hash=b=>createHash('sha256').update(b).digest('hex');
const metadata={startedAt:new Date().toISOString(),scope:'Direct generation service only: excludes HTTP cleanup, database, UI, and learning outcomes.',provider,model:provider==='mock'?'paragraph-aware-demo':process.env.GEMINI_MODEL,repetitions:3,order:'fixture-major, sequential; no warmup; no harness retries',parameters:{flashcardCount:6,questionCount:5,temperature:'not explicitly set by application',seed:'not set'},runtime:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model,totalMemory:os.totalmem(),commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),gitStatus:execFileSync('git',['status','--short'],{encoding:'utf8'}),fixtureSha256:hash(fixtureBytes),scriptSha256:hash(readFileSync(new URL(import.meta.url))),lockSha256:hash(readFileSync('package-lock.json')),sourceHashes:Object.fromEntries(['server/src/services/ai/aiService.js','server/src/services/ai/validateStudyPack.js','server/src/services/ai/prompts.js','server/src/services/ai/providers/geminiProvider.js','server/src/services/ai/providers/mockProvider.js'].map(p=>[p,hash(readFileSync(p))]))};
writeFileSync(`${out}/metadata.json`,JSON.stringify(metadata,null,2));
writeFileSync(`${out}/fixtures.json`,fixtureBytes);
const rows=[]; const review=[];
const words=s=>String(s||'').trim().split(/\s+/).filter(Boolean);
const norm=s=>String(s||'').toLowerCase().trim().replace(/\s+/g,' ');
for(const f of fixtures){
 for(let repeat=1;repeat<=3;repeat++){
  const input={title:f.title,subject:f.subject,content:f.content,flashcardCount:6,questionCount:5,aiProvider:provider,...(provider==='gemini'?{aiModel:process.env.GEMINI_MODEL}:{})};
  const row={fixture:f.id,repeat,startedAt:new Date().toISOString(),input};
  const start=performance.now();
  try{
   const pack=await generateStudyPack(input); row.elapsedMs=performance.now()-start; row.status='RETURNED'; row.output=pack;
   const cards=Array.isArray(pack.flashcards)?pack.flashcards:[],qs=Array.isArray(pack.questions)?pack.questions:[];
   row.metrics={summaryPresent:typeof pack.summary==='string'&&!!pack.summary.trim(),cards:cards.length,questions:qs.length,countsMet:cards.length===6&&qs.length===5,duplicateCardFronts:cards.length-new Set(cards.map(c=>norm(c?.front))).size,duplicateQuestionPrompts:qs.length-new Set(qs.map(q=>norm(q?.prompt))).size,validCards:cards.filter(c=>typeof c?.front==='string'&&c.front.trim()&&typeof c.back==='string'&&c.back.trim()).length,validQuestions:qs.filter(q=>typeof q?.prompt==='string'&&q.prompt.trim()&&Array.isArray(q.options)&&q.options.length===4&&q.options.every(o=>typeof o==='string'&&o.trim())&&new Set(q.options.map(norm)).size===4&&q.options.includes(q.correctAnswer)&&typeof q.explanation==='string'&&q.explanation.trim()).length};
   // Lead-sentence baseline capped at generated summary word count; not scored automatically.
   const sentences=f.content.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[f.content]; let baseline=''; const budget=words(pack.summary).length;
   for(const s of sentences){if(words(baseline+' '+s).length>budget) break; baseline+=(baseline?' ':'')+s.trim();}
   row.baseline={method:'Whole leading sentences within generated-summary word budget',wordBudget:budget,text:baseline,words:words(baseline).length};
   for(const target of ['generated-summary','lead-baseline']) for(let i=0;i<f.expectedFacts.length;i++)review.push({fixture:f.id,repeat,target,factId:i+1,expectedFact:f.expectedFacts[i],covered:'',reviewer:'',rationale:''});
  }catch(e){row.elapsedMs=performance.now()-start;row.status='ERROR';if(e.code==='INVALID_STUDY_PACK'){row.rejectedOutput=e.rawOutput;row.validationIssues=e.validationIssues;}row.error={name:e.name,message:String(e.message).replace(/AIza[\w-]+/g,'[redacted]')};}
  rows.push(row);appendFileSync(`${out}/runs.jsonl`,JSON.stringify(row)+'\n');
  console.log(`${f.id} run ${repeat}: ${row.status} ${Math.round(row.elapsedMs)} ms`);
 }
}
const returned=rows.filter(r=>r.status==='RETURNED');
const timings=returned.map(r=>r.elapsedMs).sort((a,b)=>a-b); const n=timings.length;
const summary={attempts:rows.length,returned:n,errors:rows.length-n,countsMet:returned.filter(r=>r.metrics.countsMet).length,allItemsStructurallyValid:returned.filter(r=>r.metrics.summaryPresent&&r.metrics.cards>0&&r.metrics.questions>0&&r.metrics.validCards===r.metrics.cards&&r.metrics.validQuestions===r.metrics.questions).length,exactDuplicateFree:returned.filter(r=>r.metrics.duplicateCardFronts===0&&r.metrics.duplicateQuestionPrompts===0).length,successfulLatencyMs:n?{median:n%2?timings[(n-1)/2]:(timings[n/2-1]+timings[n/2])/2,min:timings[0],max:timings[n-1]}:null,humanQualityReview:'PENDING; automated structural checks do not establish factual accuracy',completedAt:new Date().toISOString()};
writeFileSync(`${out}/summary.json`,JSON.stringify(summary,null,2));
writeFileSync(`${out}/human-review.json`,JSON.stringify(review,null,2));
console.log(JSON.stringify(summary,null,2));
process.exitCode=summary.errors?1:0;
