import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

// Allow the popup itself to be harvested (Useful for testing "Extendo automating Extendo")
import { ContextHarvester } from './core/harvester';
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "HARVEST") {
        const context = ContextHarvester.harvest();
        sendResponse(context);
    }
});
