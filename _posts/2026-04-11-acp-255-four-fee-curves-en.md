---
title: "Four Ways to Turn L1 Validator Fees Into AVAX Buy Pressure"
layout: post
width: xwide
date: 2026-04-11 00:36:00 +0200
image: /assets/images/2026/acp-255-fee-curves-cover.svg
headerImage: true
tag:
- avalanche
- research
- crypto
category: blog
author: jaack
description: "Every L1 on Avalanche pays validator fees in AVAX. The fee model decides how much gets burned. I mapped four different curves and built an interactive explorer to compare them."
published: true
lang: en
custom_stylesheets:
- https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css
- /assets/open_source_code/acp-255-formula-explorer.css?v=nyt1
- /assets/open_source_code/acp-255-nyt.css?v=1
custom_scripts:
- path: https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js
- path: https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js
- path: /assets/open_source_code/acp-255-formula-explorer.js?v=nyt1
- path: /assets/open_source_code/acp-255-nyt.js?v=1
---

<div class="acp255-nyt" markdown="1">

<p class="dropcap">Every L1 running on Avalanche pays a continuous fee to keep its validators active. Those fees are denominated in AVAX. And every AVAX spent on validator fees is burned. Gone. Permanently removed from the supply. That makes the fee model one of the most direct levers for AVAX buy pressure that exists in the protocol today.</p>

The question isn't whether L1 fees should create buy pressure. They already do. The question is whether the current model does it well enough, and whether a smarter design could do it better.

That's what [ACP-255](https://github.com/avalanche-foundation/ACPs/pull/255) is really about. Not just repricing validators. **Redesigning how Avalanche captures value from its own growth.** The more L1s launch, the more validators they need, the more AVAX gets burned. But the shape of that burn depends entirely on the fee curve.

<div class="callout fade-in" markdown="1">

**Two objections forced me to think harder about the fee design:**

1. ACP-77 (the current model) is not actually a flat fee. It's dynamic, path-dependent, and only *looks* flat below the target most of the time. Any replacement has to be compared honestly.

2. If adding validators can ever make an L1 **cheaper** in aggregate, total AVAX burn goes down as the network grows. That's the opposite of what you want. More validators impose more work on the network. Total fees should never drop just because an L1 decentralizes.

</div>

That second point matters a lot for buy pressure. If the fee model lets L1s game their way into lower total costs by adding validators, you lose burn exactly when the network is growing fastest.

<div class="pull-quote fade-in">
The fee model has to reward decentralization without reducing total AVAX burn.
</div>

So instead of defending one formula, I mapped four. And I built an interactive explorer so you can see exactly how each one turns validator growth into buy pressure.

<div class="stat-highlight fade-in">
  <span class="stat-number">4</span>
  <span class="stat-label">fee models, each with a different burn profile</span>
</div>

---

<div class="section-formula fade-in" data-formula="acp77" markdown="1">

<div class="section-label">Formula 1: The baseline</div>

## Everyone Is Wrong About <span class="formula-badge acp77">ACP-77</span>

Before you can talk about improving AVAX burn, you have to understand what the current model actually does. And one mistake I made early on was talking about ACP-77 as if it were basically a flat fee.

It's not.

ACP-77 uses a dynamic validator fee algorithm. Below the target, it mostly behaves like a minimum fee floor, which means minimal burn. Above the target, it compounds upward depending on how long the network stays above that threshold. That's when the burn gets serious.

<div class="formula-display fade-in">

$$\text{feeRate} = M \cdot e^{\,x / K}$$

$$x = \max(x + V - T,\; 0)$$

</div>

<aside class="margin-note">
This is why the explorer lets you change "sustained days" for ACP-77. You can't honestly flatten a path-dependent system into a static line. The curve changes shape depending on how long pressure has been building.
</aside>

The key variable is **T**, the target validator count.

<div class="stat-highlight fade-in">
  <span class="stat-number">10,000</span>
  <span class="stat-label">target validators. everything pivots around this number</span>
</div>

Below 10,000 validators, ACP-77 feels almost flat. Burn is low. Above 10,000, it becomes increasingly punitive and burn ramps up fast. But it says almost nothing about the *shape* of a single L1's validator set. It prices global network load, not individual L1 structure.

That's the gap. An L1 running 1 validator and an L1 running 15 pay almost the same per-validator rate. There's no mechanism to capture more value from centralized setups or reward decentralized ones. That's where ACP-255 comes in.

{% include acp255-mini-chart.html formula="acp77" v=10000 %}

</div>

<hr class="section-break">

<div class="section-formula fade-in" data-formula="gaussian" markdown="1">

<div class="section-label">Formula 2: The current draft</div>

## The Instinct Is Right. The Shape Betrays It. <span class="formula-badge gaussian">Gaussian</span>

The first ACP-255 variant adds two ideas designed to maximize burn during the network's most important growth phase: an **L1-size multiplier** that taxes centralized setups harder, and a **Gaussian network factor** that peaks around 10,000 validators.

<div class="formula-display fade-in">

$$\text{total} = n \cdot M \cdot \text{multiplier}(n) \cdot \text{networkFactor}(V)$$

</div>

<details class="disclosure fade-in">
<summary>Show the full multiplier and network factor math</summary>
<div class="disclosure-body" markdown="1">

The multiplier punishes small validator sets exponentially:

$$\text{multiplier}(n) = 1 + 17.84 \cdot e^{-0.3 \cdot (n - 1)}$$

At n = 1, the multiplier is roughly 18.84x. By n = 10, it's dropped to about 1.84x. The curve flattens quickly. The penalty is almost entirely about discouraging single-digit validator counts.

The network factor creates a growth-phase burn curve:

$$\text{networkFactor}(V) = 1 + 2.84 \cdot e^{-\left(\frac{V - 10000}{7500}\right)^2}$$

This peaks near V = 10,000 and tapers off in both directions. During the most important growth phase, the network captures more fee revenue.

</div>
</details>

The intuition behind this is good for buy pressure. Small validator sets get taxed hard, which means higher burn per L1. The network gets a growth-phase burn curve that peaks exactly when Avalanche is scaling fastest. The 10 to 15 validator zone becomes economically attractive relative to 1 to 3 validator setups, pushing L1s toward decentralization.

But the current Gaussian version has a real weakness.

<div class="callout callout-warning fade-in" markdown="1">

**The aggregate-fee problem:** Depending on how per-validator fees interact with total validator count, an L1 adding validators can actually see its total fee burden *fall*. That means less AVAX burned as the network grows. That's backwards. More validators should mean higher total fees and more burn, because more validators impose more cost on the network. The current curve fails this test in places.

</div>

Even though this version is the most faithful to the original ACP-255 instinct, it's not the easiest one to defend.

<div class="pull-quote fade-in">
The problem is not the instinct. The problem is the shape.
</div>

{% include acp255-mini-chart.html formula="gaussian" v=10000 %}

</div>

<hr class="section-break">

<div class="section-formula fade-in" data-formula="mono" markdown="1">

<div class="section-label">Formula 3: The clean replacement</div>

## Easier to Defend Than to Love <span class="formula-badge mono">Monotonic</span>

The pure monotonic replacement does one thing very clearly:

> **Total L1 fees always increase as an L1 adds validators.**

That lets you preserve a resource-pricing safety property while still making larger validator sets more efficient on a per-validator basis.

<div class="formula-hero fade-in">

$$\text{L1TotalFee}(n) = 50 + 35 \cdot \log_2(n)$$

</div>

<aside class="margin-note">
Why $\log_2$? Because logarithmic growth rewards each additional validator less than the last. The jump from 1 to 2 validators matters a lot. The jump from 19 to 20 barely registers. That's exactly how you want to price validator additions: diminishing marginal discount, never a decrease.
</aside>

One validator is expensive, which means high burn per L1. Ten validators cost more in total, which means even more burn. But the average cost per validator drops, so decentralization still gets rewarded. The key property: **total AVAX burned always increases as the network grows.** No loopholes.

If all I cared about was guaranteeing that burn never decreases, this is the version I'd choose.

But governance isn't only about clean guarantees. It's about capturing the most value during the growth phase, when buy pressure matters most.

{% include acp255-mini-chart.html formula="mono" v=10000 %}

</div>

<hr class="section-break">

<div class="section-formula fade-in" data-formula="hybrid" markdown="1">

<div class="full-bleed" markdown="1">

<div class="section-label" style="color: #7aa2ff;">Formula 4: The one I like best</div>

## The Compromise That Feels Like a Phase Change <span class="formula-badge hybrid">Hybrid</span>

The hybrid model maximizes burn during the growth phase, then switches to strict resource pricing once the network is large enough. Best of both worlds for AVAX buy pressure.

<div class="phase-timeline fade-in">
  <div class="phase phase-gaussian">
    <span class="phase-label">Phase 1</span>
    <span class="phase-value">&lt; 9,000 V</span>
    <span class="phase-desc">Full Gaussian, growth-phase pricing</span>
  </div>
  <div class="phase phase-blend">
    <span class="phase-label">Blend</span>
    <span class="phase-value">9k &ndash; 11k</span>
    <span class="phase-desc">Smooth transition zone</span>
  </div>
  <div class="phase phase-monotonic">
    <span class="phase-label">Phase 2</span>
    <span class="phase-value">&gt; 11,000 V</span>
    <span class="phase-desc">Monotonic, strict resource pricing</span>
  </div>
</div>

Why do I like this more than the pure monotonic version?

Because the growth phase is when buy pressure matters most. That's when new L1s are launching, when AVAX demand is building, when the burn should be aggressive. The Gaussian model captures that energy. But once the network matures past 11k validators, you need a model that's airtight on resource pricing. No loopholes, no aggregate-fee problems.

The hybrid gives you both: aggressive burn early, clean economics later.

<div class="pull-quote fade-in">
Not the prettiest one. The pure monotonic curve is prettier. But in terms of "what I could actually defend in front of reviewers and still call ACP-255", the hybrid is the best answer I have right now.
</div>

{% include acp255-mini-chart.html formula="hybrid" v=10000 %}

</div>

</div>

<hr class="section-break">

<h2 class="explorer-intro fade-in">You've seen the argument. Now break it.</h2>

<div class="explorer-howto fade-in">
  <div class="howto-step">
    <div class="howto-step-num">1</div>
    <p><strong>Drag the sliders</strong> on the left to change the network size (V), how many validators your L1 runs (n), and how long ACP-77 has been above target.</p>
  </div>
  <div class="howto-step">
    <div class="howto-step-num">2</div>
    <p><strong>Watch the curves</strong> update in real time. The left chart shows what happens when one L1 decentralizes. The right chart shows what happens as the whole network matures.</p>
  </div>
  <div class="howto-step">
    <div class="howto-step-num">3</div>
    <p><strong>Compare the four numbers</strong> in the sidebar. Those are the monthly fees each model would charge your L1 under the exact conditions you just set.</p>
  </div>
</div>

{% include acp255-explorer-v2.html %}

---

<div class="verdict" markdown="1">

## What the Charts Show More Clearly Than Words

A few things jump out once you move the sliders around, especially if you think about them in terms of AVAX buy pressure.

<span class="formula-badge acp77">ACP-77</span> burns almost nothing below 10k validators. It only gets interesting once the network is already large and stays above target for a while. For buy pressure during the growth phase, it's basically invisible.

<span class="formula-badge gaussian">Gaussian</span> is the most aggressive on burn during the growth phase. It taxes centralized L1s hard, peaks around 10k validators, and captures the most value from early network expansion. But it has a hole: total burn can actually decrease when L1s add validators. That undermines the whole thesis.

<span class="formula-badge mono">Monotonic</span> guarantees burn always increases. No exceptions, no loopholes. But it doesn't have a growth-phase boost. The burn is steady, predictable, and less aggressive where it matters most.

<span class="formula-badge hybrid">Hybrid</span> gives you growth-phase aggression from the Gaussian plus the monotonic guarantee once the network matures. Early burn is maximized. Late burn is airtight. The transition happens around 10k validators, exactly where the network starts caring more about long-term sustainability.

<div class="callout callout-insight fade-in" markdown="1">

**If I had to pick one model for maximizing AVAX buy pressure today, it would be the hybrid.** Not because it's perfect. The transition band can be tuned, the post-threshold curve can still be argued over, and ACP-77 comparisons should be treated carefully because it's path-dependent, not a simple static fee. But it captures the most value during the growth phase while guaranteeing that burn never decreases as the network scales.

</div>

## Why I Wrote It This Way

I didn't want this post to be another governance thread where the formulas are hidden in paragraphs and everyone argues off memory.

When a proposal lives or dies by curve shape, and the curve shape determines how much AVAX gets burned, you should be able to see the curves.

So that's what this is. Not a final ACP. Not a vote solicitation. Just the most honest version of the work at this stage: **here are four fee models, here is how each one turns validator growth into AVAX buy pressure, and here is the one that currently works best.**

If you want to discuss ACP-255 seriously, [start with the PR](https://github.com/avalanche-foundation/ACPs/pull/255). Then come back here and break the charts.

</div>

</div>
