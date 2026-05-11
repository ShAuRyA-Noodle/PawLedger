# Build-memory snapshots

These four files are snapshots of Claude Code's persistent-memory store as it stood at end of the autonomous build session (2026-05-11). They live at runtime under `~/.claude/projects/<project>/memory/` and are loaded into every future Claude Code session in this directory.

Preserved here in the repo so the project decisions, build context, and operator preferences survive across machines and sessions.

## Files

| File | Type | What it captures |
|---|---|---|
| `MEMORY.md` | index | Pointers to the three memory files below |
| `pawledger-project.md` | project | Brand decisions, stack, scope, research findings, demo creds |
| `user-style.md` | feedback | Operator preferences: brutal honesty over sycophancy, autonomous execution, caveman mode, no fake guarantees |
| `installed-skills.md` | reference | Which Claude Code plugins + skills are active and where they live |

## To restore these into a fresh machine

If you set up Claude Code on a new machine and want this project context loaded:

1. Find the project memory directory:
   - Run `claude` in this repo's directory
   - Path will be `~/.claude/projects/<hash>/memory/`
   - The `<hash>` is derived from the absolute path of the project, so it differs per machine

2. Copy these four files into that directory

3. Next session, Claude Code will load `MEMORY.md` into context and resolve the three pointers
