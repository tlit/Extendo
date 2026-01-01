/// <reference types="chrome" />
console.log("Extendo: Content Injector Active");

// This will be the injection point for dynamic scripts
import { ContextHarvester } from '../core/harvester';

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "HARVEST") {
        const context = ContextHarvester.harvest();
        sendResponse(context);
    }
});
