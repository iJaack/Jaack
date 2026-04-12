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

This matters for everything that follows, for reasons that go deeper than the surface-level "more validators is good."

More validators changes the **fee formula's denominator** — the V variable in ACP-255's Gaussian curve, and more broadly the network size that determines how fee pressure distributes across the system. When V is small, fees are dominated by a few large validators. When V is large, the fee curve's shape matters more — small changes in validator distribution create larger swings in total fee burden.

More validators also changes **bandwidth and gossip cost**. Avalanche's consensus requires validators to share state with each other. A denser validator set means more cross-node communication per block, higher infrastructure requirements for validators, and ultimately a more expensive network to run. If fees don't scale with this cost, the network is subsidising validator operations at the expense of burn.

ACP-247 also shifted the **staking yield equation**. With a higher delegation multiplier, smaller validators can participate in validation without running full nodes. This increases the effective validator set faster than token price appreciation would alone. The result: AVAX staked as a fraction of supply increases, and the economic security of the network grows — but the per-validator yield稀释es. Validators that were earning comfortable yields under the old multiplier are now competing with a larger field.

This is the foundation. ACP-255 and ACP-275 are designed to operate on top of it — and their economic influence only makes sense when viewed through the lens of what ACP-247 changed.

---

## Phase 1 — Validator Fee Reform

### ACP-255 — Gaussian Fee Curve for L1 Validator PAYG

The question ACP-255 is trying to answer: if an L1 adds more validators, should its total fee burden go up or down?

Intuitively, up — more validators means more work for the network. But the current linear model doesn't guarantee that. Depending on how per-validator fees interact with total validator count, total fees could theoretically fall as an L1 decentralises. That's the opposite of the intended signal.

The Gaussian curve solves this by making per-validator fees a function of network position, not just absolute validator count. L1s near the network median pay the most. L1s far from the median pay less. The intuition is that the network's fee pressure should reflect how much an L1's validator set diverges from the norm — extreme centralisation or extreme fragmentation both impose costs on the network that the fee curve should reflect.

**Why this matters for AVAX economics:**

The fee burn composition changes depending on which L1s are operating at which points on the curve. If large L1s cluster near the fee maximum, they pay more — and AVAX burn increases. If most L1s are small and far from the median, the curve is cheap for them — and fee burn decreases relative to activity. ACP-255 makes fee burn a function of network structure, not just activity volume.

The second-order effect: **L1s that want to minimise fees will adjust their validator distribution.** A large L1 that aggressively decentralises its validator set moves left on the Gaussian curve, paying less per validator. But it pays for more validators. Whether total fees go up or down depends on the elasticity of the fee curve at that point. This is why the aggregate-fee objection is the right objection — and why the explorer matters. You can actually see where the tradeoffs are.

**The unresolved question:** whether ACP-255 creates the right incentives for L1 behaviour, or whether L1s will simply absorb the cost without changing behaviour. Fee models can only shape behaviour if the fee signal is large enough relative to other costs. If validator operation is the binding constraint, L1s will absorb fees rather than reduce validator count. The curve becomes a revenue mechanism, not a behaviour mechanism.

### ACP-275 — L1 Trust Profile Framework

Trust profiles operate in a different plane from fee models — but the economic consequence is equally significant.

The four dimensions (Validator Control, Distribution, Censorship Resistance, Governance Transparency) create a language for describing L1 risk that didn't exist before. This matters for AVAX economics in two ways.

**First:** markets price trust. If L1 trust profiles become legible — whether through Routescan, through Ava Labs reporting, or through third-party analytics — then L1 token holders will demand a trust premium. L1s with poor trust profiles will see higher borrowing costs, lower TVL, and less institutional adoption. L1s with strong profiles will command a trust premium. The ACP creates a market for trust quality.

**Second:** trust profiles create a feedback loop for validators. An L1 with poor validator distribution or high validator control is structurally easier to censor. Validators that want to avoid operating in censored environments will exit those L1s. Validators that remain face reputational and eventually economic consequences. The trust profile doesn't enforce anything — but it makes the cost of bad behaviour visible, and markets respond to visible costs.

**The key question for ACP-275:** does the trust label create economic behaviour change, or does it just describe existing behaviour? If it's the former, it meaningfully shapes AVAX economics. If it's the latter, it's a reporting standard with limited impact.

### ACP-283 — Dynamic Minimum Gas Price

Validator-voted dynamic gas pricing for the C-Chain, building on ACP-176 and ACP-226. Currently, gas price clears where it clears. ACP-283 makes it a governance parameter.

The economic significance is indirect but important: if gas price is validator-controlled, validators become direct participants in fee market governance. This changes the incentive structure. Validators who benefit from higher gas prices — because it increases their fee revenue — have a structural interest in voting for higher gas prices. If the voting mechanism doesn't account for this self-interest, you get fee inflation.

If it does account for it — through some form of commitment scheme, slashing, or stake-weighted voting with countervailing incentives — then gas price becomes a well-governed parameter. That's better than the current market accident. But the governance design matters enormously.

---

## Phase 2 — Making MEV Visible

Before changing anything, the data needs to exist.

The 90% figure is striking, but it's one number from one time window. The more important question: what does fee burn composition look like over 12 months? Who are the top fee payers? What strategies are they running? Where is the heavy tail coming from?

This is Phase 2's core work: make MEV a visible, understood product before trying to change it.

The "State of Avalanche MEV" paper — filterable by time, actor, and strategy — is the foundation. Without it, fee market redesign is guesswork.

The secondary work: explore MEV-aware fee buckets. One alternative worth modelling explicitly: route a portion of priority fees to the treasury, reducing MEV-dependency structurally. This is complex — priority fees are the incentive that keeps validators fed — but the alternative is hoping MEV disappears gracefully, which Tempo suggests it won't.

---

## Phase 3 — The Tiered Architecture

The emerging model across several chains is a two-tier fee market:

| Tier | Transaction | MEV Protection | Revenue |
|------|-------------|----------------|---------|
| **Free** | Public mempool | None | Priority fees + MEV |
| **Premium** | Encrypted / private | Full | Flat fee or subscription |

The free tier keeps MEV revenue. The premium tier sells privacy as a product. Both burn AVAX.

**Tempo** — a purpose-built payments L1 incubated by Paradigm and Stripe — tried the clean alternative without the tiered model: stablecoin-native gas, no MEV extraction, privacy coming. It has not reached significant traction despite strong backing.

What Tempo tells us:
- Privacy as a default doesn't sell without institutional demand
- Privacy as an opt-in premium product may be the only viable short-term model
- Replacing fee revenue is harder than it looks

The premium tier is not a utopian alternative to MEV. It is a revenue supplement for a network that eventually needs to stop relying on public-mempool MEV. Phase 3's protocol work — threshold encryption, post-MEV validator revenue modelling, wallet tier selection — is the preparation for a transition that will happen whether or not anyone plans for it.

---

## Phase 4 — Long-term

- Mempool privacy as a compliance product — chains that built this before it was mandatory will capture institutional demand
- Lightweight ZK proofs — privacy without full ZK rollup complexity
- Post-quantum threshold encryption — the long migration path
- Formal ACP for the tiered fee model — if Phase 3 shows traction, codify it

---

## How ACP-247, ACP-255, and ACP-275 Shape AVAX Economics

These three ACPs are often discussed separately — and they were designed separately. But their economic influence is deeply interconnected, and treating them as independent misses the real story.

**ACP-247 set the foundation.** It changed the validator count, the staking yield, and the network's cost structure. The fee formulas in ACP-255 and the trust market in ACP-275 operate in the network that ACP-247 created. Without ACP-247, ACP-255's Gaussian curve would be operating against a smaller, less decentralised validator set — and the fee signal would be noisier.

**ACP-255 reshapes the fee burden.** It makes AVAX burn a function of where an L1 sits relative to the network norm, not just how many validators it runs. The consequence: L1 behaviour changes in response to fee incentives. Large L1s that over-centralise pay more. L1s that decentralise beyond a point also pay more. The curve creates a U-shaped cost optimum — and the market will find it.

**ACP-275 creates a trust market.** The four-dimension framework doesn't enforce trust — it makes it legible and therefore priced. L1s with better trust profiles attract more TVL, lower borrowing costs, and more institutional participation. Over time, the trust premium creates economic incentives to improve trust profiles. Validators migrate toward better-trusted L1s. The market for trust becomes a market for quality.

**The interconnection:** ACP-247 pushes the network toward a larger, more decentralised validator set. ACP-255 prices that validator set correctly — making sure fees reflect the network cost of different L1 configurations. ACP-275 ensures that structural risk (who controls validators, how distributed is power, how censorable is the L1) is visible and priced into the system.

Together, they create a fee + trust market that is structurally more sophisticated than what exists today. The C-Chain's MEV dependency doesn't disappear — but the rest of the network becomes a more coherent economic system, with fee signals and trust signals working in the same direction.

Whether that coherence holds as the tiered model in Phase 3 becomes relevant — and as encrypted transactions change the MEV surface — is the open question that makes the next 18 months of ACP work genuinely consequential.

---

## ACP Status Summary

| ACP | Author | Status | Role |
|-----|--------|--------|------|
| ACP-247 — Delegation multiplier ↑ | Jaack | ✅ Merged | Sets the network size and cost structure for subsequent work |
| ACP-255 — Gaussian fee curve | Jaack | 🔴 Open | Reshapes fee burden as a function of network position |
| ACP-275 — L1 Trust Profiles | Jaack | 🔴 Open | Creates the trust market that fee signals operate within |
| ACP-283 — Dynamic min gas price | — | 🔴 Open | C-Chain gas as governance parameter; governance design is the risk |
| ACP-265 — ICNFTT | midnight-commit | 🟡 Open | Supporting infrastructure for cross-chain token transfers |

---

## The Open Questions

1. **Does ACP-255's curve create behaviour change, or just revenue?** If the fee signal isn't large enough relative to other validator costs, L1s absorb fees without adjusting behaviour.

2. **Does ACP-275's trust label create market consequences, or just reporting?** Legible trust creates economic behaviour change. Descriptive trust creates a standard.

3. **Can ACP-283's governance mechanism prevent validator self-interest from dominating gas price voting?** The design matters more than the intent.

4. **What replaces priority fee income when the premium tier reaches meaningful scale?** This isn't rhetorical — it needs explicit modelling before Phase 3 is design-complete.

5. **Can the three ACPs be designed to reinforce each other — fee signals and trust signals working in the same direction — rather than creating conflicting incentives?**