---
title: "Minimizing fees: an argument for subnets"
layout: post
date: 2023-02-13 12:00
image: https://docs.avax.network/assets/images/subnet-validators-0667a8ef05ae5dc26a545d2f52333208.png
headerImage: true
tag:
- defi
- crypto
category: blog
author: jaack
description: And app-chains in general
published: true
---

I think [Vector Finance](https://vectorfinance.io) (and many other similar apps) should be on their own subnet.

A Dapp is generally a set of smart contract (i.e. it mostly never is a SINGLE smart contract), and smart contracts can interact with each other to perform compounded operations.

An example of compounded operations is Vaults and Strategies Dapps, like Vector Finance , but also [SteakHut](https://steakhut.finance), [YieldYak](https://yieldyak.com) and others (on Avalanche).

These Dapps generally take your deposits and do a lot of stuff with them, like depositing them to another pool, swapping and/or claiming fees and rewards. And sometimes they do it in a single transactions, to reduce fee overhead.

But even if they batch operations in a single transaction, fees will often be high - meaning *higher than 0.10$/tx*, that is acceptable even when making multiple transactions per hour.

Some examples:

<img class="image" src="{{base}}/assets/images/minimizing-fees-1.png" alt="Minimizing fees from approves" >

- An approve is one of the simplest, so it just takes 0.03$ of fees in normal conditions (could be close to 0.10$ in rare gas price spikes);

<img class="image" src="{{base}}/assets/images/minimizing-fees-2.png" alt="Minimizing fees from swaps" >

- A swap on a DEX is a bit more complex, and it charges you 0.08 - 0.12, depending on optimizations and type of DEX - a bit higher than my tolerance, but still acceptable

<img class="image" src="{{base}}/assets/images/minimizing-fees-3.png" alt="Minimizing fees from vault deposits" >

- A deposit in a Vault, instead (like stated above) is really higher, **close to 1$** in fees. This is not an Avalanche issue, because gas price is really low. It's just that there are a lot of operations to be computed for this type of transaction, so there could be a lot of costs.

To reduce fees to (almost) 0 for (almost) every type of transaction, these types of Dapps could move to their own subnet in the near future.

Subnets can leverage the **Avalanche Warp Messaging Protocol** to make users interact from C-Chain, but execute operations on their own isolated, cheap and traffic-free environment.

Subnets are not only a solution to reduce traffic, but to aggressively minimize fees.

This'll be a win in UX and a step forward to mainstream adoption.

[Dexalot](https://dexalot.com) is one that will show us a portion of what I'm talking, after launching on February 1st. Let's see how it pans out.
