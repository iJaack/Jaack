---
layout: post
title: "Avalanche Has a Fee Problem"
date: 2026-04-12
lang: en
---

## The Inflation That Isn't Being Paid For

AVAX has a structural tokenomics problem that most people in the ecosystem talk around without naming.

The network issues validator rewards. Those rewards are paid in newly minted AVAX. That is inflation — ongoing dilution of every AVAX holder's position. The counterbalancing force is fee burn: AVAX destroyed when transactions are processed. The theory is that as the network grows, fee burn eventually offsets inflation, making AVAX deflationary or at least less inflationary.

That theory is not holding.

Avalanche is not burning enough fees to cover validator rewards. The gap is currently large, which means AVAX holders are being diluted faster than the network is buying back tokens. This is not a narrative problem. It is a math problem. If fee burn doesn't catch up to validator reward issuance, the token supply grows until the economics become untenable — or until the validator set shrinks because validation is no longer profitable enough.

This is the problem that needs solving. Everything in this roadmap is about solving it.

---

## The 90% Number

On the C-Chain — the network's primary execution layer — roughly **90% of AVAX burned comes from priority fees paid by MEV bots**.

Not base fees. Not gas paid by users. Priority fees: the extra payment arbitrageurs and searchers layer on top of the base fee to jump the queue.

The median tip is 0.000001 nAVAX. The top 0.1% of tips are 230 nAVAX. The tail is the entire economic model.

Two things are wrong with this.

**First:** the fee burn composition is fragile. If encrypted transactions become the norm — whether through regulatory pressure or user preference — the public mempool MEV surface shrinks. The tail that currently funds the network can disappear. Chains that haven't built a replacement revenue model will have to build one under pressure.

**Second:** ordinary users pay almost nothing. The median transaction tip is effectively zero. The people who are paying for the network are algorithmic actors running bots, not the humans using the chain. This is not a stable long-term fee model. It is aMEV subsidy.

---

## The L1 Validator Fee Problem

The C-Chain's fee revenue is one problem. The L1 validator fee structure is a different problem, and it is the one that ACP-255 is trying to fix.

Today, L1 validator fees are charged on a linear model: a base rate per validator, with modest adjustments. The problem is that fees should reflect the cost that each L1 imposes on the network — and that cost scales nonlinearly. More validators means more gossip traffic, more consensus overhead, more bandwidth. A properly calibrated fee model prices this correctly.

ACP-255 proposes replacing the linear model with a Gaussian curve centred on the network validator median. The effect: L1s that are extremely centralised or extremely fragmented pay less. L1s near the network median pay more. The curve is designed to make the fee signal reflect the actual cost of the validator configuration.

The economic logic is sound. The implementation needs work.

**The aggregate-fee problem:** depending on how the per-validator fee interacts with total validator count, an L1 decentralising can see its total fee burden fall. That is the opposite of the intended signal. More validators should mean higher total fees, because more validators impose more cost on the network. The curve as currently drafted can fail this test at certain points. The explorer makes this visible — which is why it matters.

**Why this is a tokenholder issue:** if L1s are underpaying for the network resources they consume, the cost falls on AVAX holders. Correcting the fee model means more AVAX burn per L1, which directly benefits tokenholders. ACP-255 is a fee-routing improvement that also happens to be a tokenholder proposal.

---

## What ACP-247 Changed — and Why It Sets the Stage

ACP-247, merged December 2025, raised the delegation multiplier from 4x to 24x and reduced maximum validator weight. The effect: more validators became competitive, the validator count moved toward 10,000–15,000, and the network became meaningfully more decentralised.

This matters for the fee model for reasons that go deeper than the surface.

More validators changes the denominator in the fee formula — the V variable in ACP-255's Gaussian curve. When V is small, the fee curve is noisy. When V is large, the fee signal is cleaner and the cost of different L1 configurations becomes more legible.

More validators also changes the bandwidth cost of running the network. Avalanche's consensus requires validators to share state. A denser validator set means more cross-node communication, higher infrastructure costs, and ultimately higher network cost. If L1 fees don't scale with this cost, validators are being subsidised by the network — which means by AVAX holders.

ACP-247 also shifted the staking yield equation. With a higher delegation multiplier, more validators compete for the same reward pool. Per-validator yield稀释es. Validators who were earning comfortable yields under the old multiplier are now competing in a larger field.

ACP-255 is designed to operate in the network that ACP-247 created. Without ACP-247, the fee curve would be working against a smaller, less decentralised validator set. The delegation change was the foundation. The fee model redesign is the next floor.

---

## The Roadmap

The problem has three parts: L1 validator fees are mispriced, MEV dependency is structural fragility, and the fee market is not yet sophisticated enough to route value correctly to AVAX holders. The roadmap addresses all three.

### Phase 1 — Fix L1 Validator Fees (Now → 6 months)

**ACP-255** replaces the linear L1 validator fee model with a Gaussian curve that prices validator configurations according to their cost to the network. The key deliverable is a version that passes the aggregate-fee test: total fees must always increase as an L1 decentralises, not fall. The explorer makes the tradeoffs visible to reviewers who don't want to work through the math.

**ACP-275** creates a trust profile framework for L1s — four dimensions (Validator Control, Validator Operator Diversity, Bridged Asset Security, Governance Transparency) with descriptive labels rather than composite scores. This is not a scoring exercise. It is a market infrastructure project: making trust legible so that markets can price it. L1s with poor trust profiles will face higher borrowing costs and less institutional adoption. The framework creates economic consequences for bad behaviour, not regulatory enforcement.

Both ACPs need reviewer re-engagement. Both are currently stalled.

### Phase 2 — Make MEV Visible (6–12 months)

Before changing the fee market, the data needs to exist.

The 90% figure is striking, but it's one number. What matters is the 12-month composition: who the top fee payers are, what strategies they're running, where the heavy tail comes from, how it changes during different market conditions.

This is Phase 2's primary deliverable: a published, filterable "State of Avalanche MEV" analysis that makes the fee burn composition legible to researchers, validators, and protocol contributors. Without this, fee market redesign is guesswork.

The secondary work: explore MEV-aware fee buckets. Currently all priority fees burn. An alternative worth modelling: route a portion to the treasury, reducing the structural MEV dependency. The risk is obvious — priority fees are what validators earn for ordering transactions. If you redirect them, you change validator economics. But doing this modelling explicitly, before a crisis forces a rushed decision, is better than the alternative.

### Phase 3 — Tiered Fee Market (12–24 months)

The emerging model across several chains is a two-tier fee market:

| Tier | Transaction | MEV Protection | Revenue |
|------|-------------|----------------|---------|
| **Free** | Public mempool | None | Priority fees + MEV |
| **Premium** | Encrypted / private | Full | Flat fee or subscription |

The free tier keeps MEV revenue. The premium tier sells privacy as a product. Both burn AVAX.

Tempo — a purpose-built payments L1 incubated by Paradigm and Stripe, with stablecoin-native gas and no MEV extraction — is the counterexample worth studying. Despite strong backing and a clean design, it has not reached significant traction. Privacy as a default doesn't sell. Privacy as an opt-in premium product may be the only viable short-term model. Replacing MEV revenue is harder than it looks.

The Phase 3 work: design the encrypted transaction tier, model what replaces priority fee income when the premium tier reaches meaningful scale, and build the wallet UX for tier selection. If Phase 2 shows the MEV dependency problem is worsening faster than expected, Phase 3 moves up.

---

## Why AVAX Holders Should Care

Every AVAX holder has a stake in this.

The network issues validator rewards in newly minted AVAX. Every AVAX holder is diluted by this every day. The only counterbalancing force is fee burn — AVAX destroyed by the network's activity.

If fee burn doesn't grow to offset validator rewards, AVAX becomes more inflationary over time. The supply grows. The price has to work harder just to stay flat.

The roadmap is a set of proposals to increase fee burn and improve fee routing. ACP-255 does it by correcting L1 validator pricing. Phase 2 does it by making the MEV composition visible and giving the community the data to push for change. Phase 3 does it by building the replacement revenue model before the current one becomes unviable.

The alternative is hoping MEV activity continues at current levels forever. Tempo suggests that is not a plan.

---

## ACP Status

| ACP | Author | Status | Role |
|-----|--------|--------|------|
| ACP-247 — Delegation multiplier ↑ | Jaack | ✅ Merged | Foundation: larger validator set, cleaner fee signals |
| ACP-255 — Gaussian fee curve | Jaack | 🔴 Open | Correct L1 pricing: fees should reflect network cost |
| ACP-275 — L1 Trust Profiles | Jaack | 🔴 Open | Make trust legible: markets price what they can see |
| ACP-283 — Dynamic min gas price | — | 🔴 Open | C-Chain gas as a governance parameter |
| ACP-265 — ICNFTT | midnight-commit | 🟡 Open | Supporting infrastructure |
| ACP-224/267 | — | ✅ Merged | FeeConfig finalised; uptime requirement dates |

The immediate action is re-engaging reviewers on ACP-255 and ACP-275. Both are stalled. ACP-255 has the stronger practical case — it directly increases fee burn if implemented correctly — and the explorer makes the technical arguments accessible to non-mathematicians. That is where the energy should go first.