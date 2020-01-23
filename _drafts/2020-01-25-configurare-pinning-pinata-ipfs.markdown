---
title: "Come configurare il pinning dei dati su IPFS con Pinata"
layout: post
date: 2020-01-25 12:00
image: /assets/images/markdown.jpg
headerImage: true
tag:
- blockchain
category: blog
author: jaack
description: Un solo computer non basta per garantire la resilienza dei dati
published: true
---

<pre>Nota: questa piccola guida fa parte di una serie di guide per conoscere e sviluppare su
IPFS. <a href="{{base}}/distribuire-sito-web-ipfs">Clicca qui</a> per andare alla
pagina principale della guida.</pre>

Dopo aver [installato il nodo IPFS]({{base}}/installare-nodo-ipfs) sul proprio computer,
si può dire che i contenuti che mettiamo tramite l'app IPFS Desktop sono su IPFS e lì rimarranno.

Questo è vero ma solo in parte. Dato che IPFS funziona - a livello concettuale - come torrent, se i contenuti sono solo un computer e quel computer per qualsiasi motivo non è disponibile, quel contenuto non è più reperibile.

Per questo, da qualche tempo per IPFS esistono dei servizi che si chiamano di *pinning*: una sorta di cloud storage per garantire la resilienza dei dati. Se non sono sul proprio computer, il servizio di pinning li mantiene, garantendone la disponibilità.

Esistono diversi servizi di pinning, ma per questa guida useremo il servizio **Pinata**, che per ora si è rivelato il più facile e veloce da configurare ed usare.
