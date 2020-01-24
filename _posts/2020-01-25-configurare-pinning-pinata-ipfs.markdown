---
title: "Come configurare il pinning dei dati su IPFS con Pinata"
layout: post
date: 2020-01-24 12:00
image: /assets/images/projects/IPFS/pinning-ipfs.png
headerImage: true
tag:
- blockchain
category: blog
author: jaack
description: Un solo computer non basta per garantire la resilienza dei dati
published: true
---

<pre>Nota: questa piccola guida fa parte di una serie di guide per conoscere e sviluppare su IPFS.
<a href="{{base}}/distribuire-sito-web-ipfs">Clicca qui</a> per andare alla pagina principale della guida.</pre>

Dopo aver [installato il nodo IPFS]({{base}}/installare-nodo-ipfs) sul proprio computer,
si può dire che i contenuti che mettiamo tramite l'app IPFS Desktop sono su IPFS e lì rimarranno.

Questo è vero ma solo in parte. Dato che IPFS funziona - a livello concettuale - come torrent, se i contenuti sono solo un computer e quel computer per qualsiasi motivo non è disponibile, quel contenuto non è più reperibile.

Per questo, da qualche tempo per IPFS esistono dei servizi che si chiamano di *pinning*: una sorta di cloud storage per garantire la resilienza dei dati. Se non sono sul proprio computer, il servizio di pinning li mantiene, garantendone la disponibilità.

Esistono diversi servizi di pinning, ma per questa guida useremo il servizio **Pinata**, che per ora si è rivelato il più facile e veloce da configurare ed usare.

Per registrarsi, basta andare su [pinata.cloud](https://pinata.cloud) creando le credenziali con email e password.

Questa guida finirebbe così, e sarebbe inutile anche solo scriverla, se non che è ha senso spiegare le funzionalità di Pinata in modo che siano utili per distribuire file e siti web su IPFS.

<img class="image" src="{{base}}/assets/images/projects/IPFS/pinata-getting-started-ipfs.png" alt="La schermata Getting Started di Pinata.cloud">

Non appena si fa l'accesso su Pinata, appare la schermata **Getting Started**, che in realtà è la schermata più complessa di tutte: è la documentazione sull'utilizzo delle API di Pinata per creare app che utilizzino IPFS come storage decentralizzato. Non il nostro caso.

<img class="image" src="{{base}}/assets/images/projects/IPFS/pinata-upload-ipfs.png" alt="La schermata Upload di Pinata.cloud">

La schermata **Upload** è simile al tab Files su IPFS Desktop: permette di caricare i file su IPFS semplicemente caricandoli nella pagina web, ma in questo caso i file risiedono nel cloud di Pinata e non sul proprio computer.

<img class="image" src="{{base}}/assets/images/projects/IPFS/pinata-pinning-ipfs.png" alt="La schermata Pin Explorer di Pinata.cloud">

Ogni qualvolta che si carica un file o si distribuisce un sito web su IPFS tramite Pinata, è possibile controllare la storia degli hash collegati ai file caricati nella schermata **Pin Explorer**. La schermata in alto mostra le due versione, una di dicembre 2019 e una di gennaio 2020, del sito jaack.me. Dato che Pinata ha un limite di caricamento dati gratuito per utente di 1 GB, cerco di mantenere su Pinata solo una versione del sito per ogni mese, cancellando le altre.

<img class="image" src="{{base}}/assets/images/projects/IPFS/pinata-account-ipfs.png" alt="La schermata Account di Pinata.cloud">

L'ultima schermata importante è quella dell'account, che contiene le informazioni sensibili relativi alle chiavi private che permettono ad applicazioni e servizi esterni di interfacciarsi con il servizio di pinning offerto da Pinata. Le informazioni rilevanti - email, chiave privata e chiave segreta - saranno fondamentali nella distribuzione del proprio sito web su IPFS.
