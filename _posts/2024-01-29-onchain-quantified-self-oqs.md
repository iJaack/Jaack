---
title: "Onchain Quantified Self (OQS)"
layout: post
date: 2024-01-29 09:00
permalink: /onchain-quantified-self-oqs/
tag:
- crypto
- life
category: blog
author: jaack
description: "I’m a bit of a quantified self man."
published: true
lang: en
original_url: "https://jaack.montaigne.io/onchain-quantified-self-oqs"
image: /assets/images/montaigne/onchain-quantified-self-oqs/01.png
headerImage: false
---

I’m a bit of a quantified self man. I track most of what I do, be it watched TV shows, [water intake](https://jaack.me/2023-numbers-thoughts/) or workouts.

![Onchain Quantified Self (OQS) image 1](/assets/images/montaigne/onchain-quantified-self-oqs/01.png)

I’m not super-obsessed, but I always love to expand what I can track. And onward that everything’s coming onchain, I bet more and more people will love to have an onchain version of themselves.

This can happen in different ways:

- Via Soulbound Tokens (SBTs), that represent a unique identity onchain;
- Via Smart Accounts, to execute gasless transactions to, for example, make attestations about some events like runs, rides, or whatever else;
- Via ZK proofs, to prove you can be part of a group by proving you made something without revealing what you actually did.

I imagine whole web2 platforms can be recreated in pieces onchain. Like Strava:

- You access to *web3strava* connecting your account, and your SBT gets validated onchain and linked to the platform’s *identityRegistry* contract onchain (much like Farcaster, but that doesn’t use SBTs, only wallet address)
- You track the social graph on Farcaster or Lens to suggest new follows
- Every time you complete a run/ride/workout, an attestation is published with no gas needed, and in real-time.
- Attributes from each attestation cumulate to track overall stats
- The Identity SBT could own / be linked to other SBTs, each tracking a macro-topic, like *FitnessSBT*, *EntertainmentSBT*, *TravelSBT*, etc.
- Attestation data could update attributes on each specific SBT
- ZK proofs can attest achievements without revealing personal data, so users can unlock rewards in total privacy

This is basically Quantified Self, but Onchain.

\#crypto \#web3
