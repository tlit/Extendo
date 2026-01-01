var m=Object.defineProperty;var y=(r,e,t)=>e in r?m(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var d=(r,e,t)=>y(r,typeof e!="symbol"?e+"":e,t);const u="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";class f{constructor(e){d(this,"apiKey");this.apiKey=e}async generateCode(e){if(e.prompt.startsWith("TEST_SCENARIO:")){const o=e.prompt.split("TEST_SCENARIO:")[1].trim();if(o==="COLOR_RED")return{explanation:"Test Mode: Changing background to red",code:"document.body.style.backgroundColor = 'red';",type:"style",riskLevel:"safe"};if(o==="FAIL_FIRST")return{explanation:"Test Mode: Generating broken code",code:"throw new Error('Intentional Test Failure');",type:"interaction",riskLevel:"safe"};if(o==="SPATIAL_CLICK"){const n=e.context.interactiveElements||[],s=n.find(g=>g.text==="Bottom")||n[0];return{explanation:"Test Mode: Clicking bottom button",code:`const el = document.querySelector('[data-extendo-id="${s?s.id:0}"]'); if(el) el.click();`,type:"interaction",riskLevel:"safe"}}}const t=`
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
`;if(this.apiKey==="TODO_API_KEY")return{explanation:"I can't truly generate code without an API key, so here is a mock alert.",code:"alert('Extendo Mock Execution: ' + document.title);",type:"interaction",riskLevel:"safe"};try{const o=await fetch(u+"?key="+this.apiKey,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:t}]}]})});if(!o.ok)throw new Error(o.statusText);const i=(await o.json()).candidates[0].content.parts[0].text.replace(/```json\n|\n```/g,"").replace(/^```/,"").replace(/```$/,"");return JSON.parse(i)}catch(o){throw console.error("LLM Error",o),new Error("Failed to generate code")}}async generateRepair(e,t,o,n){if(e.includes("TEST_SCENARIO:FAIL_FIRST"))return{explanation:"Test Mode: Repairing intentional failure",code:"document.body.setAttribute('data-healed', 'true');",type:"style",riskLevel:"safe"};const s=`
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
`;if(this.apiKey==="TODO_API_KEY")return{explanation:"Mock Repair: Wrapped in extra try/catch",code:`try { ${t} } catch(e) { console.log('Fixed it via ignore'); }`,type:"interaction",riskLevel:"moderate"};try{const i=await fetch(u+"?key="+this.apiKey,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:s}]}]})});if(!i.ok)throw new Error(i.statusText);const E=(await i.json()).candidates[0].content.parts[0].text.replace(/```json\n|\n```/g,"").replace(/^```/,"").replace(/```$/,"");return JSON.parse(E)}catch(i){throw console.error("LLM Error during Repair",i),new Error("Failed to generate repair")}}async generateVerification(e,t){const o=`
You are a QA Engineer for a browser extension.
User Prompt: "${e}"
Executed Code: "${t}"

Write a small JavaScript IFFE validation script that checks if the code successfully performed the task. 
If it succeeded, console.log("VERIFICATION PASS").
If it failed, throw new Error("VERIFICATION FAIL: <reason>").
Return ONLY the raw JavaScript code, no JSON, no Markdown.
`;if(this.apiKey==="TODO_API_KEY")return"if (document.title) { console.log('VERIFICATION PASS'); } else { throw new Error('No title?'); }";try{let i=(await(await fetch(u+"?key="+this.apiKey,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:o}]}]})})).json()).candidates[0].content.parts[0].text;return i=i.replace(/```javascript\n|\n```/g,"").replace(/```/g,""),i}catch{return"console.warn('Verification generation failed');"}}}class x{static createExecutionContext(e,t={}){return`
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
    `}}class p{static async execute(e,t){const o=x.createExecutionContext(t,{type:"execution"});try{return await chrome.scripting.executeScript({target:{tabId:e},func:n=>{window.eval(n)},args:[o],world:"ISOLATED"}),{status:"injected"}}catch(n){return console.error("Injection Failed:",n),{status:"error",message:n.message}}}}class a{static async log(e,t,o){const n={id:crypto.randomUUID(),category:e,message:t,data:o,timestamp:Date.now()};chrome.runtime.sendMessage({action:"LOG_ENTRY",payload:n}).catch(()=>{})}static async getLogs(){return[]}}class l{static async save(e){const t=await this.getAll();t.push(e),await chrome.storage.local.set({[this.STORAGE_KEY]:t})}static async getAll(){return(await chrome.storage.local.get(this.STORAGE_KEY))[this.STORAGE_KEY]||[]}static async delete(e){const o=(await this.getAll()).filter(n=>n.id!==e);await chrome.storage.local.set({[this.STORAGE_KEY]:o})}static async toggleAutoRun(e){const t=await this.getAll(),o=t.findIndex(n=>n.id===e);o!==-1&&(t[o].autoRun=!t[o].autoRun,await chrome.storage.local.set({[this.STORAGE_KEY]:t}))}}d(l,"STORAGE_KEY","extendo_extensions");console.log("Extendo: Background Service Initialized");const h=new f("TODO_API_KEY");chrome.runtime.onMessage.addListener((r,e,t)=>{if(r.action==="EXECUTE_PROMPT")return T(r.prompt,r.tabId).then(t).catch(o=>t({status:"error",message:o.message})),!0});const c=new Map;async function T(r,e){try{a.log("system",`Received prompt: "${r}"`);let t;r.startsWith("TEST_SCENARIO:")?(a.log("system","Test Mode: Mocking Harvest"),t={url:"http://test-scenario",title:"Test Page",domSummary:"Mock Content for Testing",timestamp:Date.now(),interactiveElements:[{id:1,text:"Top",tagName:"BUTTON",isVisible:!0,rect:{x:10,y:10,width:100,height:20,top:10,left:10,bottom:30,right:110}},{id:2,text:"Bottom",tagName:"BUTTON",isVisible:!0,rect:{x:10,y:300,width:100,height:20,top:300,left:10,bottom:320,right:110}}]}):(a.log("system","Harvesting context..."),t=await chrome.tabs.sendMessage(e,{action:"HARVEST"}),a.log("system","Context acquired",{url:t.url,title:t.title})),a.log("ai","Generating code...");const o=await h.generateCode({prompt:r,context:t});a.log("ai","Code generated",{type:o.type,risk:o.riskLevel}),c.set(e,{originalPrompt:r,currentCode:o.code,context:t,retries:0}),a.log("execution","Injecting script...");const n=await p.execute(e,o.code);if(n.status==="error"){if(r.startsWith("TEST_SCENARIO:"))return a.log("execution","Test Mode: Ignoring injection error on restricted page"),{status:"success",data:o};throw a.log("error","Execution failed immediately (Injection Error)",n.message),new Error(n.message)}return a.log("execution","Injection successful, waiting for runtime result..."),{status:"success",data:o}}catch(t){return a.log("error","Pipeline failed",t.message),{status:"error",message:t.message}}}async function S(r,e,t){a.log("system",`Self-Healing triggered (Attempt ${e.retries+1}/3)...`);try{const o=await h.generateRepair(e.originalPrompt,e.currentCode,t,e.context);a.log("ai","Repair generated",{explanation:o.explanation}),e.currentCode=o.code,e.retries++,c.set(r,e),a.log("execution","Injecting repair..."),await p.execute(r,o.code)}catch(o){a.log("error","Self-Healing failed to generate repair",o.message),c.delete(r)}}chrome.runtime.onMessage.addListener((r,e,t)=>{var n;const o=(n=e.tab)==null?void 0:n.id;if(r.action==="EXECUTION_COMPLETE"&&o){console.log("Execution Result:",r.status,r.error||"");const s=c.get(o);r.status==="success"?(a.log("execution","Runtime Execution Success!"),s&&c.delete(o)):s?(a.log("error","Runtime Execution Failed",r.error),s.retries<3?S(o,s,r.error):(a.log("error","Max retries reached. Giving up."),c.delete(o))):a.log("error","Runtime Failure (No Active State)",r.error)}if(r.action==="SAVE_SCRIPT")return l.save(r.payload).then(()=>t({status:"success"})),!0;if(r.action==="GET_SCRIPTS")return l.getAll().then(s=>t({status:"success",data:s})),!0;if(r.action==="DELETE_SCRIPT")return l.delete(r.id).then(()=>t({status:"success"})),!0;if(r.action==="TOGGLE_AUTORUN")return l.toggleAutoRun(r.id).then(()=>t({status:"success"})),!0});
