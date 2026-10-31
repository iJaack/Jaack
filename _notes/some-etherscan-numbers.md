---
title: "Some Etherscan numbers"
layout: note
date: 2024-01-29 09:00
permalink: /some-etherscan-numbers/
tag:
- crypto
- blockchain
author: jaack
description: "I would like to address some issues, data and intuitions made by Otterscan’s Marco Worms in its article on the Etherscan leadership in the block explorer…"
published: true
lang: en
original_url: "https://jaack.montaigne.io/some-etherscan-numbers"
image: /assets/images/montaigne/some-etherscan-numbers/01.png
headerImage: false
---

I would like to address some issues, data and intuitions made by Otterscan’s Marco Worms [in its article on the Etherscan leadership in the block explorer market](https://medium.com/@marcoworms/etherescan-is-awesome-but-is-also-a-critical-point-of-failure-for-ethereum-167b0e995fe0).

I never wanted / had the time to properly sit down and think about everything that we’ve been through at Avascan and then Routescan in these terms, but it now seems a good time to talk about a few aspects that enrich Marco’s point of view with some extra intelligence.

BTW: I’m **loving** what Marco is achieving with *Otterscan*, and I very much would like to meet him and the team as soon as I can.

We’ve been gathering intelligence about Etherscan since late 2021, and we understood how its business evolved over time. I will not talk about anything that is being kept secret by the team. I’m sharing what we found by talking to old and current clients, and to some of their business partners.

We know that Etherscan began its Explorer-as-a-Service explorer in or around 2018, after the market crash. We know that someone between BNB and Fantom began asking for a block explorer service, and that things were not perfect, like every new venture. The biggest problem would be the running costs for the explorer service: BNB, specifically, has really high costs and always had, because of the very high throughput.

As a user or developer, one may not know the costs structure of a block explorer. We divide the costs in these three components, and I’m guessing a variation of this is what makes every block explorer business:

- **Node:** most block explorers run their own nodes, that in our case need to be *archival* and with *debug trace mode* active to be able to collect every piece of the state of the Virtual Machine (EVM in our case) - this is a **medium to high cost** per month
- I**ndexing**: transactions need to be indexed. This is done with several indexer modules, that vary based on the architecture. Indexers are basically servers or serverless functions that process transactions / blocks as soon as they’re executed and found onchain. The more transactions get executed, the higher the cost to index the blockchain - this is a completely variable cost. Low for low throughput, high for high throughput. But once a transaction is indexed, it doesn’t need to ever be re-indexed, unless data are corrupt or incomplete and you need to recover it.
- **Storage**: Once transactions / blocks are indexed, the data in them and every inferred data (machine state with updated account balances, lists, etc.) can be stored - this is a low cost per month, that always increases over time as transaction history increases.

*(Note: this cost structure is for what we call a* ***Full Index Explorer,*** *that’s an explorer that retains all data to make aggregations, lists, and various manipulations to offer charts and other tools. There are some explorer that are* ***Light****, meaning that they get data in real-time from the node. Those explorers cannot have fast aggregations, but can only have a subset of tools, pages and data sets because they don’t store data, nor they index it: they just* ***show it*** *after some parsing.)*

I guess, then, that Etherscan has this kind of cost structure. So for the BNB explorer, they had **a lot** of transactions every month (= high costs for indexing) and a rapidly increasing transaction history (=increasingly high storage costs). Based on what we know about their backend architecture (they’re likely using SQL databases), we can infer that they spent a lot of money for the first few years, and maybe they didn’t expect that. And also maybe they didn’t make a contract to be paid annually, but every month, this we don’t know.

I can’t make calculations about the past, because I don’t have enough data, but I can try to run some numbers to count how much they’re paying now just for BNB.

So, BNB is currently hovering around 55 TPS per day on average, with a transaction history of 5.3 **billion transactions** (!!). That would be around 65,000\$/month for indexing and from 64,000\$/month for storage. This is based on some benchmarks that we made with Etherscan’s pricing model that found that **our prices** could be as much as 70% cheaper than Etherscan’s **costs**.

Yes: we found out that Etherscan charges around **1,000,000\$/**year to an average chain. The price could be as low as 750,000\$ if the chain is vanilla EVM, requests and requires no customizations, doesn’t request an integration with the consensus layer (validator list, details, and staking data), or as high as 1,500,000\$ if some of these are required by the client. But there is one specific client that we think pays much more: BNB Chain.

If we annualize the costs that I calculated before, for 2024 we get:

- Indexing: 65,000\$\*12 = 780,000\$
- Storage: 64,000\*12 = 768,000\$
- Total: 1,548,000\$

So it’s not possible that they get paid \$1,500,000 / year, since they’re likely spending around that just in variable costs. To get to the amount they get paid, in my opinion, by BNB, we need to make a similar calculation for another blockchain that we know, and for which we have benchmark, and then projecting these costs to the ones related to BNB to understand what’s the ratio. I’ll choose Avalanche C-Chain. As you may know, we [recently took over the Snowtrace domain from Etherscan](https://mirror.xyz/0x4E4c1d3D2896890cE5a12ecaB70E311B47237142/Qj91RP4l6KBm6chobPxNXM0tAxlwBwBOo_3YhhwvIeQ), to develop and maintain an increasingly-feature-par block explorer.

Based on the ‘version’ of the Snowtrace explorer maintained by Etherscan (no validators or staking data, no customization, but top blockchain with lots of users), we think Avalanche paid around 1,000,000\$/year, so we’ll use this data.

For 2023, Avalanche had around 4 TPS and 430 million transactions. Annualized and projected to 2024 we would get:

- Indexing: 57,000\$/year
- Storage: 62,000\$/year
- Total: 119,000\$/year

So if Etherscan charges 1M/year, and it pays around 120k/year in server costs, it means that it makes a gross profit of around **880k** before paying employees, or **88%**. Let’s also hypothesize that support, maintenance and new developments could account for, let’s say, 350k/year even (I think that’s a lot, since they also have other clients, but you know, making worst cases). That would make costs run up to 470k, that would make net profits before taxes at **530k / 53%**.

Now, if we bring this roughly 50% profit ratio to the BNB business, I guess that BNB Chain pays upwards of **4 million dollars a year** for its block explorer.

![Some Etherscan numbers image 1](/assets/images/montaigne/some-etherscan-numbers/01.png)

Etherscan provides its explorer as a product (= not paid) for Ethereum, Base and Aptos. And it has deals with zkSync, Optimism, Arbitrum One and Nova, Gnosis, BNB Chain, Polygon, BTTC, Celo, Fantom, Polygon zkEVM, Kroma, Linea, Moonbeam, Moonriver, Scroll, Wemix.

I suppose, based on the version of the explorer, that this is the price paid for each explorer:

- Ethereum: 0
- Base: 0
- Aptos: 0
- zkSync: 1.5M (newer explorer version)
- OP: 1.5M (support for regenesis and other custom features)
- Arbitrum One + Nova: 2.5M (some customizations)
- Gnosis: 1M
- BNB Chain: 4M
- Polygon PoS + zkEVM: 2M
- BTTC: 1M
- Celo: 1M
- Fantom: 1M
- Kroma: 1M
- Linea: 1M
- Moonbeam + Moonriver: 2M
- Scroll: 1M
- Wemix: 1M

This amounts to an annual revenue of about 21.5M/year. And this does not account for advertising, that based on other calculations that we made over time, can account to at least 1M/year only on Ethereum. And APIs are also a very good source of revenue, most likely at least 1M/year. Even with these **very rough** calculations, total revenue sums up to about 25M/year, with a 50% profit minimum.

Hope that gives a good overview of Etherscan business, as much as we could find.
