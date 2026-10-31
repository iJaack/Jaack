---
title: "Making another sense of Trust Experience (TX)"
layout: post
date: 2024-03-11 09:00
permalink: /making-another-sense-of-trust-experience-tx/
tag:
- crypto
category: blog
author: jaack
description: "Blockchain networks are designed, and supposed to be, trustless."
published: true
lang: en
original_url: "https://jaack.montaigne.io/making-another-sense-of-trust-experience-tx"
image: /assets/images/montaigne/making-another-sense-of-trust-experience-tx/01.png
headerImage: false
---

Blockchain networks are designed, and supposed to be, trustless. This means that any third-party can independently verify and execute the proofs and calculations executed by other parties, without having to trust them in the first place. We can also see it as if we can *trust everyone in the network* because no one knows one another, and every one just work for themselves.

The entire network works as a very big justice court in which all the judges work together to take independent decisions that have very little ambiguity or not at all. Citing [Josh Stark](https://stark.mirror.xyz/rkLEVz9p4r3ouusD-WCkWP_iVZYkZ0K7TFkzeRfiXCU), it’s the strongest type of hardness that we know at this point.

*Hardness* is the actual application of rules. Blockchain networks, and even more smart contracts-based ones, auto-enforce rules written in snippets of code, and there’s no way to proactively fix some error, except for ‘opening’ a new network (a hard fork). When a new application is released on a blockhain network, the smart contracts it’s composed of act as independent police for its users.

Just like police in real life, if some rules are written poorly and someone takes advantage of the way they’re written, they can steal goods (read: money) and get away with it (mostly). Many of these thefts happened over the last few years, [one of those merely a few days ago](https://rekt.news/woo-rekt/).

![If the rules in a smart contract are written poorly, a thief can exploit them and likely get away with it](/assets/images/montaigne/making-another-sense-of-trust-experience-tx/01.png)

*If the rules in a smart contract are written poorly, a thief can exploit them and likely get away with it*

But unlike police in real life, there’s really no way to fix what has gone wrong and just eliminate the past. Sure, the contract deployer can release a new contract and link the new one on their website, but the history can’t be erased, and in many cases the money can’t be recovered easily.

So, blockchain networks are trustless systems, and when smart contracts are involved, rules are auto-enforced. But contracts are written by people, and people have biases and make mistakes, just like when they [train AI systems](https://theconversation.com/eliminating-bias-in-ai-may-be-impossible-a-computer-scientist-explains-how-to-tame-it-instead-208611).

So how can we make sure to remove, as much as possible, any trust assumption in systems that are supposed to be completely trustless?

Turns out, we can’t.

We can’t for many reasons:

1.  **Contracts will always be developed by humans**, and even if we delegate smart contract development to AI completely, but even then some AI, or all of them, can have biases prompted by their creators. And even if it’s AGI, we’re not sure it can act in our best interest (it could think that trustless systems are not good for whatever reason we can’t yet comprehend)
2.  **Trustlesness, lilke security, is not a definitive statement, but a spectrum**. And like security, it has compromises. The less trust you need to put into the system, the more trust you need to put in yourself (see custodial wallets, for example, and recovery accounts, that have less trustlessness because you need to trust that the accounts you allow the recovery of your account won’t collude against you)
3.  **Chicken and egg problem for the ‘veil of abstraction’ thesis**: If we abstract the ‘blockchain’ away from the users, it will most likely lead to more centralized (thus trusted) intermediate systems, but if we don’t do that, it will most likelty lead to crypto not reaching mainstream ever, or only when the global population is versed enough in computing (still many decades, I suppose)

These are just three reasons that come to mind after a few minutes of thinking it through, but there could be (are for sure!) so many others.

What we can do is making sense of what trust really is at all the different levels. I called it Level of Trust (LoT), but Trust Experience (TX) sounds way better and it really gives a better idea of what that’s really about. I think TX encapsulates LoT, but they’re not exactly the same thing.

And this post is named ‘Making **more** sense of Trust Experience (TX)’ to *expand* on the ideas described by Josh Stark in its post that outlines what the Trust Experience in the first place.

Quoting:

> TX is the set of experiences that shape and inform our expectations about how a blockchain (or other system) will behave in the future. It is the sum of all external inputs which leads us to believe that it will function in a certain way in the future - to trust it, or distrust it.
>
> If User Experience (UX) is about how a person interacts with and experiences a technology, Trust Experience (TX) is about how a person interacts with and experiences *forming expectations about the future behaviour* of that technology.

While Josh seems to only apply TX to L1s, I think TX is way broader: it can be applied to all kinds of object on the blockchain, whether it be a token, NFT or account.

I described some of these ideas back in 2022 when talking about Avalanche subnets during a workshop at the first Avalanche Summit.

![A very first draft of a schema to define what the types of addresses were and how they ‘worked’ with one another - the first step in understanding how much trust to put in different types of addresses and why](/assets/images/montaigne/making-another-sense-of-trust-experience-tx/02.jpg)

*A very first draft of a schema to define what the types of addresses were and how they ‘worked’ with one another - the first step in understanding how much trust to put in different types of addresses and why*

Describing the Trust Level applied to tokens:

> \[…\] a Level of Trust (or Trust Level) represents the number of software and/or entities involved in the life cycle of a token. This involvement can influence the trust, of course, but it can also influence its name (both symbol and contract name), price and liquidity on the market. Tokens with the same name but different Trust Levels are actually different tokens. The Trust Level we imagined ranks token from 0 to *n*, where *n* is a finite number that we haven’t yet discovered. The highest level of trust is 0 (because you need to have 0 or little trust), while the lowest is *n.*

For example, a native token on a blockchain network has the lower (base) Level of Trust, and we can easily say that it’s Trust Experience (TX) is at the highest. LoT and TX and inversely correlated: the lowest the LoT, the highest the TX. We can also say that TX is the result of ‘abstracting away LoT’. Today, we assume that if we have the highest LoT, meaning that an object or system is completely centralized, we will have the best User Experience (UX), but we’ll also have a very minimal Trust Experience (TX), because we’re delegating all our trust to a third-party.

The goal is to find a way to inversely align LoT with TX, and to directly align TX with UX, so that for a low Level of Trust, there’s a high Trust Experience and a high User Experience, meaning:

> A user needs to have the lowest trust assumptions but also have a user experience as if the trustless system is a trusted one.

I believe there are two steps in ensuring this takes place: **building a trust score system** first, and then **remove or heavily reduce the objects / entities / systems with the highest LoT**, so that the remaining ones have lowest or sufficiently low LoT to make for a high TX. When working on this, the UX will improve greatly as a natural consequence.

I have some ideas about the trust score system, a sort of L2Beat meets Coinmarketcap, but it’s still a long way from making some sense. But I believe this is the way to go forward. As soon as I’ll do more research, I’ll post more about it.
