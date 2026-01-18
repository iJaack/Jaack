---
title: "The future of the blockchain industry will be multi-chain"
layout: post
date: 2022-12-30 12:00
image: https://docs.avax.network/assets/images/subnet-validators-0667a8ef05ae5dc26a545d2f52333208.png
headerImage: true
tag:
- technology
- blockchain
category: blog
author: jaack
description: How does a blockchain scale? What is the difference between bitcoin, ethereum and avalanche and cosmos? A short journey into the future of multi-blockchain networks and the implications for the end user
published: true
lang: en
---

We all know the term blockchain by now, and we know (more or less precisely) what it means: it is the **shared, public and decentralized ledger**, on which value transfers are recorded.
Until a couple of years ago, the term blockchain was unequivocal. A blockchain was a **network**.

Since the conception of Bitcoin by **Satoshi Nakamoto**, in 2008, the blockchain was unequivocally identified as a network, in which miners validate transactions and find blocks. At the beginning there was only **Bitcoin**, but then clones arrived (*forks*): among the most important ones we can remember **Namecoin**, **Litecoin** and the still very famous **Dogecoin**.

There were two key aspects that made a blockchain a network: an application to manage the **node** of the network and a set of **peers**.

The application to manage the node (also called just 'node') contains the methods, functions and data necessary to make a computer able to **talk** with others in the same network.

The set of peers is instead the set of computers that run the node and therefore speak the same **language**, the same *blockchain language*, so to speak.

A blockchain network is therefore conceptually defined as a **set of peers** exchanging data on a **shared ledger** using **special software** (the node) with which they speak the same language.

In more precise terms, it is said that peers of a blockchain network use nodes to **reach consensus on the state of the chain**. Peers, shared ledger and node make a blockchain a network.

For example, on **Ethereum** there are different software that act as nodes, written with different programming languages, but which still speak the same blockchain language. The set of peers is always the same: they are the validators validating the Ethereum network.

To give another example: **Bitcoin** miners cannot talk to **Dogecoin** ones. They don't speak the same blockchain language. It is important to remember these 3 components because they are fundamental to understand how technology has evolved in recent years.
This type of blockchain, the only one known until the explosion in 2017 (when bitcoin reached 20 thousand dollars), is called **Layer 1**. It is called this way because it is the first layer of communication, the basis of the structure: peers, data and the node.

But the technology used for Layer 1, with the structure we have seen so far, presented a big problem: **scalability**.

Scalability can be defined as the **ability of a system to increase its capacity under variable traffic conditions**. A blockchain network, which must process transactions, presents scalability problems if it fails to reach the same numbers as the traditional counterpart, for example **VISA or MasterCard**. To give orders of magnitude, the VISA system manages to process up to **20,000** transactions per second in peak periods, and about **2,000** transactions per second in steady state.

To make a comparison, in 2017 bitcoin processed **7** transactions per second in peak periods, and about 3 in steady state. Between 2016 and 2017 there were several ways in which the crypto community tried to solve the scalability problem. A [Wikipedia page](https://en.wikipedia.org/wiki/Bitcoin_scalability_problem#:~:text=The%20Bitcoin%20scalability%20problem%20refers,limited%20in%20size%20and%20frequency.) was even made about it.

Many of the efforts did not lead to great improvements, on the contrary, they led to **breakups and creation of factions** in the crypto community, mainly the bitcoin one.

Efforts focused on **increasing the capacity of a single blockchain**. Bitcoin Cash, in the summer of 2017, was born precisely for this.

<img class="image" src="https://ignite.com/_nuxt/img/1584f4d.webp" alt="Ignite, the development package for Cosmos blockchains" >

*Ignite, the development package for Cosmos blockchains*

Since 2018, however, a new paradigm has been introduced, which is defined as **Layer 0**. Layer 0 is a type of technological approach that **democratizes** the creation of new blockchains. The hypothesis is that therefore solving the scalability problem of a single blockchain is not so much impossible, as it is not optimal. It is easier to increase the number of blockchains, and therefore solve the problem not with single capacity, but with the parallelization of operations.
**Cosmos** was the first example, released in 2018, followed by **Polkadot** and **Avalanche** in 2020.

<img class="image" src="https://wiki.polkadot.network/assets/images/one-parachain-f8e0673144a718bd67834cdd69894ca2.png" alt="Polkadot parachains (photo: wiki.polkadot.network)" >

*Polkadot parachains (photo: wiki.polkadot.network)*

Each of these three can be considered a network in its own right, because the participants of the network use the same node. But within each of these networks, some subsets of nodes can exchange information on **extensions** of the shared ledger. These extensions take different names and are structured differently based on the platform, but the underlying concept is always the same: making it possible for anyone with basic programming knowledge to create and maintain a shared ledger (a blockchain, a Layer 1) exploiting a larger infrastructure (the Layer 0).

The most important advantage one has when nodes in a network agree also on the state of a series of extensions, and not only of the main ledger, is that they still speak the same language. And therefore it is easier to transfer information between two extensions, compared to between two networks, using **intra-network communication protocols**, which are optimized compared to generic **bridges**.

<img class="image" src="https://docs.avax.network/assets/images/subnet-validators-0667a8ef05ae5dc26a545d2f52333208.png" alt="Avalanche Subnets (photo: avax.network)" >

*Avalanche Subnets (photo: avax.network)*

In Cosmos, extensions are always called **blockchains**: in Polkadot, they are called **parachains**, while in Avalanche they are called **subnets**.

The Layer 0 paradigm has therefore changed the basic relationship for which a blockchain was always a network, and vice versa. Now **a network is in general a set of blockchains**. In the case of bitcoin, the bitcoin network equals the bitcoin blockchain (because it is a Layer 1), but in the case of Avalanche, which is instead a Layer 0, a network is equal to a set of subnets.

In this new paradigm, a problem arises: if one of these Layer 0 platforms dominated the industry, what would happen? For example, if all currently known blockchains were Polkadot parachains. This would also be a problem, because everyone would use the same node to speak. They would all speak the same language. This in computer terms is defined as **single point of failure**, because it would become the weak link. If everyone speaks the same language, and that language happens to be banned in some contexts, no one can speak under any condition: for example, if in this scenario Polkadot were blocked (in any way) in China or Russia, no one could access their funds and transfer them on the network anymore.

And this is why the future of the blockchain industry will be full of networks, which include one or more blockchains, and which speak different languages: to ensure the **resilience** of the entire industry, equal to (if not more than) the current traditional financial system.
