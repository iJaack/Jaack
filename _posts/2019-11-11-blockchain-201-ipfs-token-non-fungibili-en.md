---
title: "Blockchain 201: IPFS and non-fungible tokens"
layout: post
date: 2019-11-11 17:00
image: /assets/images/projects/blockchain-201/Blockchain-201.jpg
headerImage: true
tag:
- blockchain
category: blog
tags: [research]
author: jaack
description: An in-depth look at two blockchain use cases that I particularly care about
published: true
lang: en
---
For an event at [**Ala/34**](https://ala34.com), a co-working space in Rome, I was asked to prepare
a talk on blockchain use cases, as a natural evolution of a talk that
Gian Luca Comandini would give on the same evening about the birth of bitcoin and
blockchain.

So I started preparing content on **IPFS** and cryptokitties. I
already talked about IPFS on the blog [here](https://jaack.me/filecoin-update-q2-q3-2019/),
while I only talked about cryptokitties in my masterclasses for DoubleBit.

Through the button below, you can download the slides of my speech,
while further down you can read the full transcript of my speech
during [Code4Future](https://www.code4future.it), an event organized by HTML.it
at the Talent Garden in Roma Ostiense, the one just opened, last November 9th.

<img class="image" src="{{base}}/assets/images/Blockchain-201_IPFS-e-token-non-fungibili_2019-10-10_cover.png" />
<a class="link" href="{{base}}/assets/docs/Blockchain-201_IPFS-e-token-non-fungibili_2019-10-10.pdf">
Download the slides of my speech</a>

## IPFS: Interplanetary File System

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-2.jpg" />

*‘You’re all set! Now you have a wallet that only you control, directly without middlemen or bankers.’*

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-3.jpg" />

This app is actually for testing, because the Telegram blockchain doesn't exist yet today, but it's a good way to see how a wallet that is owned only by those who possess private keys works simply. There is my address, to which people could send me GRAMs (Telegram tokens), but the most important thing to remember about a wallet is definitely the private key.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-4.jpg" />

This is a private key that I hope has no funds associated. It is a bit like a password, the private key is a string of a variable number (based on the reference blockchain) of characters. There are blockchains that have private keys of over 80-90 characters - for example, the seed of an IOTA wallet.
There are more possible combinations for such a password than atoms in the universe. 2^91 combinations, a huge number. It is difficult for a normal computer, and even for a supercomputer, to guess such a password by trial and error.

I am very happy if no one knows this project I will talk about, because otherwise my work would make no sense.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-2.jpg" />

IPFS stands for **‘Interplanetary File System’**: it is an interplanetary system for data management. And this has a lot to do with blockchain.
When bitcoin was born, it had the aim of giving financial freedom to those who used the system. To free the people from the constraint of banks.

IPFS is a project, carried out by a group of scientists/developers from the Massachusetts Institute of Technology (MIT) in Boston, who want to take the concept of blockchain further. For them, the blockchain system should not only be linked to money transactions, but should be the infrastructure of the internet. That is, the internet as we know it should no longer be a system we access and of which someone else owns the infrastructure.

Today, when we search for Facebook on Google, for example, we are:

- Making a request to Google to search for Facebook
- Making a request to Facebook to show us what our friends are doing.

Not to mention all the intermediate steps involved in transferring this information. All in a thousandth fraction of a second. Our most delicate information, such as our IP address, our MAC address (the unique identifier of any device that can be connected to the network). All the companies we pass through can exploit this information to understand how we behave online, and sell this information to advertisers to tailor advertising to our online behaviors which, almost always, are identical to those in the real world.

IPFS assumes that nowadays there are more devices connected to the network than people, and the number is destined only to rise. In Italy, for example, there are more than 2 phones per person. A long-term vision is: ‘imagine if there was no need for the internet, to access the internet.’ Something achievable perhaps in 50 years, if not more.
What they are doing today instead is building a communication protocol that replaces http(s). Https is the data transfer protocol on the internet, a layer 4 protocol, in the network protocol stack (there are 7 in total).

IPFS wants to change this protocol, from https:// to IPFS://. This changes a lot, because with IPFS when we ask for information online, we are no longer asking a set of servers in Iceland or who knows where owned by big corporations, but we are asking those next to us, in the spirit of peer to peer systems.

Let's pretend that I want to recover information written on a piece of paper, a person who before me put it on the internet (on IPFS), is tearing it up and distributing a portion of the sheet to nearby people (peers). Once done, they take a strip, header, and write on it how the pieces can be recovered. This is a concept underlying torrents, like asking how things were downloaded using Emule. In this way I take the website recovering it from people close to me, even if I don't know them.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-5.jpg" />

Today the web is inefficient and expensive because the internet costs, it cannot preserve human history, it centralizes opportunities and relies too much on GAFA infrastructures (Google, Amazon, Facebook, Microsoft).

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-6.jpg" />

IPFS solves it in these ways:

- File Lookup
- Selective storage
- Duplicate removal
- Cryptographic hash (like in a bitcoin transaction: the file is secure)
- Decentralized naming system.

Today when we type google.com, we are asking a server to tell us what IP address google.com has, IPFS also invented it (there is a system that transforms words into numbers). Through the following steps: file, Hash, IP Address.
I hope it becomes without internet, but I don't know if there will be so little pressure and resistance; in any case, this association of mine of IPFS with a world without internet but still connected, is due to the fact that a few years ago protests in Hong Kong arose very heatedly because the Chinese government could not stop the flow of information exchanged by people (despite having shut down the internet).

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-7.jpg" />

They used an app called **FileChat**: peer to peer instant messaging. This app used all possible sensors on a phone (Wi-Fi, Bluetooth, Infrared), to send files from one person to another as close as possible and the other person did the same thing... the information therefore, does not pass through a server, but from one part to another.

Today information passes through a thousand different people, and in the meantime my data is no longer secure, in this way instead in reality no one has it because the people through whom my data passed do not know each other and the data is encrypted.
Each person is not a first and last name, but a pseudonym, a nickname.
The information is transmitted through all sensors, and the first one who has internet can transfer it to another place too.

The **Filecoin** blockchain (project born from IPFS) does not work exactly like Bitcoin, it has a mixed system between a Proof-of-State and a Proof-of-Work, they have a series of algorithms that allow managing the workload and not making it cost too much. For now they are all speculations based on their papers: when the blockchain will be active (perhaps around January-February 2020) we will know if it will work. I wanted to show you this system to make you better understand some concepts.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-8.jpg" />

I came here to make you install something on your pc: you can go on IPFS now. Typing complete IPFS addresses is absurd because the strings are very long, but passing addresses can be done.

These slides **are on blockchain**, at the end there is a link and you can access them only if you have Chrome with an IPFS extension: searching for **IPFS Companion** and installing the extension, you must then configure the extension with an internal IPFS node.

DNS is also decentralized: it is a system that asks more people who are close what their list is. It is a bit like when a peer of a bitcoin blockchain has to ask others what the last block reached is. Everyone has their list which however must always be updated.
The concept of blockchain can work even without internet, we must always remember this.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-18.jpg" />

**Wikipedia on IPFS** is a bit different from what we see without accessing IPFS. Wikipedia was one of the first projects to be 'ported' to IPFS with a project called Distributed Wikipedia.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-9.jpg" />

## Non-fungible tokens: Collectibles

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-10.jpg" />

Bitcoin purists do not like this topic, because for them nothing exists other than the bitcoin script language to create assets.
However, I am a person of broader views, and when I happen to give this type of talk
I try to show everything that blockchain can offer, even outside the box.

One of the largest blockchains, **Ethereum**, aims to create the global operating system and since 2015 has developed a series of standards to enable applications on blockchain: instead of having code with normal functions, they have the Smart Contract. The latter is code that self-executes by verifying conditions that occur on the web.
A set of Smart Contracts can create a DApp (decentralized application).

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-11.jpg" />

A decentralized application is very often based on tokens, which can be coins (exchange goods): a token is a **digital reference** of a datum in a system. A non-fungible token, on the other hand, is a **unique token distinct** from others based on characteristics that vary.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-12.jpg" />

A normal token is said to be fungible; a bitcoin is always such, so I can exchange them independently. It is only a difference of quantity and not quality of the token. A non-fungible token instead depends on qualities, although the primary characteristics always remain the same. It is therefore the values that change.

Tokens are needed for... kitties!

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-15.jpg" />

**Dapper Labs** is a company that decided to make Ethereum more functional through experiments, creating the Dapp for exchanging collectible kitties.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-13.jpg" />

Every time one enters a decentralized application, they will be signing their access confirming their identity on the CryptoKitties site as if it were a digital signature (one must also have an add-on like Metamask to manage the list of Ethereum addresses and manage one's money as if it were a wallet).

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-19.jpg" />

I have 13 kitties, two years ago when I gave the first talk on this topic they laughed in my face, when I gave the third talk saying I sold one for $340 everyone remained silent. They understood that there is a market behind it.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-14.jpg" />

The **phenotype and genotype** of each kitty is written in the blockchain, we know that all kitties have certain characteristics (eyes, ears, color...), but these vary, and must do so exactly at the moment a new kitty is created. Even the names are created randomly, I didn't give them, they are created by the blockchain: they are non-fungible tokens.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-16.jpg" />

I bought the first kitty for about $10, then I made them mate and so on... These are unique coins, it is value that can be exchanged within the application but also outside thanks to my wallet.

Imagine doing this not with kitties but with: houses, pcs... I can move them by moving only their digital identity, the concept changes.
Today when we go on Subito.it we make manual exchanges.
There are kitties that are special, despite them all being unique.

A realistic example of mating kitties creating a new one is the registry office.
Dapper Labs has also done other experiments, like a wizard duel game.
Each non-fungible token is not just one because characteristics are created; there is the Total Supply which must be defined a priori as well as the release criteria of new tokens. There is a function that allows checking and managing the balance, the amount of tokens on each address, and then there are various functions to manage the transfer to/from a single address.

Making kitties mate costs, but very little, commissions are always very low.
Inheritance is something that is not specified, unless it is a kitty born from two that have been mated.
Tokens must respect a standard called **ERC-721**, which takes inheritance from standards 20, 23, 165, developed by Ethereum since 2015.

If you want a non-fungible token that does nothing, but is still a token, it can be done.
I made one in 10 minutes called **JaackCoin**, on the Waves blockchain: by buying them, you have my time. If everyone had a token, our value would be data determined by market laws.

We have the possibility to create a market from scratch: it is a very big expression of financial freedom. Not only can we use our money without accounting to someone else, but we can also create our own market.

{% include changes.html %}

## Useful resources

### IPFS
+ [Build a Decentralized Chat App with Knockout and IPFS](https://medium.com/textileio/build-a-decentralized-chat-app-with-knockout-and-ipfs-fccf11e8ce7b)
+ [How to Host Your Dapp With IPFS+ENS and Access It Via EthDNS](https://medium.com/the-ethereum-name-service/how-to-host-your-dapp-with-ipfs-ens-and-access-it-via-ethdns-c96046059d87)
+ [IPFS Companion for Firefox](https://addons.mozilla.org/it/firefox/addon/ipfs-companion/)
### Tokens
+ [Cryptokitties Contract on Etherscan](https://etherscan.io/address/0x06012c8cf97bead5deae237070f9587f8e7a266d#code)
+ [Cryptokitties contract code and software design](https://etherscan.io/viewsvg?t=1&a=0x06012c8cf97bead5deae237070f9587f8e7a266d)

## [IPFS talk slides](https://ipfs.io/ipfs/Qmf1Mo25GAMurJgfunEYzKthwsypkTv9riP5yt5LxChTxK)
