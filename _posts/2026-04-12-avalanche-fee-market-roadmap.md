# Avalanche's Fee Market at a Crossroads
_Posted: 2026-04-12_

---

*This started as a research note on the C-Chain's fee burn composition. It became a map of where Avalanche's fee market is heading — and why the next 18 months of protocol work matters more than the last two years of L1 launches.*

---

## The Number No One Talks About

On the Avalanche C-Chain, roughly **90% of all AVAX burned in fees is priority fees paid by MEV bots**.

Not base fees. Not gas. Priority fees — the tip that arbitrage bots and searchers layer on top to jump the queue.

The data: a median tip of 0.000001 nAVAX (nothing), against a top 0.1% tip of 230 nAVAX. The tail is doing all the work. Most users pay almost nothing. A small number of actors pay very large amounts to be first.

This is not a bug. It is the current product-market fit for Avalanche blockspace.

But it has two problems that won't resolve themselves:

**Problem 1 — structural fragility.** If encrypted transactions become a user expectation — or a regulatory requirement — the public mempool MEV surface shrinks. The chains that haven't built a replacement revenue model will have to do it under pressure.

**Problem 2 — incentives misalign at scale.** The original intuition behind Avalanche's fee model was simple: charge validators for the work they impose on the network. But the actual mechanics are more complex. The more validators an L1 adds, the more work it creates for the network. Fees should reflect that. Currently, they don't always.

Two forces are now converging: the MEV-dependency of the C-Chain, and the emerging privacy-as-infrastructure conversation. The protocol decisions made in the next 12–18 months will determine which direction Avalanche goes.

---

## How We Got Here — and Why ACP-247 Sets the Stage

Before looking forward, it's worth understanding the foundation.

ACP-247, merged in December 2025, raised the delegation multiplier from 4x to 24x and reduced maximum validator weight. The effect was immediate: more validators became competitive, the network decentralised further, and the validator count moved meaningfully toward the 10,000–15,000 range.

This matters for everything that follows. ACP-247 was not just a delegation policy change. It was the network size assumption that subsequent fee work rests on. ACP-255 — the Gaussian fee curve for L1 validator PAYG — is designed around a network centred on 10,000 validators. Without ACP-247 pushing the network in that direction, ACP-255's curve would have been operating against a different reality.

This is the first thread: **the fee models being designed now are built on the network that ACP-247 enabled**.

---

## Phase 1 — Validator Fee Reform

The most immediate work is on L1 validator pricing. The question is simple: if an L1 adds more validators, should its total fee burden go up or down?

Intuitively, up — more validators means more work for the network. But the current linear model doesn't always behave that way. Several models have been proposed.

### ACP-255 — Gaussian Fee Curve

ACP-255 proposes replacing the current linear model with a Gaussian curve centred on network size. The idea: bigger L1s pay proportionally more, without punishing moderate growth. The curve rewards decentralisation up to a point, then becomes increasingly expensive as an L1 approaches the network median size.

The strongest objection raised in review: **aggregate fees can fall as an L1 decentralises** — if the per-validator fee drops faster than the number of validators increases, total fees paid by the L1 actually decrease. That's the opposite of the intended signal.

The ACP explorer makes this navigable. You can compare the Gaussian model against alternatives with the same inputs and see where the aggregate-fee behaviour diverges. That's the right tool for this argument.

### ACP-275 — L1 Trust Profile Framework

If fee models are about economic behaviour, trust profiles are about structural risk. ACP-275 proposes a standardised four-dimension trust profiling system for Avalanche L1s:

- **Validator Control** — how decentralised is the validator set?
- **Distribution** — how spread out are tokens or voting power?
- **Censorship Resistance** — can the L1 be censored by a small coalition?
- **Governance Transparency** — are decisions legible and accountable?

Labels: SP / MP / MS / OP — descriptive categories, not composite scores. Governed by an L1 Trust Profile Board.

This is the companion framework: the fee model tells you what behaviour costs, the trust profile tells you what structural risks you're accepting.

### ACP-283 — Dynamic Minimum Gas Price

The third piece, filed April 2026, proposes validator-voted dynamic gas pricing for the C-Chain, building on ACP-176 and ACP-226. Currently, gas price is a market accident — it clears where it clears. ACP-283 makes it a governance lever.

This is Phase 1's furthest-reaching piece: if the C-Chain gas price becomes a validator-controlled parameter, the entire fee market dynamics change. ACP-255 and ACP-283 don't conflict — they operate at different layers. ACP-255 is L1 validator pricing; ACP-283 is C-Chain base-layer pricing.

---

## Phase 2 — Making MEV Visible

Before changing anything, the data needs to exist.

The 90% figure is striking, but it's one number from one time window. The more important question is: what does the composition of fee burn look like over 12 months? Who are the top fee payers? What strategies are they running? Where is the heavy tail coming from?

This is Phase 2's core work: **make MEV a visible, understood product before trying to change it**.

The "State of Avalanche MEV" paper — published and filterable by time, actor, and strategy — is the foundation for everything that follows. Without it, fee market redesign is guesswork.

The secondary work: explore MEV-aware fee buckets. The current model burns all priority fees. One alternative: route a portion to the treasury, replacing the MEV-dependency structurally rather than hoping it goes away. This is complex — priority fees are the incentive that keeps validators fed — but it's worth modelling explicitly.

---

## Phase 3 — The Tiered Architecture

Here's where the conversation gets more speculative — and more important.

The emerging model across several chains is a two-tier fee market:

| Tier | Transaction | MEV Protection | Revenue |
|------|-------------|----------------|---------|
| **Free** | Public mempool | None | Priority fees + MEV |
| **Premium** | Encrypted / private | Full | Flat fee or subscription |

The free tier keeps MEV revenue for validators. The premium tier sells privacy as a product. Both burn AVAX.

This is not a theoretical construct. **Tempo** — a purpose-built payments L1 incubated by Paradigm and Stripe — tried the clean alternative: stablecoin-native gas, no MEV extraction, privacy coming. It has not reached significant traction despite strong backing.

What Tempo tells us:
- Privacy as a default doesn't sell without institutional demand
- Privacy as an opt-in premium product may be the only viable short-term model
- Replacing fee revenue is harder than it looks

The premium tier is not a utopian alternative to MEV. It's a revenue supplement for a network that will eventually need to stop relying on it.

**Phase 3's protocol work:**
- **Threshold encryption** — validators include encrypted transactions without seeing the content; the ordering mechanism works, the content stays private
- **Validator revenue model for post-MEV era** — explicit modelling of what replaces priority fee income before it becomes a crisis
- **Wallet UX for tier selection** — "Public (free)" vs "Protected (paid)" built into wallets; removes user education burden
- **Formal ACP for premium tier** — if Phase 3 shows traction, codify the distinction into the protocol

---

## Phase 4 — Long-term

- **Mempool privacy as compliance product** — regulated institutions need private transactions by default; chains that built this before it was mandatory will capture the demand
- **Lightweight ZK proofs** — privacy without the complexity of a full ZK rollup
- **Post-quantum threshold encryption** — the long migration path
- **Formal ACP** — if the tiered model works in practice, it gets codified

---

## What This Means for ACP Work Now

| ACP | Status | Role |
|-----|--------|------|
| ACP-247 — Delegation multiplier ↑ | ✅ Merged | Sets the network size that fee models are built around |
| ACP-255 — Gaussian fee curve | 🔴 Open | The core L1 pricing redesign; needs reviewer traction |
| ACP-275 — L1 Trust Profiles | 🔴 Open | The structural risk companion to fee pricing |
| ACP-283 — Dynamic min gas price | 🔴 Open | C-Chain gas as a governance lever |
| ACP-265 — ICNFTT | 🟡 Open | Supporting infrastructure for cross-chain token transfers |

The immediate work is re-engaging reviewers on ACP-255 and ACP-275. Both are in the same phase, both address the same underlying problem from different angles. The explorer makes ACP-255 reviewable without needing to reason about formulas in the abstract.

---

## The Open Questions

1. **Who pays for the premium tier?** If only institutions, volume may be too low to replace MEV revenue. If retail, do they care enough about privacy to pay a premium?

2. **Does Avalanche want to be a MEV chain or a privacy chain?** These may not be compatible long-term. MEV revenue requires a public mempool. Privacy requires加密ation.

3. **Can Subnets implement the premium tier independently of C-Chain?** Faster to iterate without requiring protocol changes. A privacy Subnet with threshold encryption could be the premium tier before the C-Chain supports it.

4. **Can MEV-aware fee buckets be designed without killing the priority fee incentive for validators?** This is the hardest technical question in the roadmap. The incentive has to survive the redesign.

5. **What does Tempo tell us about demand for clean payments?** Very little, so far. But what it tells us is cautionary.

---

*This document will be updated as the ACP track progresses. ACP-255, ACP-275, and ACP-283 are the current centre of gravity — everything else is upstream or downstream of those three.*