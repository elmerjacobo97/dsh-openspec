import { describe, expect, it } from 'vitest';

import {
  loadCoreWorkflows,
  loadWorkflow,
  type WorkflowId,
} from '../src/openspec-workflows.js';
import { buildWorkflowPrompt } from '../src/harness-message.js';

const ids: readonly WorkflowId[] = [
  'explore',
  'propose',
  'apply',
  'sync',
  'archive',
  'update',
];

describe('official OpenSpec workflows', () => {
  it('loads the six core workflows from the installed package', async () => {
    const workflows = await loadCoreWorkflows();

    expect(workflows.map(({ id }) => id)).toEqual(ids);
    for (const workflow of workflows) {
      expect(workflow.commandName).toBe(`opsx-${workflow.id}`);
      expect(workflow.description.length).toBeGreaterThan(0);
      expect(workflow.content).toContain('openspec ');
    }
  });

  it('rewrites official canonical references to DSH command names', async () => {
    const archive = await loadWorkflow('archive');

    expect(archive.content).toContain('/opsx-archive');
    expect(archive.content).toContain('/opsx-sync');
    expect(archive.content).not.toContain('/opsx:archive');
    expect(archive.content).not.toContain('/opsx:sync');
  });

  it('preserves command input in the model-facing prompt', async () => {
    const workflow = await loadWorkflow('propose');
    const prompt = buildWorkflowPrompt(workflow, 'add dark mode');

    expect(prompt).toContain('add dark mode');
    expect(prompt).toContain(workflow.content);
    expect(prompt).toContain('/opsx-propose');
  });
});
