---
title: "About L3s and the Superchain, or the Modularity Mess"
layout: note
date: 2024-03-08 09:00
permalink: /about-l-3-s-and-the-superchain-or-the-modularity-mess/
tag:
- crypto
- blockchain
author: jaack
description: "This appeared as a new topic in the Optimism Governance Forum."
published: true
lang: en
original_url: "https://jaack.montaigne.io/about-l-3-s-and-the-superchain-or-the-modularity-mess"
---

*This appeared as a new topic in the* *[Optimism Governance Forum](https://gov.optimism.io/t/about-l3s-and-the-superchain/7764).*

We don’t always know, of all the chains launching that are built on the OP Stack, which ones are actually adhering to the Law of Chains, hence are in the Superchain. This is becoming especially hard with new L3s comings.

As stated in the Law of Chain, an OP Chain needs to:

- Facilitate upgrades to an Ethereum bridge implementation that’s identical to the implementation shared by all other OP Chains
- Run a multi-sequencer OP Stack sequencing scheme (eventually, I’ll add)
- Accrue network network fee revenue to Optimism to fund public goods

I would also like to quote the following paragraph:

> **Modularity and evolution.** The modular design of the OP Stack opens the door for alternate L2 constructions in the future, which may make known tradeoffs (e.g., between decentralization and performance, or between composability and economic autonomy) that establish fundamentally different User expectations. For example:
>
> A future L2 construction might move data availability off of L1 to reduce fees, but decrease fundamental censorship resistances properties. A future L2 construction might include a decentralized sequencing network which facilitates cross-OP Chain composability, but decreases the ability of individual OP Chains to have independently configured economic systems.

I don’t see any mention of L3s, and every mention about the tech stack alignment is referring to settling on Ethereum.

I know that the Law of Chains is just v0.1, but things are moving rapidly, and it would be instrumental to know if L3s are in the Superchain or not. Opening to L3s brings a lot of general issues, because:

- for many L3s, it may not make sense to run a decentralized sequencing scheme, because revenue may not be that high and the chain may just be an appchain
- I would assume than an L3 **does not** implement a canonical bridge to Ethereum, but to the L2 it settles onto.

More specifically, I think we should be able to answer these questions:

1.  Are L3s that **settle** on OP Chains still OP Chains?
2.  Are L3s that **post data** on OP Chains still OP Chains?
3.  Are L3s that **settle** on non-OP Chains but **post data** on OP Chains still OP Chains?
4.  Are L3s that **post data** on non-OP Chains but **settle** on OP Chains still OP Chains?
5.  Are L3s that run a **single-sequencing scheme** still OP Chains?
6.  Are L3s that run a **single-sequencing scheme**, but **settle** and **post data** on OP Chains, still OP Chains?
7.  Are L3s that run non-EVM VMs but follow 1. and 2. still OP Chains?

Modularity, hype cycles and narrative cycles can bring very weird modular chains to life. Imagine a new blockchain that launches with this “modular approach”:

> OP Stack L3 settling on Arbitrum Orbit, with Celestia underneath, running a decentralized sequencing scheme provided by Espresso, each validator being an AVS with stake provided by EigenLayer with ether.fi-staked eETH tokens.

How do we identify an OP Chain in this ‘modular mess’?
