---
layout: post
title: "Avalanche Has a Fee Problem"
date: 2026-04-12
lang: en
---

## The Inflation That's Nobody's Fault (Except It Has to Be Fixed)

AVAX has a structural tokenomics problem. Most people in the ecosystem sense it but don't name it clearly, so it just floats around as a vague concern in Twitter threads and governance chats.

Here's the problem: the network pays validators with newly minted AVAX. That's inflation — ongoing dilution of every AVAX holder's position. The only counterweight is fee burn: AVAX destroyed when transactions are processed. In theory, as the network grows, fee burn eventually offsets that inflation. AVAX becomes less inflationary. Maybe even deflationary.

That theory isn't holding.

Avalanche isn't burning enough fees to cover validator rewards. The gap is large. If fee burn doesn't catch up to issuance, the token supply grows until the economics stop working — or until validators drop out because validation isn't profitable enough.

This isn't a narrative problem. It's math. And it needs solving.

---

## The 90% Number

Here's the number that almost nobody puts in a tweet:

On the C-Chain — the network's main execution layer — roughly **90% of AVAX burned comes from priority fees paid by MEV bots**.

Not base fees. Not gas from regular users. Priority fees: the extra payment arbitrageurs layer on top of the base fee to jump the queue.

The median tip is 0.000001 nAVAX. Effectively zero. The top 0.1% of tips are 230 nAVAX. The tail is the entire economic model.

Two things are wrong with this.

**One:** the composition is fragile. If encrypted transactions become normal — whether regulators require it or users just start expecting it — the public mempool MEV surface shrinks. The tail that funds the network can evaporate. Chains that haven't built a backup plan will be building one under pressure.

**Two:** regular users pay almost nothing. The median transaction tip is effectively zero. The people paying for the network are bots running arbitrage strategies, not humans moving assets. That's not a stable long-term fee model. It's aMEV subsidy dressed up as a fee market.

---

## The L1 Validator Fee Mess

The C-Chain's fee revenue is one problem. L1 validator fees are a different problem — and this is where ACP-255 comes in.

Today, L1 validator fees follow a linear model: a base rate per validator, with some modest adjustments. The problem is that fees should reflect the actual cost each L1 imposes on the network — and that cost scales nonlinearly. More validators means more gossip traffic, more consensus overhead, more bandwidth. A properly calibrated fee model prices that correctly.

ACP-255 proposes replacing the linear model with a Gaussian curve. The idea: L1s that are extremely centralised or extremely fragmented pay less. L1s near the network median pay more. The fee signal actually reflects the cost of the validator configuration.

The logic is sound. The implementation needs work.

**The aggregate-fee problem:** depending on how per-validator fees interact with total validator count, an L1 adding validators can actually see its total fee burden fall. That's backwards. More validators should mean higher total fees — because more validators impose more cost on the network. The current curve fails this test in places. That's the objection the reviewer raised, and it's the right one.

**Why AVAX holders should care:** if L1s are underpaying for what they consume, the cost falls on everyone who holds AVAX. Correcting the fee model means more AVAX burn per L1. ACP-255 is a fee-routing improvement that also happens to benefit tokenholders directly.

---

## What ACP-247 Actually Did (And Why It Matters)

ACP-247, merged December 2025, raised the delegation multiplier from 4x to 24x and reduced maximum validator weight. More validators became competitive. The network decentralised. The validator count moved toward 10,000–15,000.

This matters more than it looks like it matters.

More validators changes the denominator in the fee formula — the V variable in ACP-255's Gaussian curve. When V is small, the fee curve is noisy. When V is large, the fee signal is clean and the cost of different L1 configurations becomes legible.

More validators also changes the bandwidth cost. Avalanche's consensus requires validators to share state. A denser validator set means more cross-node communication, higher infrastructure costs. If L1 fees don't scale with this cost, validators are being subsidised — which means by AVAX holders.

ACP-247 also changed the staking yield equation. With a higher delegation multiplier, more validators compete for the same reward pool. Per-validator yield dilutes. Validators who were earning comfortable yields under the old multiplier are now competing in a larger field.

ACP-255 is designed to operate in the network that ACP-247 created. Without that foundation, the fee curve would be working against a smaller, less decentralised validator set. Delegation was the foundation. The fee model redesign is the next floor.

---

## The Roadmap

The problem has three parts: L1 fees are mispriced, MEV dependency is a structural fragility, and the fee market isn't sophisticated enough to route value correctly to AVAX holders. Here's how to fix all three.

### Phase 1 — Fix L1 Validator Fees (Now → 6 months)

**ACP-255** replaces the linear L1 validator fee model with a Gaussian curve that prices validator configurations according to their actual cost to the network. The key deliverable is a version that passes the aggregate-fee test: total fees must always go up as an L1 decentralises, never down. The explorer exists so reviewers can see the tradeoffs without wading through the math.

**ACP-275** creates a trust profile framework for L1s — four dimensions (Validator Control, Validator Operator Diversity, Bridged Asset Security, Governance Transparency) with descriptive labels instead of composite scores. This isn't a scoring exercise. It's market infrastructure: making trust legible so markets can price it. L1s with poor trust profiles face higher borrowing costs and less institutional adoption. The framework creates economic consequences for bad behaviour, not regulatory enforcement.

Both ACPs are stalled. Both need reviewer re-engagement.

### Phase 2 — Make MEV Visible (6–12 months)

Before changing the fee market, the data needs to exist.

The 90% figure is one number from one window. What matters is the 12-month composition: who the top fee payers are, what strategies they're running, where the tail comes from, how it shifts under different market conditions.

Phase 2's primary deliverable: a published, filterable "State of Avalanche MEV" analysis. Researchers, validators, and protocol contributors need this before anyone can redesign anything intelligently.

Secondary work: model MEV-aware fee buckets. Currently all priority fees burn. An alternative worth taking seriously: route some of it to the treasury, reducing structural MEV dependency. The risk is obvious — priority fees are what validators earn for ordering transactions. Redirecting them changes validator economics. But modelling this explicitly before a crisis forces a rushed decision is better than the alternative.

### Phase 3 — Tiered Fee Market (12–24 months)

The emerging model across several chains is a two-tier fee market:

| Tier | Transaction | MEV Protection | Revenue |
|------|-------------|----------------|---------|
| **Free** | Public mempool | None | Priority fees + MEV |
| **Premium** | Encrypted / private | Full | Flat fee or subscription |

The free tier keeps MEV revenue. The premium tier sells privacy as a product. Both burn AVAX.

Tempo — a purpose-built payments L1 incubated by Paradigm and Stripe, stablecoin-native gas, no MEV extraction, privacy coming — is the useful counterexample. Despite strong backing and a clean design, it hasn't reached significant traction. Privacy as a default doesn't sell. Privacy as an opt-in premium product may be the only viable model short-term. Replacing MEV revenue is harder than it looks.

Phase 3 work: design the encrypted transaction tier, model what replaces priority fee income when the premium tier reaches meaningful scale, build the wallet UX for tier selection. If Phase 2 shows the MEV dependency problem is worsening faster than expected, Phase 3 moves up the schedule.

---

## Why AVAX Holders Should Care

Every AVAX holder is diluted by validator reward issuance every day. Fee burn is the only counterbalancing force.

If fee burn doesn't grow to offset validator rewards, AVAX becomes more inflationary over time. Supply grows. Price has to work harder just to stay flat.

The roadmap is a set of proposals to increase fee burn and improve fee routing. ACP-255 corrects L1 validator pricing. Phase 2 makes the MEV composition visible and gives the community the data to push for change. Phase 3 builds the replacement revenue model before the current one becomes unviable.

The alternative is hoping MEV activity continues at current levels forever. Tempo suggests that is not a plan.

---

## ACP Status

| ACP | Author | Status | What it does |
|-----|--------|--------|-------------|
| ACP-247 — Delegation multiplier ↑ | Jaack | ✅ Merged | Foundation: larger validator set, cleaner fee signals |
| ACP-255 — Gaussian fee curve | Jaack | 🔴 Open | Correct L1 pricing: fees should reflect network cost |
| ACP-275 — L1 Trust Profiles | Jaack | 🔴 Open | Make trust legible: markets price what they can see |
| ACP-283 — Dynamic min gas price | — | 🔴 Open | C-Chain gas as a governance parameter |
| ACP-265 — ICNFTT | midnight-commit | 🟡 Open | Supporting infrastructure |
| ACP-224/267 | — | ✅ Merged | FeeConfig finalised; uptime dates set |

The immediate action is re-engaging reviewers on ACP-255 and ACP-275. ACP-255 has the stronger practical case — it directly increases fee burn if implemented correctly — and the explorer makes the technical arguments accessible to people who don't want to work through formulas. That's where the energy should go first.