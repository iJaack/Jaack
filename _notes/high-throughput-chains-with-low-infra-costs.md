---
title: "High-throughput chains with low infra costs?"
layout: note
date: 2024-09-29 09:00
permalink: /high-throughput-chains-with-low-infra-costs/
tag:
- crypto
- blockchain
author: jaack
description: "Notes and bullet points for a discussion at Messari Mainnet 2024"
published: true
lang: en
original_url: "https://jaack.montaigne.io/high-throughput-chains-with-low-infra-costs"
---

### *Notes and bullet points for a discussion at Messari Mainnet 2024*
{: #notes-and-bullet-points-for-a-discussion-at-messari-mainnet-2024}

Introduction

- Who am I
- What we do at Routescan
  - How we started with Avascan
  - Launch and growth of Routescan during 2023 and 2024
- Short topic intro
  - Since we started working on block explorers, we wanted to lower the barrier to entry for chains, having envisioned a multichain future on Avalanche
    - Story of how we built a multichain indexing engine, and how we worked on it so much because we saw that we would have millions of dollars worth of indexing costs if we didn’t optimize the architecture
    - The narrative has now fully shifted to a modular, multichain future but a multichain world has underground costs that not everyone is aware of
    - And while most services are perceived as ‘essential tooling’, like RPCs and wallets, block explorers are still often somehow perceived as public good. But who pays for it?
- Cost breakdown
  - **Node**: most block explorers run their own nodes to also act as an alternative *source of truth*, and it’s critical that we (but I guess most explorer providers) have access to an archive node with debug trace active so that we can, at any point, collect the full history of state changes in the (Ethereum) Virtual Machine
  - **Indexing**: servers or server less functions that process transactions or blocks as soon as they’re executed and found onchain. The more the txs executed, the higher the costs to index the chain - it’s a completely variable cost. Once a tx is indexed, it doesn’t need to be re-indexed, unless it’s corrupt (for a reorg, for example) or incomplete, and a recover is needed.
  - **Storage**: Once txs are indexed, every related data (machine state with updated account balances, lists, etc.) can be stored - this can be a low cost (it is low for us) per month and increases over time as tx history increases.

So, does it make sense to index and store everything?

- De-Fi chains: low tx/user ratio
  - Like TCP/IP, every tx is somewhat valuable, so we **need** to track every tx and manipulate the datasets in many different ways
  - Examples: Avalanche C-Chain, Arbitrum One, Base, Mode
- Gaming chain: high tx/user ratio
  - Some txs are valuable (NFT transfers, awards, status milestone, player registration), other may not be (single player movements, micro operations, etc.), so like UDP/IP maybe it’s OK to loose some txs and not have everything?
  - Examples: XAI, Proof of Play

This is a recurring and increasing problem: tx history will **always go up**, and cannot possibly go down.

If you look at us, medium-sized and big chains are choosing Routescan as their explorer, but still the pricing we offer is very expensive for some use cases.

The best is free, but to make it free we need to find a way to make it sustainable by itself:

- Explorer as a validator / sequencer / prover, so that it gets fees proportional to the tx traffic - still could be unsustainable with L3s, that have very low fees
- More structured and straightforward Public goods funding programs (e.g. OP Retro Funding) to make it sustainable and have multiple providers in an ecosystem
- The Explorer Token - a token could make the business model of an explorer more sustainable because it will enable the explorer as a permissionless, decentralized platform, and not as a service. It would align the incentives of chains, users and developers.
