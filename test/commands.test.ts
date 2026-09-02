import { describe, expect, it } from 'vitest';

import { registerOpenSpecCommands } from '../src/commands.js';
import { loadWorkflow } from '../src/openspec-workflows.js';

const expectedNames = [
  'opsx-explore',
  'opsx-propose',
  'opsx-apply',
  'opsx-sync',
  'opsx-archive',
  'opsx-update',
] as const;

describe('DeepSeek Harness command registration', () => {
  it('registers exactly the six OpenSpec core commands', () => {
    const definitions: Array<{ name: string }> = [];
    const ctx = {
      commands: {
        register(definition: { name: string }) {
          definitions.push(definition);
          return () => undefined;
        },
      },
    } as never;

    registerOpenSpecCommands(ctx);

    expect(definitions.map(({ name }) => name)).toEqual(expectedNames);
  });

  it('starts the selected official workflow on the receiving agent', async () => {
    const definitions: Array<{
      name: string;
      handler(invocation: never): Promise<{ kind: string; text?: string }>;
    }> = [];
    const ctx = {
      commands: {
        register(definition: (typeof definitions)[number]) {
          definitions.push(definition);
          return () => undefined;
        },
      },
    } as never;
    registerOpenSpecCommands(ctx);

    const steered: unknown[] = [];
    const invocation = {
      rawInput: 'add dark mode',
      signal: new AbortController().signal,
      agent: {
        steer(message: unknown) {
          steered.push(message);
        },
      },
    };

    const result = await definitions[1].handler(invocation as never);

    expect(result).toEqual({
      kind: 'success',
      text: 'Started the official OpenSpec propose workflow.',
    });
    expect(steered).toHaveLength(1);
    expect((steered[0] as { content: Array<{ text: string }> }).content[0].text).toContain(
      'add dark mode',
    );
    expect((steered[0] as { content: Array<{ text: string }> }).content[0].text).toContain(
      (await loadWorkflow('propose')).content,
    );
  });
});
