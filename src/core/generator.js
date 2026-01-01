"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenerator = void 0;
class CodeGenerator {
    /**
     * Wraps the raw AI code in a safety harness.
     */
    static wrap(response) {
        // Basic IIFE wrapper with error reporting
        return `
      (async function ExtendoRoutine() {
        console.log("Extendo: Starting Routine (${response.type})");
        try {
          // --- AI GENERATED CODE START ---
          ${response.code}
          // --- AI GENERATED CODE END ---
          console.log("Extendo: Routine Complete");
        } catch (err) {
          console.error("Extendo: Routine Failed", err);
          // TODO: Send error back to background for "Self-Healing"
        }
      })();
    `;
    }
    /**
     * Generates a "Micro-Extension" metadata blob.
     */
    static createManifest(response, trigger) {
        return {
            id: crypto.randomUUID(),
            created: Date.now(),
            trigger: trigger,
            code: this.wrap(response),
            type: response.type
        };
    }
}
exports.CodeGenerator = CodeGenerator;
