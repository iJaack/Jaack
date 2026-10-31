---
title: "On a sustainable model for block explorers"
layout: post
date: 2024-03-15 09:00
permalink: /on-a-sustainable-model-for-block-explorers/
tag:
- crypto
- blockchain
category: blog
author: jaack
description: "To this day on year ago, we had no idea how to compete with Etherscan."
published: true
lang: en
original_url: "https://jaack.montaigne.io/on-a-sustainable-model-for-block-explorers"
---

To this day on year ago, we had no idea how to compete with Etherscan. Back then, we already knew that they were charging somewhere between one and two million dollars per year to run the explorer, and we made some simple predictions that would help us understand why they were charging so much money.

Turns out, they were because they didn’t care to talk about the details - or something similar.

We quickly learned that Etherscan was selling its explorer as a service as every chain that they indexed would have the maximum throughput in every given moment. Per the limits of the current state of vanilla EVM implementations, the execution layer can write not more than 40-45 transactions per second (TPS) in a widely decentralized network like Ethereum. The number can go higher to 55-60 TPS for less decentralized networks like BNB Chain, but that’s it. We had a number.

I think one of the real innovations we made, apart from our natively multichain indexing engine, it’s our **pay-as-you-go model**. We noticed that most chains were paying Etherscan for *much more than they needed to***.** At regimen, most chains average between 0.5 and 4 TPS on any given moment, and that was the key to reduce the price!

We would have a fixed fee, that would pay the team, and a *variable fee*, that instead is based on actual throughput.

You only pay what you do. If your chain is successful and you have a lot of transactions, then you pay more, but if there’s a bear market and TPS count is low, you will pay less.

This was critical in finalizing the first deal, and we quickly iterated, as we onboarded new clients.

After one year of discussing pricing details with potential customers and around 6 months from launching the Routescan platform, we now have a much more standardized pricing that can be discounted by some 50% if you check some boxes, like lengthening the contract period, paying more in advance or running the RPC for us.

But we still haven’t found the best balance. We feel we can go even lower than this in the future, and lowering even more the barrier to get a high-quality developer-focused block explorer.
