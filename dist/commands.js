import { createWorkflowMessage } from './harness-message.js';
import { loadWorkflow } from './openspec-workflows.js';
const COMMANDS = [
    {
        id: 'explore',
        description: 'explore a repository before proposing an OpenSpec change',
        hint: '[topic]',
    },
    {
        id: 'propose',
        description: 'propose a new OpenSpec change and generate its artifacts',
        hint: '[change name or description]',
    },
    {
        id: 'apply',
        description: 'implement tasks from an OpenSpec change',
        hint: '[change name]',
    },
    {
        id: 'sync',
        description: 'sync an OpenSpec change into the main specifications',
        hint: '[change name]',
    },
    {
        id: 'archive',
        description: 'archive a completed OpenSpec change',
        hint: '[change name]',
    },
    {
        id: 'update',
        description: 'revise an existing OpenSpec change and its artifacts',
        hint: '[change name]',
    },
];
function errorText(error) {
    return error instanceof Error ? error.message : String(error);
}
async function executeWorkflow(invocation, id) {
    if (invocation.signal.aborted) {
        return { kind: 'error', text: 'The OpenSpec command was cancelled before it started.' };
    }
    let workflow;
    try {
        workflow = await loadWorkflow(id);
    }
    catch (error) {
        return { kind: 'error', text: errorText(error) };
    }
    if (invocation.signal.aborted) {
        return { kind: 'error', text: 'The OpenSpec command was cancelled before it started.' };
    }
    invocation.agent.steer(createWorkflowMessage(workflow, invocation.rawInput));
    return {
        kind: 'success',
        text: `Started the official OpenSpec ${id} workflow.`,
    };
}
function definitionFor(entry) {
    return {
        name: `opsx-${entry.id}`,
        description: entry.description,
        input: { hint: entry.hint },
        handler: (invocation) => executeWorkflow(invocation, entry.id),
    };
}
export function registerOpenSpecCommands(ctx) {
    for (const entry of COMMANDS) {
        ctx.commands.register(definitionFor(entry));
    }
}
export const openSpecCommandNames = COMMANDS.map(({ id }) => `opsx-${id}`);
