# dsh-openspec

**Native OpenSpec commands for DeepSeek Harness.**

`@codigoconelmer/dsh-openspec` connects the official [OpenSpec](https://github.com/Fission-AI/OpenSpec) workflows to the DeepSeek Harness command registry. It adds `/opsx-*` commands directly to DSH without copying or rewriting OpenSpec workflows.

> Created by **Elmer Jacobo** · [elmerjacobo.dev](https://elmerjacobo.dev)

## Available commands

| Command | Purpose |
| --- | --- |
| `/opsx-explore` | Explore the problem and repository before proposing a change. |
| `/opsx-propose` | Create an OpenSpec proposal and its planning artifacts. |
| `/opsx-apply` | Implement the tasks defined by a change. |
| `/opsx-sync` | Sync a change's specifications into the main specifications. |
| `/opsx-archive` | Finalize and archive a completed change. OpenSpec runs its official sync workflow as part of this process. |
| `/opsx-update` | Revise and keep the planning artifacts of a change coherent. |

## How it works

```text
Project with OpenSpec
        |
        |  openspec init
        v
OpenSpec configuration and changes
        |
        |  /opsx-* command
        v
DeepSeek Harness + dsh-openspec
        |
        v
Official workflow from @fission-ai/openspec
```

The plugin:

1. Registers the six commands through DSH's official `ctx.commands` API.
2. Loads the official workflow templates from `@fission-ai/openspec`.
3. Converts canonical `/opsx:name` references to DSH's `/opsx-name` format.
4. Sends the workflow to the current agent and repository.
5. Lets OpenSpec resolve its own schemas, roots, stores, and paths through its CLI.

The plugin does not maintain local copies of the workflows and does not require a custom web interface.

## Installation in DeepSeek Harness

### From npm

```bash
dsh plugin --profile web add @codigoconelmer/dsh-openspec
```

### From this checkout

```bash
dsh plugin --profile web add /path/to/dsh-openspec
```

Restart DSH afterward so the profile reloads its composition.

## Prepare an OpenSpec project

Run the following in the project where you want to work:

```bash
cd /path/to/your-project
openspec init
```

OpenSpec may ask you to select a tool such as OpenCode, Codex, Claude Code, or Cursor. DSH is not currently listed as a dedicated OpenSpec target, so you can leave the preselected option or select any tool you also intend to use. Those tool-specific files do not enable the DSH integration; this plugin registers the commands directly in Harness.

If the `openspec` command is not installed, install the official CLI:

```bash
npm install --global @fission-ai/openspec
```

Then open the project from DSH and run, for example:

```text
/opsx-explore
```

## Recommended workflow

```text
/opsx-explore
      |
      v
/opsx-propose name-or-description
      |
      v
Review the generated artifacts
      |
      v
/opsx-apply change-name
      |
      v
/opsx-sync change-name
      |
      v
/opsx-archive change-name
```

Use `/opsx-update change-name` when you need to revise an existing proposal. Review the artifacts before applying changes to the codebase.

## Relationship with OpenSpec

```text
@fission-ai/openspec  = official CLI and workflows

dsh-openspec          = native DeepSeek Harness adapter

DeepSeek Harness      = runtime, sessions, commands, and tools
```

`openspec init` prepares the project. `dsh-openspec` makes the workflows available as native DSH slash commands. They are complementary pieces.

## Development

Requirements:

- Node.js `>=20.19.0`
- pnpm

Install dependencies and run the checks:

```bash
pnpm install --ignore-scripts
pnpm run check
pnpm test
pnpm run build
```

Create the distributable package:

```bash
pnpm pack --dry-run
```

## Design decisions

- **Host-only:** uses DSH's command registry and does not require an additional browser plugin.
- **No duplication:** instructions come from `@fission-ai/openspec`.
- **Profile-based installation:** DSH installs packages persistently into a profile that can then be used with any repository.
- **Repository-aware execution:** the agent keeps the session `cwd`, while OpenSpec resolves the project's structure.
- **Explicit updates:** upgrading `@fission-ai/openspec` makes official workflow updates available to the adapter.

## License and authorship

This project is distributed under the [MIT License](./LICENSE).

- Author: **Elmer Jacobo**
- Website: [elmerjacobo.dev](https://elmerjacobo.dev)
- OpenSpec: [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)
- DeepSeek Harness: [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)
