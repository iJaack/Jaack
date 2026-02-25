---
title: "Il futuro dell’industria blockchain sarà multi-rete"
layout: post
date: 2022-12-30 12:00
image: https://docs.avax.network/assets/images/subnet-validators-0667a8ef05ae5dc26a545d2f52333208.png
headerImage: true
tag:
- technology
- blockchain
category: blog
author: jaack
description: Come scala una blockchain? Qual'è la differenza tra bitcoin, ethereum e avalanche e cosmos? Un breve viaggio nel futuro delle reti multi-blockchain e delle implicazioni per l’utente finale
published: false
lang: it
---

Tutti ormai conosciamo il termine blockchain, e sappiamo (in maniera più o meno precisa) cosa significa: è il **registro condiviso, pubblico e decentralizzato**, su cui vengono registrati trasferimenti di valore.
Fino a un paio di anni fa, il termine blockchain era inequivocabile. Una blockchain era una **rete**.

Dal concepimento di Bitcoin da parte di **Satoshi Nakamoto**, nel 2008, la blockchain era inequivocabilmente identificata come una rete, in cui i miner validano le transazioni e trovano i blocchi. All’inizio c’era solo **Bitcoin**, ma poi arrivarono dei cloni (i *fork*): tra i più importanti si possono ricordare **Namecoin**, **Litecoin** e l’ancora molto famosa **Dogecoin**.

C’erano due aspetti cardine che rendevano una blockchain una rete: un’applicazione per gestire il **nodo** della rete e un insieme di **peer**.

L’applicazione per gestire il nodo (chiamata anche solo ‘nodo') contiene i metodi, le funzioni e i dati necessari a rendere un computer in grado di **parlare** con gli altri nella stessa rete.

L’insieme di peer è invece l’insieme di computer che fa girare il nodo e che quindi parla lo stesso **linguaggio**, lo stesso *linguaggio blockchain*, per così dire.

Una rete blockchain quindi è concettualmente definita come un **insieme di peer** che si scambia dati su un **registro condiviso** usando uno **speciale software** (il nodo) con cui parlano lo stesso linguaggio.

In termini più precisi, si dice che i peer di una rete blockchain usano i nodi per **andare a consenso sullo stato della catena**. Peers, registro condiviso e nodo rendono una blockchain una rete.

Per esempio, su **Ethereum** ci sono diversi software che fanno da nodo, scritti con diversi linguaggi di programmazione, ma che comunque parlano lo stesso linguaggio blockchain. L’insieme di peer è sempre lo stesso: sono i validatori che validano la rete Ethereum.

Per fare un altro esempio: i miner **Bitcoin** non possono parlare con quelli **Dogecoin**. Non parlano lo stesso linguaggio blockchain. È importante ricordare questi 3 componenti perché sono fondamentali per capire come invece è evoluta la tecnologia negli ultimi anni.
Questo tipo di blockchain, l’unico conosciuto fino all’esplosione nel 2017 (quando bitcoin ha raggiunto i 20 mila dollari), viene chiamato **Layer 1**. Si chiama così perché è il primo strato di comunicazione, la base della struttura: i peer, i dati e il nodo.

Ma la tecnologia usata per i Layer 1, con la struttura che abbiamo visto finora, presentava un grande problema: la **scalabilità**.

La scalabilità può essere definita come l’**abilità di un sistema di aumentare la propria capacità in condizioni di traffico variabile**. Una rete blockchain, che deve processare transazioni, presenta problematiche di scalabilità se non riesce a raggiungere gli stessi numeri della controparte tradizionale, per esempio **VISA o MasterCard**. Per dare degli ordini di grandezza, il sistema VISA riesce a processare fino a **20.000** transazioni al secondo in periodo di picco, e circa **2.000** transazioni al secondo a regime.

Per fare un confronto, nel 2017 bitcoin ha processato **7** transazioni al secondo in periodi di picco, e circa 3 a regime. Tra il 2016 e il 2017 ci sono stati diversi modi in cui la comunità crypto ha provato a risolvere il problema della scalabilità. Ne è stata fatta perfino una [pagina su Wikipedia](https://en.wikipedia.org/wiki/Bitcoin_scalability_problem#:~:text=The%20Bitcoin%20scalability%20problem%20refers,limited%20in%20size%20and%20frequency.).

Molti degli sforzi non hanno portato a grandi miglioramenti, anzi, hanno portato a **rotture e creazione di fazioni** nella comunità crypto, principalmente quella bitcoin.

Gli sforzi si concentravano nell’**aumentare la capacità di una singola blockchain**. Bitcoin Cash, nell’estate del 2017, è nato proprio per questo.

<img class="image" src="https://ignite.com/_nuxt/img/1584f4d.webp" alt="Ignite, il pacchetto di sviluppo per blockchain di Cosmos" >

*Ignite, il pacchetto di sviluppo per blockchain di Cosmos*

Dal 2018, invece, un nuovo paradigma è stato introdotto, che viene definito come **Layer 0**. Il Layer 0 è un tipo di approccio tecnologico che **democratizza** la creazione di nuove blockchain. L’ipotesi è che quindi risolvere il problema della scalabilità di un singola blockchain sia non tanto impossibile, quanto non ottimale. È più facile aumentare il numero di blockchain, e quindi risolvere il problema non con la capacità singola, ma con la parallelizzazione delle operazioni.
**Cosmos** è stato il primo esempio, rilasciato nel 2018, seguito da **Polkadot** e **Avalanche** nel 2020.

<img class="image" src="https://wiki.polkadot.network/assets/images/one-parachain-f8e0673144a718bd67834cdd69894ca2.png" alt="Le parachain di Polkadot (foto: wiki.polkadot.network)" >

*Le parachain di Polkadot (foto: wiki.polkadot.network)*

Ognuna di queste tre può essere considerata una rete a sé stante, perché i partecipanti della rete usano lo stesso nodo. Ma all’interno di ognuna di queste reti, alcuni sottoinsiemi di nodi possono scambiarsi informazioni su delle **estensioni** del registro condiviso. Queste estensioni prendono nomi diversi e sono strutturate in modo diverso in base alla piattaforma, ma il concetto di fondo è sempre lo stesso: rendere possibile a chiunque abbia una basilare conoscenza di programmazione la creazione e il mantenimento di un registro condiviso (una blockchain, un Layer 1) sfruttando un’infrastruttura più grande (il Layer 0).

Il vantaggio più importante che si ha quando dei nodi in una rete si mettono d’accordo anche sullo stato di una serie di estensioni, e non solo di del registro principale, è che parlano comunque lo stesso linguaggio. E quindi è più facile trasferire informazioni tra due estensioni, rispetto che tra due reti, usando dei **protocolli di comunicazione intra-rete**, che sono ottimizzati rispetto ai generici **bridge**.

<img class="image" src="https://docs.avax.network/assets/images/subnet-validators-0667a8ef05ae5dc26a545d2f52333208.png" alt="Le subnet di Avalanche (foto: avax.network)" >

*Le subnet di Avalanche (foto: avax.network)*

In Cosmos, le estensioni si chiamano sempre **blockchain**: in Polkadot, si chiamano **parachain**, mentre in Avalanche si chiamano **subnet**.

Il paradigma Layer 0 ha quindi cambiato la relazione di base per cui una blockchain era sempre una rete, e viceversa. Ora **una rete è in generale un insieme di blockchain**. Nel caso di bitcoin, la rete bitcoin è uguale alla blockchain bitcoin (perché è un Layer 1), ma nel caso di Avalanche, che invece è un Layer 0, una rete è uguale a un insieme di subnet.

In questo nuovo paradigma, si pone un problema: se una di queste piattaforme Layer 0 dominasse l’industria, cosa succederebbe? Per esempio, se tutte le blockchain oggi conosciute fossero delle parachain di Polkadot. Anche questo sarebbe un problema, perché tutti userebbero lo stesso nodo per parlare. Parlerebbero tutti lo stesso linguaggio. Questo in termini informatici si definisce **single point of failure**, perché diventerebbe l’anello debole. Se tutti parlano uno stesso linguaggio, e quel linguaggio viene vietato in alcuni contesti, nessuno può parlare in nessuna condizione: ad esempio, se in questo scenario Polkadot venisse bloccato (in qualsiasi modo) in Cina o in Russia, nessuno potrebbe più accedere ai propri fondi e trasferirli in rete.

Ed è per questo che il futuro dell’industria blockchain sarà pieno di reti, che includono una o più blockchain, e che parlano diversi linguaggi: per assicurare la **resilienza** dell’intera industria, al pari (se non di più) dell’attuale sistema finanziario tradizionale.
