# Extendo Documentation

Current Version: 0.1.0 (Genesis)

## Architecture Overview
Extendo is an **Extension Function Engine**. It does not just provide tools; it injects new logic into the browser at runtime using `chrome.scripting`.

```mermaid
graph TD
    A[Extendo Popup] -->|User Intent| B[Antigravity AI]
    B -->|Generates Code| C[Background Engine]
    C -->|Stored as| D[Micro-Extension]
    D -->|Injected via| E[Content Script Sandbox]
    E -->|Manipulates| F[Active Tab DOM]
```

## Developer Guide
### Commands
*   `npm run dev`: Start HMR server.
*   `npm run build`: Production build to `dist/`.
