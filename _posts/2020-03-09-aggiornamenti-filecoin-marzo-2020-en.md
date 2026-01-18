---
title: "Filecoin February 2020: tipsets, proof system, roadmap"
layout: post
date: 2020-03-09 16:00
image: https://filecoin.io/images/blog/blog-post-banner-roadmap-update-feb-2020.jpg
headerImage: true
tag:
- blockchain
category: blog
author: jaack
description: Filecoin updates for the last quarter
published: true
lang: en
---

Periodically, I follow updates on blockchain projects that I believe have
still unexpressed potential. Among these is **Filecoin**, which is a project built
on IPFS ([which I have already discussed extensively]({{base}}/filecoin-update-q2-q3-2019/)).

The updates for February are as follows.

### Tipsets
Filecoin explains how *tipsets* work, a module of their
Expected Consensus Protocol. *Tipsets* are a
variant of child blocks in a DAG, a directed acyclic graph, used on Ethereum. In short, while block consensus on the bitcoin blockchain happens on the longest chain,
on Ethereum each block can have 'uncle' blocks (**Uncle Blocks**), which are mined
in the same Epoch as a parent block, but did not reach the majority consensus.

In Ethereum, Uncle Blocks can give more relevance to a new child block that was mined
from the parent block, effectively entering the main block chain. In Filecoin, however,
the approach is slightly different: each tipset (set of latest blocks) has a *weight*, given by the sum of the parents it is connected to. In the image below there is a schematic representation, which is certainly easier to understand.

<img class="image" src="https://filecoin.io/images/blog/tipsets-family-weights-5.svg"/>

Since, moreover, validated blocks are only those that come from the same parent and are mined in the same epoch, a potential divergence of blocks (a temporary fork between one epoch and another) is quickly resolved and at the same time more miners are rewarded, who may have, together, produced more blocks. Thinking about this, a doubt comes to me: how to avoid mining then being centralized in the hands of a few? How to ensure that at each epoch there is even a partial change of miners elected for the production of the next block?

([Source](https://filecoin.io/blog/tipsets-family-based-approach-to-consensus/))

### The Proof System

Filecoin announces details of its Proof System, a mix of proofs to demonstrate authority, deserve it again and receive reward from stored data space:

- **Proof-of-Space**: to demonstrate authority in obtaining data to save on one's hard disk, the miner must demonstrate having the required space on the storage medium;
- **Proof-of-Storage**: is the system that serves to demonstrate having a specific piece of data in one's storage medium;
- **Proof-of-Spacetime**: is the system that asks a random number of miners to publicly prove that the data they received are still in their storage medium.

Proof-of-Space and Proof-of-Storage were combined by Protocol Labs (the team developing Filecoin) into **Proof-of-Replication**.

Along with this explanation (which is actually much more complex than this), Protocol Labs explains the reasons why it took so long to develop Filecoin: to optimize these configurations (finding the right mix between incentives, processing time and security), they had to rely on software that solves optimization problems with constraints, and find the right constraints that guaranteed the aforementioned mix.

([Source](https://filecoin.io/blog/filecoin-proof-system/))

### Roadmap

- After launching Phase 1 of the Testnet on December 11, 2019, over 3.6 PiB of proven storage were accumulated;
- Developers released Filecoin implementations [in C++](https://github.com/filecoin-project/cpp-filecoin) and [in Rust](https://github.com/chainsafe/forest) and are working on interoperability between these implementations;
- Proof-of-Replication was optimized (as described above), optimizing the SNARK proof system (2x increase);
- **Textile** announced they are working on tools to easily build applications for the Filecoin network.
- The platform [Terminal.co](terminal.co) was launched (not by the Filecoin team), which promises to easily distribute your site with IPFS starting from a Github repository. The site is simultaneously distributed both on IPFS and on http(s) protocol via a global CDN;
- [Zondax](https://zondax.ch/) published the repository related to the development of an app to view the [Filecoin Ledger](https://github.com/Zondax/ledger-filecoin), while [Open Work Labs](https://www.openworklabs.com/) is working on a [wallet](https://twitter.com/openworklabs/status/1225882262291378176).
- Trustwallet announced [support for Filecoin tokens](https://github.com/trustwallet/wallet-core/pull/811)

[Source](https://filecoin.io/blog/roadmap-update-february-2020/)

---

Other resources: [How Filecoin works, in 5 minutes](https://protocol.ai/blog/technical-barriers-to-blockchain/)
