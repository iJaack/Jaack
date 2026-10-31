---
title: "How to sustain block explorers for L3s?"
layout: post
date: 2024-07-25 09:00
permalink: /how-to-sustain-block-explorers-for-l-3-s/
tag:
- crypto
- blockchain
category: blog
author: jaack
description: "Routescan is not yet indexing any L3."
published: true
lang: en
original_url: "https://jaack.montaigne.io/how-to-sustain-block-explorers-for-l-3-s"
image: /assets/images/montaigne/how-to-sustain-block-explorers-for-l-3-s/01.png
headerImage: false
---

Routescan is not yet indexing any L3. That is not a choice we made, but a consequence of the market. I’m following up, and responding to, Syndicate’s blog post on [The Economies of L3s](https://syndicate.io/blog/l3-economics). As Syndicate states in their post, an L3 is a cost center because it basically *does not make any money.* Fees paid paid by users (or, even worse, subsidized by a paymaster that’s either the chain team or one affiliated) are so low that the scale to even break event with just node and RPCs costs needs to be immense - we’re talking about tens of millions of transactions ***per day***. Or, fees need to be just a bit lower than L2s, but that doesn’t really convince users to go another layer up and far from the base layer.

Maybe some L3s can be profitable if they have a specific value proposition for users (like the mentioned Proof of Play), but they’re only profitable against the basic infra, that is they make more money that they pay to batch onto the L2 and to run the nodes:

*Profit = FeesRevenue - L2BatchFees - NodeExpenses*

This doesn’t take into consideration RPC costs (a chain typically has at least 2-3 different public RPCs and several private RPCs for testing and selected partners) and, most notably, **block explorers.**

Block explorers are way more expensive than any other piece of infrastructure, for a very simple reason: explorers need to retain the **full history of the blockchain**, and can’t simply run subgraphs.

The role of the block explorer is to provide tooling to developers to debug and test contracts and for users to trace funds anywhere. So it **needs** to be reliable in this sense, to have the full history complete with contract deployments, source codes and all related data.

And this costs a lot of money. As I’ve said many times, server costs related to block explorers are two: **indexing** and **storage**.

**Indexing** refers to the just-in-time processing of transactions in blocks; **storage** refers to saving the indexed data in specific orders and schemas. Independently from the indexing costs, that can greatly vary based on the indexing architecture, the storage costs are *infinitely increasing*, for obvious reasons: transactions go up every day, and the history needs to be kept **in full**. We can’t just prune old history, otherwise how can we tell you that a certain contract has some byte code? Or how can we track a specific ERC-20 balance in an address over time?

We could, of course, run various subgraphs. But explorer needs to host and save **every data**, so we’d need to use every subgraph available, and maybe build some other on top. This is just **inefficient**, and doesn’t scale.

Storage costs never stop.

Let’s say, for example, that storing a million of transactions costs **5\$/month** to store (this applies to cloud services of course, I can’t say when talking about bare metal solutions, and heavily depends on the cloud provider). Let’s also assume that the chain has a low throughput, compatible with one of a DeFi-focused chain, that is roughly 3 TPS, or roughly 8 millions transactions per month:

![How to sustain block explorers for L3s? image 1](/assets/images/montaigne/how-to-sustain-block-explorers-for-l-3-s/01.png)

The total to spend over **5 years is 73,200\$, an average of 1,200\$/month**. Still high if you want to see it that way, but reasonable.

But let’s look at what happens if we benchmark a gaming chain that has roughly 75 TPS, a little bit less than Xai:

The total to spend over 5 years, only in storage, not counting indexing, is a **whopping 1,830,000\$, or 30,500\$ on average per month**.

![How to sustain block explorers for L3s? image 2](/assets/images/montaigne/how-to-sustain-block-explorers-for-l-3-s/02.png)

How do you sustain that? But someone needs to pay for it, because users and developers need block explorers, they’re a critical part of the infrastructure, and it’s also recommended to have more than one to not have a single point of failure for such a critical piece of infrastructure.

Even if you divide the number by 5 (that’s a very low price for storage, hard to achieve right now if you want to save data in a way you can actually retrieve them), you’ll still get more than 300,000\$ in 5 years, I repeat, excluding indexing costs.

I do not have answers, solutions, I just wanted to follow-up and present more issues, because this is a hard problem. It’s up for discussion now.
