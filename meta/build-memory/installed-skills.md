---
name: Installed Claude Code skills
description: Skills + plugins user has installed — superpowers, claude-mem, taste-skill (12 sub-skills), caveman
type: reference
originSessionId: 0f1e3bd1-a3a3-4ad7-882c-a83481273ad2
---
User asked me to install 4 GitHub repos as skills/plugins on 2026-05-11. Status:

1. **awesome-claude-code** (hesreallyhim) — curated awesome-list, NOT installable. Cloned to `c:/Users/Dell/Desktop/Claude/scratch/awesome-claude-code/` for reference.

2. **superpowers** (obra) — installed as Claude Code plugin via `superpowers-marketplace`.
   - Marketplace at `~/.claude/plugins/marketplaces/superpowers-marketplace/`
   - Plugin cached at `~/.claude/plugins/cache/superpowers-marketplace/superpowers/f2cbfbefebbf/`
   - Registered in `known_marketplaces.json`, `installed_plugins.json`, enabled in `settings.json`
   - Provides 14 skills: brainstorming, executing-plans, TDD, dispatching-parallel-agents, finishing-a-development-branch, receiving-code-review, requesting-code-review, subagent-driven-development, systematic-debugging, using-git-worktrees, using-superpowers, verification-before-completion, writing-plans, writing-skills
   - Hooks include `session-start` auto-loader — activates next session
   - **Not active in current session** — restart needed for hooks + skills to register

3. **claude-mem** (thedotmack) — installed via `npx claude-mem install`. Auto-registered marketplace `thedotmack`, plugin enabled.
   - 6 lifecycle hooks (SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd, pre-hook)
   - 4 MCP tools: search, timeline, get_observations, mem-search
   - Worker UI at http://localhost:37777 (start manually: `npx claude-mem start`)
   - Sets `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` (replaces built-in auto-memory)
   - Plugin dir: `C:\Users\Dell\.claude\plugins\marketplaces\thedotmack`
   - Active next session

4. **taste-skill** (Leonxlnx) — 12 individual skills copied to `~/.claude/skills/taste-*` for guaranteed top-level discovery:
   - `taste-skill` (design-taste-frontend), `taste-brandkit`, `taste-brutalist-skill`, `taste-gpt-tasteskill`, `taste-image-to-code-skill`, `taste-imagegen-frontend-mobile`, `taste-imagegen-frontend-web`, `taste-minimalist-skill`, `taste-output-skill`, `taste-redesign-skill`, `taste-soft-skill`, `taste-stitch-skill`, `taste-taste-skill`
   - All loaded + visible in current session
   - Use for UI/brand/design generation tasks

**Pre-existing**: caveman plugin (caveman, caveman-commit, caveman-review, caveman-help, caveman:compress) — active.

**How to apply**: When user asks to use one of these skills, just invoke via Skill tool. When user reports skills "not working" — likely needs Claude Code restart (hooks register at session start).
