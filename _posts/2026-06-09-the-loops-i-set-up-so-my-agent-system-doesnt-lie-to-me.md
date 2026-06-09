---
title: "The loops I set up so my agent system doesn't lie to me"
layout: post
date: 2026-06-09 19:00
image: /assets/images/2026/loops-cover-anygen.png
headerImage: true
tag:
- ai
- agents
- systems
category: blog
author: jaack
description: "Eva doesn't run on one giant prompt. It runs on a few hard loops: routing, health, truth, and forecast-to-decision."
published: true
lang: en
---

Most agent discourse is still stuck at the prompt layer.

Which model are you using. How many tools can it call. Can it code. Can it post. Can it trade.

That matters, but it is not the interesting part.

The useful part is what happens around the agents.

My system is called Eva. It is not one assistant doing everything. It is a multi-agent setup with a small governance layer.

Eva is the kernel. Ops is the control plane. Then there are specialist agents: Scribe for writing, Predictie for forecasting, Mony for treasury, Wolfie for Avalanche, Taxie for tax, Moxie for cards, Forma for health, and a few others.

Mission Control is the UI layer. Telegram is just the human input surface.

The system works because work moves through a few hard loops with explicit ownership.

![Three loops around the agent system core](/assets/images/2026/loops-overview.png)

## The architecture, in one sentence

**human input -> owner selection -> specialist work -> verification -> visible state -> next action**

If that chain gets loose, the whole thing becomes theater.

These are the loops I actually care about.

## 1. The routing loop

The first loop decides who owns the work.

In Eva's architecture, that is not left vague. There is a registry. There is routing policy. There is a difference between strategic arbitration, control-plane work, and domain work.

So the first question is simple:

**who should do this?**

Not which model is smartest. Which owner is correct.

The routing loop is:

**input -> choose owner -> direct delegation or Agent Bus handoff -> specialist output -> verification -> return**

A few rules keep it clean:

- low-risk, clearly owned work can be delegated directly
- shared-state mutations, destructive work, multi-agent coding, and publishing/release flows go through the Agent Bus
- Telegram is for me talking to the system, not for agents pretending to coordinate in public
- if a task needs durable visibility, it goes in the work layer, not just chat history

This is what stops everything from collapsing into one bloated generalist.

Predictie forecasts. Mony handles money. Scribe publishes. Ops manages routing and truth. Eva arbitrates.

## 2. The health loop

Once work is routed correctly, the next question is whether the machine itself is healthy.

This is the OpenClaw health loop:

**observe runtime -> classify health -> choose repair or degrade -> verify route/log/cron truth -> update loop state**

![OpenClaw health loop diagram](/assets/images/2026/openclaw-health-loop.png)

It checks practical things: gateway health, auth profile routing, Telegram delivery path, cron freshness, session state, listeners, and log quality.

The important part is that it is allowed to be honest.

A lot of systems only know how to say "fine" or "broken."

Real operations have a middle state: degraded but understandable.

If the gateway is up but routing is wrong, that matters.
If a cron exists but has not produced a fresh good run, that matters.
If logs exist but the current signal is buried in noise, that matters.

The loop can do small repairs when they are known, reversible, and explicitly allowed.

What it cannot do is freestyle.

No surprise reauth flows. No broad config migrations. No pretending a risky fix is autonomy.

## 3. The truth loop

The third loop protects the dashboard.

Mission Control is useful because it gives me one place to look. But the second you build a dashboard, you create the risk of a painted reality.

So the Mission Control truth loop has one job:

**keep the UI from lying**

Its contract is:

**observe app/runtime truth -> compare dashboard/API claims -> degrade stale state or prepare fix -> run route/API/verifier gates -> update loop state -> report only actionable truth**

![Mission Control truth loop diagram](/assets/images/2026/mission-control-truth-loop.png)

The key rule is simple:

**a green page is not proof.**

A route loading is not enough.
A passing API is not enough.
A cached state object is definitely not enough.

Every visible claim needs a source, a freshness window, and a current-run check.

If the source is stale, the UI should say stale.
If the source is missing, it should degrade.
If the runtime is blocked, the app should stop acting confident.

Once a system is allowed to overstate reality, every decision downstream inherits the lie.

## 4. The forecast-to-action loop

The fourth loop is where things get dangerous if you get lazy.

This one sits between Predictie and Mony.

Predictie produces forecasts. Mony turns those forecasts into treasury posture.

The contract is:

**forecast artifact -> decision artifact -> policy gate -> execution/no-op receipt -> calibration artifact**

![Predictie to Mony forecast-to-action loop](/assets/images/2026/forecast-to-action-loop.png)

This is a manual-first contract, not a trading bot.

Predictie is allowed to produce probabilities, time horizons, triggers, invalidation conditions, and market-relevant implications.

Predictie is **not** allowed to size a position, touch a wallet, or sneak execution authority through a persuasive paragraph.

Mony is allowed to translate a forecast into posture: hold, rebalance, hedge, reduce risk, ask for approval.

Mony is **not** allowed to invent a forecast, ignore its freshness, or skip approval because the trade looks obvious.

Between them sits policy.

The loop does not move unless the forecast has a probability band, confidence, horizon, falsification conditions, and dated sources.
It does not move if the forecast is stale.
It does not move if the decision does not reference a specific forecast artifact.
It does not move if the risk check is missing.
It does not move if approval is required and absent.

And even no-op needs a receipt.

That sounds boring, but it matters.

"We did nothing" stops being a shrug. It becomes a recorded outcome with a reason, a timestamp, and a next review trigger.

That is how the system stays calibratable instead of turning into folklore.

There are really two capital loops hiding here.

The first is **Predictie -> Mony**.
That is the macro loop: forecast -> treasury posture.
Its job is to stop intelligence from quietly turning into execution authority.

The second is **Wolfie -> Mony**.
That one is more like protocol reality -> treasury posture.
Wolfie carries the Avalanche context: ecosystem traction, governance progress, fee-capture reality, whether value accrual is actually improving or just being narrated.
Mony then decides whether that deserves capital rotation, sizing, hedging, or no-op.

That split matters.
It stops ecosystem proximity from turning into automatic treasury bias.

Same philosophy in both cases:
**signal stays upstream, capital stays downstream, and the gate in the middle is the point.**

## Why these loops matter

People overfocus on agent capability because capability demos are easy to show.

But once you run a real multi-agent system, the harder question is what happens at every transition.

Who owns this step.
What artifact is allowed to exist.
What gate sits before the next action.
What counts as proof.
What can degrade instead of pretending to be healthy.
What must produce a receipt even when nothing happened.

That is what Eva is actually governing.

Not one giant super-agent.

A small set of loops.
A control plane.
Clear specialist ownership.
And hard boundaries between thinking, claiming, and acting.

That is the version of agent systems I believe in.

---

*I run this on [OpenClaw](https://openclaw.ai). The interesting part is not the individual agents. It's the loops that keep them in bounds.*
