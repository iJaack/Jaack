---
title: "ACP-255 Needs Better Fee Curves. So I Mapped Four of Them."
layout: post
date: 2026-04-11 00:36
headerImage: false
tag:
- avalanche
- research
- crypto
category: blog
author: jaack
description: "I took the current ACP-77 fee model and three different ACP-255 variants, then turned them into an interactive chart explorer. The hybrid model is the one I would defend today."
published: true
lang: en
---

*This started as ACP work, then turned into a chart problem. The more I looked at the formulas, the less I wanted to argue about them in the abstract. So I built the thing I actually needed: a way to inspect the curves.*

---

## The Setup

ACP-255 is my attempt to redesign Avalanche L1 validator fees.

The original idea is directionally simple: **charge centralized L1s more, make decentralization economically legible, and increase burn meaningfully during the network's growth phase**.

The problem is that once you move from intuition to formulas, things get slippery very quickly.

During review, two different objections started to matter a lot:

1. **ACP-77 is not actually a flat fee.** It is dynamic, path-dependent, and only looks flat below the target most of the time.
2. **If adding validators can ever make an L1 cheaper in aggregate, you open yourself up to a valid resource-pricing objection.** More validators impose more work on the system, so total fees should not fall just because an L1 decentralizes.

That second point is the one that changed how I think about ACP-255.

Not because it kills the proposal. It doesn't. But it forces a harder requirement: **the fee model has to reward decentralization without underpricing added validator load**.

So I mapped four fee regimes instead of one.

- **ACP-77**, the current implemented baseline
- **ACP-255 Gaussian**, the current draft direction
- **ACP-255 Monotonic**, the cleanest replacement I could think of
- **ACP-255 Hybrid**, the compromise that currently feels strongest

And I turned them into an interactive explorer.

---

## The Explorer

<div style="margin: 2rem 0; border: 1px solid #222; border-radius: 18px; overflow: hidden; background: #0b1020;">
  <iframe
    src="/assets/open_source_code/acp-255-formula-explorer.html"
    title="ACP-255 Formula Explorer"
    style="width: 100%; min-height: 2500px; border: 0; background: #0b1020;"
    loading="lazy"
  ></iframe>
</div>

If the iframe is too cramped on your device, [open the explorer directly](/assets/open_source_code/acp-255-formula-explorer.html).

The charts are the post.

They let you inspect the formulas across both dimensions that matter:

- **V**, total network validators, from 0 to 20,000
- **n**, validator count of a specific L1

And they let you compare three different instincts that sound similar in prose but are very different in shape.

---

## Formula 1: ACP-77, the Real Baseline

One mistake I made early on was talking about ACP-77 as if it were basically a flat fee.

That is not quite right.

ACP-77 uses a dynamic validator fee algorithm. In public docs, it is described roughly as:

```text
feeRate = M * exp(x / K)
x = max(x + V - T, 0)
```

Where:

- `M` is the minimum fee rate
- `T` is the target validator count, 10,000
- `K` controls how fast price changes
- `V` is the total number of active L1 validators

Below the target, it mostly behaves like a minimum fee floor.
Above the target, it compounds upward depending on how long the network stays over target.

That is why in the explorer I made ACP-77 explicitly **time-sensitive**: you can change the number of sustained days above target. I did not want to flatten a path-dependent system into a fake static line.

The practical takeaway is still simple though:

- below 10,000 validators, ACP-77 feels almost flat
- above 10,000, it becomes increasingly punitive
- it says very little about the *shape* of a single L1's validator set, because it mostly prices the global network load

That is exactly the opening ACP-255 tries to exploit.

---

## Formula 2: ACP-255 Gaussian, the Current Draft

The current draft of ACP-255 adds two extra ideas on top of the base fee:

1. an **L1-size multiplier**
2. a **Gaussian network factor** centered around 10,000 validators

In compact form:

```text
total = n * M * multiplier(n) * networkFactor(V)
```

Where:

```text
multiplier(n) = 1 + 17.84 * e^(-0.3 * (n - 1))
networkFactor(V) = 1 + 2.84 * e^(-((V - 10000) / 7500)^2)
```

The intuition is good.

- small validator sets get taxed hard
- the network gets a growth-phase burn curve
- the 10-15 validator zone becomes economically attractive relative to 1-3 validator setups

But the current Gaussian version has a real weakness: **it is too easy to read it as making bigger validator sets cheaper in aggregate**.

That is the point reviewers are right to push on.

If an additional validator creates more work for the P-Chain and the Primary Network, then the protocol should be very careful about any structure that makes aggregate pricing fall as an L1 grows.

So even though the current Gaussian version is the most faithful to the original ACP-255 instinct, it is not the easiest one to defend.

---

## Formula 3: ACP-255 Monotonic, the Clean Replacement

The pure monotonic replacement does one thing very clearly:

> **total L1 fees always increase as an L1 adds validators**

That lets you preserve a resource-pricing safety property while still making larger validator sets more efficient on a per-validator basis.

A simple review curve for that looks like:

```text
L1TotalFee(n) = 50 + 35 * log2(n)
```

This version is easy to explain.

- 1 validator is expensive
- 10 validators cost more in total than 1 validator
- but the average cost per validator drops
- decentralization still gets rewarded
- aggregate underpricing becomes much harder to argue

If all I cared about was clean economics in isolation, this is probably the version I would choose.

But governance is not only about elegance. It is also about transition, continuity, and how much of the original design intent you preserve.

That is where the hybrid starts to matter.

---

## Formula 4: ACP-255 Hybrid, the One I Like Best Right Now

The hybrid model keeps the original ACP-255 shape where its story is strongest, then becomes stricter exactly where the review pressure is strongest.

The version in the explorer works like this:

- **up to 9,000 total validators:** use the current ACP-255 Gaussian formula
- **from 9,000 to 11,000:** blend smoothly
- **above 11,000:** switch to a fitted monotonic branch

Why do I like this more than the pure monotonic version?

Because it preserves the main political and economic story of ACP-255:

- early growth matters
- decentralization should be encouraged early and visibly
- the 10k region is still treated as a special phase in network maturity

But it also concedes something important:

- once the network gets large enough, the fee model should become easier to defend on strict resource-pricing grounds

That feels like the right compromise.

Not the prettiest one. The pure monotonic curve is prettier.

But in terms of **"what could I actually defend in front of reviewers and still call ACP-255"**, the hybrid is the best answer I have right now.

---

## What the Charts Show More Clearly Than Words

A few observations jump out once you rotate the surfaces and move the slices around.

### 1. ACP-77 is mostly about global pressure, not L1 structure

ACP-77 does not really care whether an L1 has 3 validators or 15, except linearly. The interesting variable is the global validator count and how long the network stays above target.

That makes it robust in one sense, but not very expressive in another.

### 2. The current Gaussian ACP-255 is genuinely interesting

I still think the current ACP-255 draft captures something important that a purely global fee misses.

It encodes the idea that **small, tightly controlled validator sets should pay a premium**.

That is a valid instinct. The problem is not the instinct. The problem is the shape.

### 3. The monotonic replacement is much easier to defend than to love

The monotonic version solves the main objection quickly.

But it also strips away a lot of the original ambition. It becomes cleaner, safer, and less distinctive.

### 4. The hybrid looks like a real governance compromise

This is the most important one.

Once you look at the surfaces, the hybrid does not feel like a hack. It feels like a phase change:

- early network growth gets one pricing logic
- mature network resource pricing gets another
- the transition happens where the system starts to care much more about capacity and sustainability

That is exactly the kind of design I usually trust more than single-regime models.

---

## If I Had to Defend One Version Today

It would be the hybrid.

Not because it is perfect.

It still needs work:

- the transition band can be tuned better
- the post-threshold curve can still be argued over
- ACP-77 comparisons should be treated carefully because ACP-77 is path-dependent, not a simple static fee schedule

But if the question is:

> which version best preserves the original intent of ACP-255 while answering the strongest reviewer concern?

my answer today is the hybrid.

That is the version I would push further.

---

## Why I Wrote This This Way

I did not want this post to be another governance article where the formulas are hidden in paragraphs and everyone argues off memory.

When a proposal lives or dies by curve shape, you should be able to see the curves.

So that is what this is.

Not a final ACP.
Not a vote solicitation.
Not even a finished argument.

Just the most honest version of the work at this stage: **here are the fee regimes, here is how they behave, and here is the one that currently seems to work best.**

If you want to discuss ACP-255 seriously, start with the charts.
