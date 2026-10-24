import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
process.env.AI_PROVIDER='mock';delete process.env.GEMINI_API_KEY;
const {default:app}=await import('../../server/src/app.js');
const out=process.argv[2]||`evidence/ru08/http-${Date.now()}`;
if(existsSync(out))throw Error('Choose a new output directory.');mkdirSync(out,{recursive:true});
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const base=`http://127.0.0.1:${server.address().port}`;
const valid={title:'Atomicity notes',content:'Atomicity makes a transaction an all-or-nothing operation.',count:6,aiProvider:'mock'};
const cases=[['empty', {...valid,content:''},400],['whitespace',{...valid,content:' '.repeat(50)},400],['too-short',{...valid,content:'short'},400],['over-limit',{...valid,content:'x'.repeat(20001)},400],['count-below-min',{...valid,count:2},400],['count-above-max',{...valid,count:21},400],['unsupported-provider',{...valid,aiProvider:'invalid'},400],['missing-gemini-key',{...valid,aiProvider:'gemini',aiModel:'test-model'},400],['sparse-valid',valid,200]];
const results=[];
try{
 for(const [id,input,expected]of cases){const res=await fetch(base+'/api/ai/flashcards',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const body=await res.json();let error;try{assert.equal(res.status,expected);if(expected===200){assert.equal(body.flashcards.length,1);assert.equal(body.warnings.length,1);}}catch(e){error=e.message;}results.push({id,input,expected,status:res.status,body,result:error?'FAIL':'PASS',...(error?{error}:{})});}
 const bad=await fetch(base+'/api/ai/flashcards',{method:'POST',headers:{'Content-Type':'application/json'},body:'{invalid'});results.push({id:'malformed-json',expected:400,status:bad.status,body:await bad.json(),result:bad.status===400?'PASS':'FAIL'});
 // Nine valid-JSON calls consumed the limiter; malformed JSON is rejected before it.
 for(let i=10;i<=21;i++){const res=await fetch(base+'/api/ai/flashcards',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(valid)});const body=await res.json();const expected=i<=20?200:429;results.push({id:`rate-limit-request-${i}`,expected,status:res.status,body,result:res.status===expected?'PASS':'FAIL'});}
 const health=await fetch(base+'/api/health');results.push({id:'health-after-failures',expected:200,status:health.status,body:await health.json(),result:health.status===200?'PASS':'FAIL'});
}finally{await new Promise(r=>server.close(r));}
const report={recordedAt:new Date().toISOString(),runtime:process.version,platform:process.platform,scope:'Isolated Express HTTP; mock provider and missing-key validation. No database writes; no live-provider outage simulation. Fixed request order on fresh app instance.',results};writeFileSync(`${out}/results.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({output:out,pass:results.filter(r=>r.result==='PASS').length,fail:results.filter(r=>r.result==='FAIL').length},null,2));process.exitCode=results.some(r=>r.result==='FAIL')?1:0;
