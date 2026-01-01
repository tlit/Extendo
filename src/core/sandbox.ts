export class Sandbox {
  /**
   * Wraps code in a try-catch block that reports back to the extension.
   * This is crucial for "Self-Healing".
   */
  /**
   * Wraps code in a consistent execution harness.
   * @param code The raw JavaScript code to execute.
   * @param metadata Optional metadata for logging (e.g. { type: 'style' }).
   */
  static createExecutionContext(code: string, metadata: { type?: string } = {}): string {
    const typeLabel = metadata.type ? `(${metadata.type})` : '';
    return `
      (async function ExtendoRoutine() {
        console.log("Extendo: Starting Routine ${typeLabel}");
        try {
          // --- AI GENERATED CODE START ---
          ${code}
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
    `;
  }
}
