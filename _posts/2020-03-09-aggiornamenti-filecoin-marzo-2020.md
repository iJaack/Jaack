---
title: "Filecoin Febbraio 2020: tipsets, proof system, roadmap"
layout: post
date: 2020-03-09 16:00
image: https://filecoin.io/images/blog/blog-post-banner-roadmap-update-feb-2020.jpg
headerImage: true
tag:
- blockchain
category: blog
author: jaack
description: Gli aggiornamenti dell'ultimo quarter su Filecoin
published: true
lang: it
---

Periodicamente, seguo gli aggiornamenti di progetti blockchain che credo hanno
un potenziale ancora inespresso. Tra questi c'è **Filecoin**, che è un progetto costruito
su IPFS ([di cui ho parlato già ampiamente]({{base}}/filecoin-update-q2-q3-2019/)).

Gli aggiornamenti di Febbraio sono i seguenti.

### Tipsets
Filecoin spiega come funzionano i *tipsets*, un modulo del loro
Protocollo di Consenso Atteso (Expected Consensus Protocol). I *tipsets* sono una
variante dei blocchi figli di una DAG, un grafo aciclico diretto, utilizzato su Ethereum. In poche parole, mentre il consenso dei blocchi sulla blockchain bitcoin avviene sulla catena più lunga,
su Ethereum ogni blocco può avere dei blocchi 'zii' (**Uncle Blocks**), che sono minati
nella stessa Epoca di un blocco genitore, ma non hanno raggiunto il consenso maggiore.

In Ethereum, gli Uncle Blocks possono dare più rilevanza ad un nuovo blocco figlio che è stato minato
dal blocco genitore, entrando di fatto nella catena di blocchi principale. In Filecoin, invece,
l'approccio è leggermente diverso: ogni tipset (set di ultimi blocchi) ha un *peso*, dato dalla somma dei genitori a cui è collegato. Nell'immagine in basso c'è una rappresentazione schematica, che sicuramente si capisce meglio.

<img class="image" src="https://filecoin.io/images/blog/tipsets-family-weights-5.svg"/>

Dato che, inoltre, i blocchi validati sono solo quelli che provengono dallo stesso genitore e che sono minati nella stessa epoca, si risolve velocemente una potenziale divergenza di blocchi (un fork temporaneo tra una epoca e l'altra) e allo stesso tempo si ricompensa più miner, che possono aver, insieme, prodotto più blocchi. Ragionando su questo, mi viene il dubbio: come evitare che poi il mining sia centralizzato nelle mani di pochi? Come assicurarsi che ad ogni epoca ci sia un cambio anche solo parziale dei miner eletti per la produzione del blocco successivo?

([Fonte](https://filecoin.io/blog/tipsets-family-based-approach-to-consensus/))

### Il Proof System

Filecoin annuncia i dettagli del suo Proof System, un mix di prove per dimostrare di avere l'autorità, meritarla ancora e di ricevere la ricompensa dallo spazio dati salvato:

- **Proof-of-Space**: per dimostrare l'autorità nell'ottenere dati da salvare sul proprio hard disk, il miner deve dimostrare di avere sul supporto di memorizzazione lo spazio richiesto;
- **Proof-of-Storage**: è il sistema che serve a dimostrare di avere un determinato dato nel proprio supporto di memorizzazione;
- **Proof-of-Spacetime**: è il sistema che chiede ad un numero casuale di miner di provare pubblicamente che i dati che hanno ricevuto sono ancora nel loro supporto di memorizzazione.

La Proof-of-Space e la Proof-of-Storage sono stati combinati da Protocol Labs (il team che sta sviluppando Filecoin) nella **Proof-of-Replication**.

Insieme a questa spiegazione (che è in realtà è molto più complessa di così), Protocol Labs spiega le ragioni per il quale ha impiegato così tanto tempo a sviluppare Filecoin: per ottimizzare queste configurazioni (trovando il giusto mix tra incentivi, tempo di elaborazione e sicurezza), hanno dovuto affidarsi ad un software che risolve problemi di ottimizzazione con vincoli, e trovare i giusti vincoli che garantissero il mix sopracitato.

([Fonte](https://filecoin.io/blog/filecoin-proof-system/))

### Roadmap

- Dopo aver lanciato la Fase 1 della Testnet l'11 dicembre 2019, sono stati accumulati oltre 3.6 PiB di storage comprovato;
- Gli sviluppatori hanno rilasciato implementazioni di Filecoin [in C++](https://github.com/filecoin-project/cpp-filecoin) e [in Rust](https://github.com/chainsafe/forest) e stanno lavorando; all'interoperabilità tra queste implementazioni
- È stata ottimizzata la Proof-of-Replication (come descritto sopra), ottimizzando il sistema di prove SNARK (incremento di 2x);
- **Textile** ha annunciato di stare lavorando a degli strumenti per creare facilmente applicazioni per la rete Filecoin.
- É stata lanciata (non dal team Filecoin) la piattaforma [Terminal.co](terminal.co), che promette di distribuire facilmente il proprio sito con IPFS partendo da una repository Github. Il sito è contemporaneamente distribuito sia su IPFS che su protocollo http(s) tramite una CDN globale;
- [Zondax](https://zondax.ch/) ha pubblicato la repository relativa allo sviluppo di un'app per visualizzare il [Ledger Filecoin](https://github.com/Zondax/ledger-filecoin), mentre [Open Work Labs](https://www.openworklabs.com/) sta lavorando ad un [wallet](https://twitter.com/openworklabs/status/1225882262291378176).
- Trustwallet ha annunciato il [supporto per i token Filecoin](https://github.com/trustwallet/wallet-core/pull/811)

[Fonte](https://filecoin.io/blog/roadmap-update-february-2020/)

---

Altre risorse: [Come funziona Filecoin, in 5 minuti (in inglese)](https://protocol.ai/blog/technical-barriers-to-blockchain/)
