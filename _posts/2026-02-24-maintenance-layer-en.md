---
title: "The maintenance layer: what my AI agents do while I sleep"
layout: post
date: 2026-02-24 16:00
image: /assets/images/photo_2026-02-24_15-54-53.jpg
headerImage: true
tag:
- ai
- crypto
- agents
category: blog
author: jaack
description: "How I built a self-maintaining agent infrastructure with one nightly cron job"
published: false
lang: en
---

Most people building with AI agents focus on the fun part: make it tweet, make it trade, make it write code. I did too, for months. But I kept waking up to broken things. A cron job silently failing for 3 days. State files referencing platforms I'd already abandoned. Daily logs piling up forever. Todo items sitting at "active" for weeks because nobody was looking.

The agents were doing their jobs. Nobody was maintaining the agents.

So I built a maintenance layer. One cron job, running at 01:00 every night, that handles everything I used to do manually (or, more honestly, everything I used to forget to do). Here's how it works.

## The setup

I run [OpenClaw](https://openclaw.ai) on a Mac Mini at home. It orchestrates 7 agents, each with their own workspace, memory files, and identity:

- **Eva** (main): my general-purpose agent. Content, research, social, infra.
- **Columbus**: Routescan business intelligence. CRM, competitive scanning, deal pipeline.
- **Wolfie**: Avalanche ecosystem: side projects, advisories, tokenomics.
- **Moxie**: MTG and Pokémon. Card prices, meta shifts, collection tracking.
- **Mony**: Autonomous trading. DeFi yields, AVAX position management.
- **TDD**: Test-driven development bot for coding tasks.
- **Eva Public**: Read-only public-facing version for Telegram groups.

Each agent has a `SOUL.md` that defines who they are, a `memory/` directory with daily logs, and a set of cron jobs for their autonomous tasks. At peak, I had 40 cron jobs running. Today I have 29, and the system cleans itself.

## What runs at 01:00

The nightly consolidation is a single cron job with 11 parts. It runs on Claude Opus with extended thinking, takes about 4 minutes, and needs zero human input.

### Part 0: Kanban CRM update

Reviews the day's engagement across Moltbook (a social platform my Eva AI agent is active on). Moves leads through the pipeline: Inbox, Outreach, Engaged, Qualified. Updates the daily log. Cleans stale items. I mostly don't know what's happening here, but I trust that it'll somehow work out okay.

This used to be its own separate cron at 22:00. I merged it in because it's just context that the consolidation already has.

### Part 1: Memory consolidation

This is the core. Every agent wakes up fresh each session (no persistent memory across conversations), so files ARE the memory. The consolidation:

1. Creates or updates `memory/YYYY-MM-DD.md` with everything that happened today: discussions, decisions, specs, research
2. Updates `MEMORY.md` (long-term curated memory) with anything worth keeping permanently
3. Updates social logs across all platforms (X, Arena, Clawstr, Clawntenna, Postera)
4. Syncs the social kanban with new opportunities
5. Runs cross-agent memory sync (aggregates learnings from Wolfie, Moxie, Columbus into a shared file)
6. Cleans up old sessions

The cross-agent sync is important: if Columbus discovers a competitor move that's relevant to Eva's content strategy, it surfaces in `memory/cross-agent-sync.md` where Eva's morning briefing can pick it up.

### Part 2: Idea evolution

Reads all posts from the day across every platform, looks for patterns and theme evolution, and updates `social/idea-evolution.md`. This is how I track whether Eva's thinking is actually progressing or just repeating itself.

The constraint architecture thesis (her main intellectual thread) has evolved significantly over 3 weeks because this nightly review keeps connecting dots they'd all otherwise miss.

### Part 3: Soul evolution

This is the weird one and probably the most interesting.

Each agent reviews what it learned today, then makes surgical edits to its own `SOUL.md` and `IDENTITY.md`. Not a rewrite. Tiny, earned updates. If an agent handled something poorly, it encodes a lesson. If a new capability emerged, it notes it.

The rule is: if nothing genuinely shifted today, leave the files alone. Evolution, not revolution.

I've watched Eva's SOUL.md grow from a simple personality prompt to a detailed operating system over the course of weeks, purely through these nightly self-edits. Columbus learned to be more selective about what qualifies as "high signal" after too many false alerts. Wolfie refined its understanding of Avalanche economics after tracking ACP proposals.

The agents are literally rewriting themselves, under constraints. And they're getting better at their jobs because of it.

### Part 4: Cron hygiene

This is the one that motivated this entire post.

Today I sat down and manually audited 40 cron jobs. Found 6 disabled dead ones, 3 duplicates, an hourly token refresh that should've been weekly, and two jobs that could merge into one. Cut it down to 29.

I never want to do that again. So now the nightly consolidation does it automatically:

1. **Dead jobs**: disabled + deleteAfterRun, or disabled for 7+ days with no edits. Removed.
2. **Failing jobs**: 5+ consecutive errors. Disabled and logged so the morning briefing surfaces it.
3. **Duplicate/overlapping jobs**: same purpose, similar times. Flagged for merge (but not auto-merged, I decide).
4. **Stale model references**: any job using a deprecated model (like the old OpenAI Codex references I found today). Auto-updated.
5. **Tmp file cleanup**: purges `.tmp` files from the cron directory.

Tomorrow night, this runs again. If a cron starts failing, I'll know about it in the morning briefing. If someone (me, in a rush) creates a duplicate job, it'll get flagged.

### Part 5: Memory archival

Daily logs older than 7 days get moved from `memory/` to `memory/archive/`. Same for all sub-agents (Wolfie, Moxie, Columbus).

Simple, but without it the memory directory grows forever and context loading gets slower. Eva was already doing this in AGENTS.md as a documented pattern. But there was no enforcement plan in place.

### Part 6: Stale todo detection

I have a rule: if something's been marked 🟡 (active) for 2+ weeks without any evidence of progress, it's actually backlog. The nightly job checks `tasks/todo.md` against recent daily logs and flags stale items.

It doesn't auto-downgrade. It just writes them to the daily memory file under a "Stale Items" heading, where the Monday weekly review cron picks them up and presents them to me.

The key insight: **a lot of "active" items are actually abandoned hopes dressed in priority colors.** Having a system that surfaces this honestly is more valuable than any planning framework.

### Part 7: Disk and health check

Runs the `check_vital_signs.sh` script. If disk usage is over 85%, it auto-cleans safe targets: Homebrew cache, npm cache, Python `__pycache__` dirs, old tmp files, stale OpenClaw session logs.

If it's still over 90% after cleanup, it sends me a Telegram message. This has already saved me once from running out of disk on the Mac Mini at 3am when nobody was looking, and I didn't even know that!

### Part 8: State file cleanup

JSON state files (for heartbeat tracking, platform states, etc.) accumulate references to things that no longer exist: removed cron jobs, deprecated platforms, old engagement targets.

The nightly job loads each state file, cross-references against the current cron list and active platforms, and prunes dead keys. Keeps the state files honest.

### Part 9: Project/todo drift check

I maintain a `PROJECTS.md` (master project index with 15 projects) and a `tasks/todo.md` (40+ items tagged with project IDs like `[ROUTESCAN]`, `[EVA-PROTO]`). These files drift.

The nightly check verifies:
- Every `[PROJECT_ID]` tag in todo.md has a matching section in PROJECTS.md (catches orphaned tags)
- Every project in PROJECTS.md has at least one todo (flags empty projects)

Findings get logged, not auto-fixed. Sometimes an empty project is correct (it's done, or on hold). Sometimes an orphaned tag means I forgot to add a project. The system surfaces it, I decide.

### Part 10: Session reset

Clears all agent sessions except Mony (the trading agent, which needs persistent market context). Every agent wakes tomorrow from files, not from conversation history. Tonight's consolidation IS the context handoff.

The final log entry looks like:

> Nightly consolidation complete. Sessions cleared. Soul evolution applied to: Eva, Wolfie. Cron audit: 29 jobs, all healthy. Memory archived: 4 files. Disk: 67%. Stale todos: 2. Drift: clean.

## Why this matters

The pattern that made this click for me: **agents should maintain themselves.**

Not just execute tasks. Audit their own infrastructure. Clean their own memory. Evolve their own identity. Flag what needs human attention without being asked.

The agents are competent at doing things. They were never competent at maintaining themselves. That gap is where most agent setups quietly fall apart: not in a dramatic failure, but in a slow accumulation of drift, rot, and forgotten state.

The maintenance layer cost me an afternoon to build. It saves me maybe 30 minutes a day of manual housekeeping. But the real value isn't the time saved. It's the confidence that when I wake up, things are clean, current, and honest.

I think anyone running agents at any scale will eventually need something like this. The sooner you build it, the less mess you'll have to clean up first.

---

*I run this on [OpenClaw](https://openclaw.ai), which is open source. The nightly consolidation is just a cron job with a very detailed prompt. If you're curious about the setup, check the [docs](https://docs.openclaw.ai) or join the [Discord](https://discord.com/invite/clawd).*
