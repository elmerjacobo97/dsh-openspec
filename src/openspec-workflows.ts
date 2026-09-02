import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

export type WorkflowId =
  | 'explore'
  | 'propose'
  | 'apply'
  | 'sync'
  | 'archive'
  | 'update';

export interface WorkflowDefinition {
  readonly id: WorkflowId;
  readonly commandName: `opsx-${WorkflowId}`;
  readonly description: string;
  readonly content: string;
}

type OfficialTemplate = {
  readonly name: unknown;
  readonly description: unknown;
  readonly content: unknown;
};

type OfficialTemplateFactory = () => OfficialTemplate;
type OfficialInvocation = {
  readonly style: 'flat';
  readonly prefix: '/';
};
type OfficialReferenceTransformer = (
  text: string,
  invocation: OfficialInvocation,
) => string;

const WORKFLOW_MODULES: Readonly<Record<WorkflowId, readonly [string, string]>> = {
  explore: ['explore.js', 'getOpsxExploreCommandTemplate'],
  propose: ['propose.js', 'getOpsxProposeCommandTemplate'],
  apply: ['apply-change.js', 'getOpsxApplyCommandTemplate'],
  sync: ['sync-specs.js', 'getOpsxSyncCommandTemplate'],
  archive: ['archive-change.js', 'getOpsxArchiveCommandTemplate'],
  update: ['update-change.js', 'getOpsxUpdateCommandTemplate'],
};

const workflowCache = new Map<WorkflowId, Promise<WorkflowDefinition>>();
let openspecEntry: URL | undefined;
const require = createRequire(import.meta.url);

function resolveOpenSpecEntry(): URL {
  if (openspecEntry !== undefined) return openspecEntry;

  try {
    openspecEntry = pathToFileURL(require.resolve('@fission-ai/openspec'));
    return openspecEntry;
  } catch (error) {
    throw new Error(
      'dsh-openspec: could not resolve the official @fission-ai/openspec package',
      { cause: error },
    );
  }
}

async function importOfficialModule(relativePath: string): Promise<Record<string, unknown>> {
  const entry = resolveOpenSpecEntry();
  try {
    return (await import(new URL(`./${relativePath}`, entry).href)) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `dsh-openspec: the installed @fission-ai/openspec package does not expose its official module ${relativePath}`,
      { cause: error },
    );
  }
}

async function loadOfficialReferenceTransformer(): Promise<OfficialReferenceTransformer> {
  const module = await importOfficialModule('utils/command-references.js');
  const transformer = module.transformCommandInvocations;
  if (typeof transformer !== 'function') {
    throw new Error(
      'dsh-openspec: the installed @fission-ai/openspec package is missing transformCommandInvocations',
    );
  }
  return transformer as OfficialReferenceTransformer;
}

function validateTemplate(id: WorkflowId, template: OfficialTemplate): WorkflowDefinition {
  if (
    typeof template.description !== 'string' ||
    typeof template.content !== 'string'
  ) {
    throw new Error(
      `dsh-openspec: official OpenSpec template for ${id} has an incompatible shape`,
    );
  }

  return {
    id,
    commandName: `opsx-${id}`,
    description: template.description,
    content: template.content,
  };
}

async function loadWorkflowUncached(id: WorkflowId): Promise<WorkflowDefinition> {
  const [modulePath, factoryName] = WORKFLOW_MODULES[id];
  const [templateModule, transformReferences] = await Promise.all([
    importOfficialModule(`core/templates/workflows/${modulePath}`),
    loadOfficialReferenceTransformer(),
  ]);
  const factory = templateModule[factoryName];
  if (typeof factory !== 'function') {
    throw new Error(
      `dsh-openspec: the installed @fission-ai/openspec package is missing ${factoryName}`,
    );
  }

  const workflow = validateTemplate(id, (factory as OfficialTemplateFactory)());
  return {
    ...workflow,
    content: transformReferences(workflow.content, { style: 'flat', prefix: '/' }),
  };
}

/** Load one workflow directly from the official OpenSpec package. */
export function loadWorkflow(id: WorkflowId): Promise<WorkflowDefinition> {
  const cached = workflowCache.get(id);
  if (cached !== undefined) return cached;

  const pending = loadWorkflowUncached(id);
  workflowCache.set(id, pending);
  return pending;
}

/** Load all six workflows in the OpenSpec core profile. */
export function loadCoreWorkflows(): Promise<readonly WorkflowDefinition[]> {
  return Promise.all(
    (Object.keys(WORKFLOW_MODULES) as WorkflowId[]).map((id) => loadWorkflow(id)),
  );
}
