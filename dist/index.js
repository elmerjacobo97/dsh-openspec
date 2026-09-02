import { registerOpenSpecCommands } from './commands.js';
export const name = 'dsh-openspec';
export const inject = ['commands'];
export function apply(ctx) {
    registerOpenSpecCommands(ctx);
}
