var m=Object.defineProperty;var f=(r,e,t)=>e in r?m(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var u=(r,e,t)=>f(r,typeof e!="symbol"?e+"":e,t);const y="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";class d{constructor(e){this.apiKey=e}async generateContent(e){if(this.apiKey==="TODO_API_KEY")throw new Error("API Key not configured");try{const t=await fetch(y+"?key="+this.apiKey,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:e}]}]})});if(!t.ok)throw new Error(t.statusText);return(await t.json()).candidates[0].content.parts[0].text}catch(t){throw console.error("Gemini API Error",t),t}}static parseFnResponse(e){const t=e.replace(/```json\n|\n```/g,"").replace(/^```/,"").replace(/```$/,"");return JSON.parse(t)}}class h{static handle(e,t){if(!e.startsWith("TEST_SCENARIO:"))return null;const o=e.split("TEST_SCENARIO:")[1].trim();if(o==="COLOR_RED")return{explanation:"Test Mode: Changing background to red",code:"document.body.style.backgroundColor = 'red';",type:"style",riskLevel:"safe"};if(o==="FAIL_FIRST")return{explanation:"Test Mode: Generating broken code",code:"throw new Error('Intentional Test Failure');",type:"interaction",riskLevel:"safe"};if(o==="SPATIAL_CLICK"){const n=t.interactiveElements||[],i=n.find(c=>c.text==="Bottom")||n[0];return{explanation:"Test Mode: Clicking bottom button",code:`const el = document.querySelector('[data-extendo-id="${i?i.id:0}"]'); if(el) el.click();`,type:"interaction",riskLevel:"safe"}}return null}static handleRepair(e){return e.includes("TEST_SCENARIO:FAIL_FIRST")?{explanation:"Test Mode: Repairing intentional failure",code:"document.body.setAttribute('data-healed', 'true');",type:"style",riskLevel:"safe"}:null}}class x{constructor(e){u(this,"client");u(this,"apiKey");this.apiKey=e,this.client=new d(e)}async generateCode(e){const t=h.handle(e.prompt,e.context);if(t)return t;const o=`
You are Extendo, an expert browser automation agent.
Your goal is to write a single, efficient, self-contained JavaScript function that accomplishes the user's task on the current page.

Context:
${JSON.stringify(e.context,null,2)}

Note on Spatial Awareness:
The context includes a list of 'interactiveElements' with their coordinates (x, y, top, left, etc.).
If the user asks for "the button below the search bar" or "the one on the right", USE THESE COORDINATES to find the correct element ID.
You can then select the element using: document.querySelector('[data-extendo-id="<ID>"]')

User Request: "${e.prompt}"

Return a JSON object with this structure:
{
  "explanation": "Brief 1-sentence description of what you did",
  "code": "The JavaScript code to execute. Do not wrap in markdown blocks.",
  "type": "style" | "scrape" | "interaction" | "analysis",
  "riskLevel": "safe" | "medium" | "high" 
}
`;if(this.apiKey==="TODO_API_KEY")return{explanation:"I can't truly generate code without an API key, so here is a mock alert.",code:"alert('Extendo Mock Execution: ' + document.title);",type:"interaction",riskLevel:"safe"};try{const n=await this.client.generateContent(o);return d.parseFnResponse(n)}catch(n){throw console.error("LLM Error",n),new Error("Failed to generate code")}}async generateRepair(e,t,o,n){const i=h.handleRepair(e);if(i)return i;const g=`
You are Extendo, an expert browser automation agent.
You previously generated code that FAILED to execute.

Original Request: "${e}"
Context:
${JSON.stringify(n,null,2)}

Broken Code:
${t}

Error Message:
${o}

Your goal is to fix the code so it works.
Analyze the error. Is it a syntax error? A selector issue? A logic bug?
Return the FIXED code in the same JSON format as before:
{
  "explanation": "Brief 1-sentence description of the fix",
  "code": "The FIXED JavaScript code.",
  "type": "style" | "scrape" | "interaction" | "analysis",
  "riskLevel": "safe" | "medium" | "high" 
}
`;if(this.apiKey==="TODO_API_KEY")return{explanation:"Mock Repair: Wrapped in extra try/catch",code:`try { ${t} } catch(e) { console.log('Fixed it via ignore'); }`,type:"interaction",riskLevel:"moderate"};try{const c=await this.client.generateContent(g);return d.parseFnResponse(c)}catch(c){throw console.error("LLM Error during Repair",c),new Error("Failed to generate repair")}}async generateVerification(e,t){const o=`
You are a QA Engineer for a browser extension.
User Prompt: "${e}"
Executed Code: "${t}"

Write a small JavaScript IFFE validation script that checks if the code successfully performed the task. 
If it succeeded, console.log("VERIFICATION PASS").
If it failed, throw new Error("VERIFICATION FAIL: <reason>").
Return ONLY the raw JavaScript code, no JSON, no Markdown.
`;if(this.apiKey==="TODO_API_KEY")return"if (document.title) { console.log('VERIFICATION PASS'); } else { throw new Error('No title?'); }";try{let n=await this.client.generateContent(o);return n=n.replace(/```javascript\n|\n```/g,"").replace(/```/g,""),n}catch{return"console.warn('Verification generation failed');"}}}class T{static createExecutionContext(e,t={}){return`
      (async function ExtendoRoutine() {
        console.log("Extendo: Starting Routine ${t.type?`(${t.type})`:""}");
        try {
          // --- AI GENERATED CODE START ---
          ${e}
          // --- AI GENERATED CODE END ---
          console.log("Extendo: Routine Complete");
          // Report success
          chrome.runtime.sendMessage({ action: "EXECUTION_COMPLETE", status: "success" });
        } catch (error) {
          console.error("Extendo Execution Error:", error);
          // Report error for potential self-healing
          chrome.runtime.sendMessage({ 
            action: "EXECUTION_COMPLETE", 
            status: "error", 
            error: error.message,
            stack: error.stack
          });
        }
      })();
    `}}class p{static async execute(e,t){const o=T.createExecutionContext(t,{type:"execution"});try{return await chrome.scripting.executeScript({target:{tabId:e},func:n=>{window.eval(n)},args:[o],world:"ISOLATED"}),{status:"injected"}}catch(n){return console.error("Injection Failed:",n),{status:"error",message:n.message}}}}class a{static async log(e,t,o){const n={id:crypto.randomUUID(),category:e,message:t,data:o,timestamp:Date.now()};chrome.runtime.sendMessage({action:"LOG_ENTRY",payload:n}).catch(()=>{})}static async getLogs(){return[]}}class l{static async save(e){const t=await this.getAll();t.push(e),await chrome.storage.local.set({[this.STORAGE_KEY]:t})}static async getAll(){return(await chrome.storage.local.get(this.STORAGE_KEY))[this.STORAGE_KEY]||[]}static async delete(e){const o=(await this.getAll()).filter(n=>n.id!==e);await chrome.storage.local.set({[this.STORAGE_KEY]:o})}static async toggleAutoRun(e){const t=await this.getAll(),o=t.findIndex(n=>n.id===e);o!==-1&&(t[o].autoRun=!t[o].autoRun,await chrome.storage.local.set({[this.STORAGE_KEY]:t}))}}u(l,"STORAGE_KEY","extendo_extensions");console.log("Extendo: Background Service Initialized");const E=new x("TODO_API_KEY");chrome.runtime.onMessage.addListener((r,e,t)=>{if(r.action==="EXECUTE_PROMPT")return I(r.prompt,r.tabId).then(t).catch(o=>t({status:"error",message:o.message})),!0});const s=new Map;async function I(r,e){try{a.log("system",`Received prompt: "${r}"`);let t;r.startsWith("TEST_SCENARIO:")?(a.log("system","Test Mode: Mocking Harvest"),t={url:"http://test-scenario",title:"Test Page",domSummary:"Mock Content for Testing",timestamp:Date.now(),interactiveElements:[{id:1,text:"Top",tagName:"BUTTON",isVisible:!0,rect:{x:10,y:10,width:100,height:20,top:10,left:10,bottom:30,right:110}},{id:2,text:"Bottom",tagName:"BUTTON",isVisible:!0,rect:{x:10,y:300,width:100,height:20,top:300,left:10,bottom:320,right:110}}]}):(a.log("system","Harvesting context..."),t=await chrome.tabs.sendMessage(e,{action:"HARVEST"}),a.log("system","Context acquired",{url:t.url,title:t.title})),a.log("ai","Generating code...");const o=await E.generateCode({prompt:r,context:t});a.log("ai","Code generated",{type:o.type,risk:o.riskLevel}),s.set(e,{originalPrompt:r,currentCode:o.code,context:t,retries:0}),a.log("execution","Injecting script...");const n=await p.execute(e,o.code);if(n.status==="error"){if(r.startsWith("TEST_SCENARIO:")&&!r.includes("FAIL_FIRST"))return a.log("execution","Test Mode: Ignoring injection error on restricted page"),{status:"success",data:o};throw a.log("error","Execution failed immediately (Injection Error)",n.message),new Error(n.message)}return a.log("execution","Injection successful, waiting for runtime result..."),{status:"success",data:o}}catch(t){return a.log("error","Pipeline failed",t.message),{status:"error",message:t.message}}}async function S(r,e,t){a.log("system",`Self-Healing triggered (Attempt ${e.retries+1}/3)...`);try{const o=await E.generateRepair(e.originalPrompt,e.currentCode,t,e.context);a.log("ai","Repair generated",{explanation:o.explanation}),e.currentCode=o.code,e.retries++,s.set(r,e),a.log("execution","Injecting repair..."),await p.execute(r,o.code)}catch(o){a.log("error","Self-Healing failed to generate repair",o.message),s.delete(r)}}chrome.runtime.onMessage.addListener((r,e,t)=>{var n;const o=(n=e.tab)==null?void 0:n.id;if(r.action==="EXECUTION_COMPLETE"&&o){console.log("Execution Result:",r.status,r.error||"");const i=s.get(o);r.status==="success"?(a.log("execution","Runtime Execution Success!"),i&&s.delete(o)):i?(a.log("error","Runtime Execution Failed",r.error),i&&i.retries<3?S(o,i,r.error):(a.log("error","Max retries reached. Giving up."),s.delete(o))):a.log("error","Runtime Failure (No Active State)",r.error),chrome.runtime.sendMessage({action:"RUNTIME_UPDATE",status:r.status,error:r.error,tabId:o}).catch(()=>{})}if(r.action==="SAVE_SCRIPT")return l.save(r.payload).then(()=>t({status:"success"})),!0;if(r.action==="GET_SCRIPTS")return l.getAll().then(i=>t({status:"success",data:i})),!0;if(r.action==="DELETE_SCRIPT")return l.delete(r.id).then(()=>t({status:"success"})),!0;if(r.action==="TOGGLE_AUTORUN")return l.toggleAutoRun(r.id).then(()=>t({status:"success"})),!0});
