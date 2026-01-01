console.log("Extendo: Content Injector Active");
import { ContextHarvester } from "/src/core/harvester.ts.js";
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "HARVEST") {
    const context = ContextHarvester.harvest();
    sendResponse(context);
  }
});
