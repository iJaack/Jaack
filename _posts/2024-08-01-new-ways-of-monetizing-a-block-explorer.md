---
title: "New ways of monetizing a block explorer"
layout: post
date: 2024-08-01 09:00
permalink: /new-ways-of-monetizing-a-block-explorer/
tag:
- crypto
- blockchain
category: blog
author: jaack
description: "The block explorer is perceived as a public good."
published: true
lang: en
original_url: "https://jaack.montaigne.io/new-ways-of-monetizing-a-block-explorer"
image: /assets/images/montaigne/new-ways-of-monetizing-a-block-explorer/01.jpg
headerImage: false
---

The block explorer is perceived as a public good. But at the same time, it’s one of the most expensive pieces of infrastructure and developer tooling. So who pays for that? Yes, advertising is an option, but who wants to pay for it? You can of course get a lot of ads money if the website has millions of users, but what about the smaller chains? We’re increasingly living in a multi-chain world, so users will likely be fragmented. And of course in 10 years the ‘crypto pie’ will be so big that there will be billions of users and of course you can monetize that through advertising. But what to do in the meantime?

In 2018, Etherscan came up with EaaS, Explorer-as-a-Service, and a handful of chains paid for it: BNB, Fantom, Polygon. Now Etherscan has roughly 20 chain clients, but there are *hundreds of chains.* Not every chain can afford Etherscan’s EaaS, because it is expensive: for what I know, the annual price can go as high as 1.5 million dollars, while there are some lower-end cases priced at 500,000 per year. Still, it’s a lot. Imagine a chain that is bootstrapping their launch, got a few million dollars in funding: they cannot afford an explorer that’s burning a good percentage of their runway.

Until mid-2023, any chain having this dilemma opted for a single solution: an open-source Blockscout explorer to start, and maybe upgrading to a managed Blockscout over time.

Now, the got plenty of options: 3xpl, Dora, SocialScan to name a few, and of course Routescan. We got to position Routescan as the Etherscan explorer you can afford, at a price that grows with you - the starting price is roughly 350\$/month.

More and more big, medium-sized and big chains are choosing Routescan as their explorer. But still, the pricing we offer is not enough, because it’s not the best we can make.

The best is **free**.

But to make it free, we need to find a way to make it sustainable by itself. And ads, as I described above, is not gonna work for the moment, and for the next 2-3 years at least. And also, it really saddens me to think that in the web3 industry, we need to find web2 ways of making revenue. It’s not gonna work, it’ll be… wrong, if you know what I mean.

So we need to find new ways to make revenue. These are the basic requirements for a revenue stream to be eligible for consideration:

- It needs to apply to every chain, big and small
- It needs to be directly or indirectly connected to the chain activity
- It needs to require zero or very marginal integration time for each new chain
- It may start with support for EVM-only chains, but it needs to provide support for any VM in the long term
- It needs to cover the server costs to index the chain and make a decent margin (+50 to +200% on top of the server costs ideally)

I guess the guys at **Mempool explorer** were already thinking of new ways to make revenue since they just announced “*an off-chain service that aims to help users expedite unconfirmed transactions by paying an extra miner fee and service charge*”, per [The Block](https://www.theblock.co/post/307972/mempool-launches-off-chain-accelerator-bitcoin-transactions?utm_source=rss&utm_medium=rss).

I sincerely don’t know how much money they expect to make from this service, but it is certainly more than zero if they implemented the whole service from scratch and made partnership with some mining pools.

And if you look at the explorer today, a few days after the announcement, you can already make some assumptions.

![New ways of monetizing a block explorer image 1](/assets/images/montaigne/new-ways-of-monetizing-a-block-explorer/01.jpg)

Per *SemRush*, they have roughly 120,000 users per day (more than 1.1 million per month), and they are making 43\$/day a few days after the announcement.

![New ways of monetizing a block explorer image 2](/assets/images/montaigne/new-ways-of-monetizing-a-block-explorer/02.jpg)

But they’ve been operating this service for more than a year, according to the stats. And so far they made over 158,000\$ in gross revenue. From that, you need to at least remove processing fees if the user pays with credit/debit card or Apple/Google Pay or similar.

![New ways of monetizing a block explorer image 3](/assets/images/montaigne/new-ways-of-monetizing-a-block-explorer/03.jpg)

It is good money, but I’m pretty sure they can’t index Bitcoin and pay salaries to the team with only 150,000/year, so they also make money in other ways. It’s possible they also sell access to their RPCs and have paid plans for their APIs.

But still, it’s nice seeing that they’re making money with a new, blockchain-native revenue stream. I hope to see other explorer providers test new ways, as we’ll explorer ourselves.
