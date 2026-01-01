import { AIResponse } from '../types';
import { Sandbox } from './sandbox';

export class CodeGenerator {
  /**
   * Generates a "Micro-Extension" metadata blob.
   */
  static createManifest(response: AIResponse, trigger: string) {
    return {
      id: crypto.randomUUID(),
      created: Date.now(),
      trigger: trigger,
      code: Sandbox.createExecutionContext(response.code, { type: response.type }),
      type: response.type
    };
  }
}
