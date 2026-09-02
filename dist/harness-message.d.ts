import type { UserMessage } from '@deepseek-ai/dsh-llm';
import type { WorkflowDefinition } from './openspec-workflows.js';
export declare function buildWorkflowPrompt(workflow: WorkflowDefinition, rawInput: string): string;
export declare function createWorkflowMessage(workflow: WorkflowDefinition, rawInput: string): UserMessage;
