import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
const mode=process.argv[2]||'create';
if(!['create','verify'].includes(mode))throw Error('Use create or verify');
const base=process.env.VALIDATION_URL||'http://localhost:4000';
const dir='evidence/local-workflow';mkdirSync(dir,{recursive:true});
const log=[];
async function call(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(90000)});const data=await r.json();log.push({path,status:r.status,response:data});return {status:r.status,data};}
try{
 assert.equal((await call('/api/health')).status,200);
 if(mode==='create'){
  if(existsSync(`${dir}/saved.json`))throw Error('Existing saved run found. Run verify first; archive evidence/local-workflow before creating another run.');
  const input=JSON.parse(readFileSync('evidence/core-run-1/input.json','utf8'));
  const body={...input,title:'HS3 Database Transactions',subject:'Databases',userEmail:`hs3-${Date.now()}@example.com`,aiProvider:'mock'};
  writeFileSync(`${dir}/request.json`,JSON.stringify(body,null,2));
  const r=await call('/api/ai/study-pack',body);assert.equal(r.status,200);assert.equal(r.data.saved,true);assert.ok(r.data.topicId);assert.equal(r.data.flashcards.length,6);assert.equal(r.data.questions.length,5);
  writeFileSync(`${dir}/saved.json`,JSON.stringify({body,result:r.data},null,2));
 }
 const saved=JSON.parse(readFileSync(`${dir}/saved.json`,'utf8'));const q=`?userEmail=${encodeURIComponent(saved.body.userEmail)}`;
 const list=await call('/api/history/topics'+q);assert.equal(list.status,200);assert.ok(list.data.topics.some(t=>t.id===saved.result.topicId));
 const r=await call('/api/history/topics/'+encodeURIComponent(saved.result.topicId)+q);assert.equal(r.status,200);assert.equal(r.data.topic.content,saved.body.content);assert.equal(r.data.topic.summary,saved.result.summary);
 const canonical=xs=>xs.map(x=>JSON.stringify(x)).sort();
 assert.deepEqual(canonical(r.data.topic.flashcards.map(({front,back})=>({front,back}))),canonical(saved.result.flashcards));
 assert.deepEqual(canonical(r.data.topic.questions),canonical(saved.result.questions));
 const invalid=await call('/api/ai/study-pack',{...saved.body,content:''});assert.equal(invalid.status,400);
 console.log('PASS '+mode+'. '+(mode==='create'?'Now stop and restart the app, then run verify.':'Restart persistence is established only if you restarted the app before this command.'));
}catch(e){log.push({error:e.message});console.error(e.message);process.exitCode=1;}finally{writeFileSync(`${dir}/${mode}-${Date.now()}.json`,JSON.stringify({recordedAt:new Date().toISOString(),runtime:process.version,mode,log},null,2));}
