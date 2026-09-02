import { createUserMessage } from '@deepseek-ai/dsh-llm';
import type { UserMessage } from '@deepseek-ai/dsh-llm';

import type { WorkflowDefinition } from './openspec-workflows.js';

const AVAILABLE_COMMANDS = [
  '/opsx-explore',
  '/opsx-propose',
  '/opsx-apply',
  '/opsx-sync',
  '/opsx-archive',
  '/opsx-update',
] as const;

export function buildWorkflowPrompt(
  workflow: WorkflowDefinition,
  rawInput: string,
): string {
  const input = rawInput.trim();
  return [
    `Run the official OpenSpec workflow for /${workflow.commandName} in the current repository.`,
    '',
    'The user invoked this workflow with the following input:',
    input === '' ? '(no additional input)' : input,
    '',
    `DeepSeek Harness exposes these OpenSpec commands: ${AVAILABLE_COMMANDS.join(', ')}.`,
    'Use the OpenSpec CLI and the repository context to resolve roots, schemas, changes, and paths. Do not assume a fixed OpenSpec directory layout.',
    '',
    'Follow the official workflow instructions below. Do not replace them with a shorter or independently designed workflow.',
    '',
    '--- official OpenSpec workflow ---',
    workflow.content,
    '--- end official OpenSpec workflow ---',
  ].join('\n');
}

export function createWorkflowMessage(
  workflow: WorkflowDefinition,
  rawInput: string,
): UserMessage {
  return createUserMessage({
    content: [{
      type: 'text',
      text: buildWorkflowPrompt(workflow, rawInput),
    }],
    source: {
      kind: 'plugin',
      plugin: 'dsh-openspec',
      form: 'instructions',
    },
  });
}
