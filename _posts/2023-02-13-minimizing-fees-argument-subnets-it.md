---
title: "Minimizzare le fee: un argomento a favore delle subnet"
layout: post
date: 2023-02-13 12:00
image: https://docs.avax.network/assets/images/subnet-validators-0667a8ef05ae5dc26a545d2f52333208.png
headerImage: true
tag:
- defi
- crypto
category: blog
author: jaack
description: E le app-chain in generale
published: true
lang: it
---

Penso che [Vector Finance](https://vectorfinance.io) (e molte altre app simili) dovrebbero essere sulla loro subnet.

Una Dapp è generalmente un insieme di smart contract (ovvero quasi mai è un SINGOLO smart contract), e gli smart contract possono interagire tra loro per eseguire operazioni composte.

Un esempio di operazioni composte sono le Dapps Vaults e Strategies, come Vector Finance, ma anche [SteakHut](https://steakhut.finance), [YieldYak](https://yieldyak.com) e altri (su Avalanche).

Queste Dapps generalmente prendono i tuoi depositi e fanno molte cose con essi, come depositarli in un'altra pool, scambiare e/o richiedere fee e ricompense. E a volte lo fanno in una singola transazione, per ridurre il costo delle fee.

Ma anche se raggruppano le operazioni in una singola transazione, le fee saranno spesso alte - ovvero *più alte di 0,10$/tx*, che è accettabile anche quando si fanno più transazioni all'ora.

Alcuni esempi:

<img class="image" src="{{base}}/assets/images/minimizing-fees-1.png" alt="Minimizzare le fee dalle approvazioni" >

- Un'approvazione è una delle più semplici, quindi prende solo 0,03$ di fee in condizioni normali (potrebbe essere vicino a 0,10$ in rari picchi di prezzo del gas);

<img class="image" src="{{base}}/assets/images/minimizing-fees-2.png" alt="Minimizzare le fee dagli swap" >

- Uno swap su un DEX è un po' più complesso, e ti addebita 0,08 - 0,12, a seconda delle ottimizzazioni e del tipo di DEX - un po' più alto della mia tolleranza, ma comunque accettabile

<img class="image" src="{{base}}/assets/images/minimizing-fees-3.png" alt="Minimizzare le fee dai depositi nei vault" >

- Un deposito in un Vault, invece (come indicato sopra) è davvero più alto, **vicino a 1$** in fee. Questo non è un problema di Avalanche, perché il prezzo del gas è davvero basso. È solo che ci sono molte operazioni da calcolare per questo tipo di transazione, quindi potrebbero esserci molti costi.

Per ridurre le fee a (quasi) 0 per (quasi) ogni tipo di transazione, questi tipi di Dapps potrebbero spostarsi sulla loro subnet nel prossimo futuro.

Le subnet possono sfruttare il **protocollo di messaggistica Avalanche Warp** per far interagire gli utenti dalla C-Chain, ma eseguire operazioni nel proprio ambiente isolato, economico e privo di traffico.

Le subnet non sono solo una soluzione per ridurre il traffico, ma per minimizzare aggressivamente le fee.

Questa sarà una vittoria nella UX e un passo avanti verso l'adozione di massa.

[Dexalot](https://dexalot.com) è uno che ci mostrerà una parte di ciò di cui sto parlando, dopo il lancio il 1° febbraio. Vediamo come va a finire.
