import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
process.env.AI_PROVIDER='mock';delete process.env.GEMINI_API_KEY;
const {default:app}=await import('../server/src/app.js');
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const base=`http://127.0.0.1:${server.address().port}`;const results=[];
const input=JSON.parse(readFileSync('evidence/core-run-1/input.json','utf8'));
for(const [id,path,body,status] of [
 ['H01','/api/health',null,200],
 ['H02','/api/ai/study-pack',{userEmail:'validation@example.com',title:'Transactions',content:'',aiProvider:'mock'},400],
 ['H03','/api/history/topics?userEmail=invalid',null,400],
 ['H04','/api/ai/flashcards',{...input,title:'Transactions',count:6,aiProvider:'mock'},200],
 ['H05','/api/ai/study-pack',{...input,userEmail:'validation@example.com',title:'Transactions',aiProvider:'gemini',aiModel:'test-model'},400]
]){try{const r=await fetch(base+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const response=await r.json();assert.equal(r.status,status);if(id==='H04')assert.equal(response.flashcards.length,6);results.push({id,path,status:'PASS',httpStatus:r.status,response});}catch(e){results.push({id,path,status:'FAIL',error:e.message});}}
server.close();mkdirSync('evidence/http',{recursive:true});writeFileSync('evidence/http/results.json',JSON.stringify({recordedAt:new Date().toISOString(),scope:'HTTP without database or external AI calls',results},null,2));console.log(results.map(r=>r.id+' '+r.status).join('\n'));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
