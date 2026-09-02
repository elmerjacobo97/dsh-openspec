export type WorkflowId = 'explore' | 'propose' | 'apply' | 'sync' | 'archive' | 'update';
export interface WorkflowDefinition {
    readonly id: WorkflowId;
    readonly commandName: `opsx-${WorkflowId}`;
    readonly description: string;
    readonly content: string;
}
/** Load one workflow directly from the official OpenSpec package. */
export declare function loadWorkflow(id: WorkflowId): Promise<WorkflowDefinition>;
/** Load all six workflows in the OpenSpec core profile. */
export declare function loadCoreWorkflows(): Promise<readonly WorkflowDefinition[]>;
