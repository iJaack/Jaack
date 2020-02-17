---
title: "Come distribuire un sito web su IPFS con ipfs-deploy"
layout: post
date: 2020-02-17 15:00
image: /assets/images/projects/IPFS/decentralizzare-web-ipfs.svg
headerImage: true
tag:
- blockchain
category:
author: jaack
description: Funziona con i siti statici ed è quasi tutto user-friendly
published: true
---

A gran richiesta, pubblico una guida su come distribuire il proprio sito web
sul web decentralizzato, su IPFS (Interplanetary File System). Per avere un'idea
di cosa sia IPFS, ho scritto qualche slide [qui]({{base}}/blockchain-201-ipfs-token-non-fungibili/).

<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fijaack94%2Fposts%2F10220740078835142&width=750&show_text=true&height=656&appId" width="750" height="656" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>

Per semplicità, questa guida ha dei link verso altre guide (propedeutiche per questa) e delle istruzioni specifiche.

Innanzitutto: cosa vuol dire distribuire un sito web su IPFS? Fondamentalmente vuol dire che, invece che collegarsi al mio sito utilizzando i server giganteschi delle aziende che ospitano la maggior parte dei siti web del mondo (Amazon, Facebook, Google), il mio sito viene ricostruito nel computer dell'utente visitatore raccogliendo pezzettini provenienti da tanti computer diversi in giro per il mondo, che possono essere di persone comuni. Una parte del mio sito web è anche sul mio computer desktop a casa. È un bellissimo esempio di decentralizzazione dei contenuti.

Il vantaggio è che il mio sito non può **praticamente mai** andare offline: se un computer va offline, ci sono sempre gli altri che ricostruiscono il resto. Se invece va offline un datacenter di Google, per qualche momento tutti i siti collegati a Google in quel datacenter risultano non raggiungili. Ogni tanto è successo con Facebook, che fatto impazzire anche i server di Whatsapp e Instagram.

### Requisiti

Per iniziare, bisogna vedere i requisiti:
- Un sito web statico usando i seguenti framework: jekyll, hakyll, elevently, gatsby, hugo, hexo, nuxt, pelican, create-react-app, metalsmith, middleman, docusaurus e tutti i siti web che supportano i contenuti nelle cartelle *site* e *docs*
- **npm** installato ([scarica npm](https://nodejs.org/en/download/))
- consigliato: nodo IPFS installato in locale - [Come installare un nodo IPFS]({{base}}/installare-nodo-ipfs)
- un account su un servizio di pinning dei dati, consigliato con Pinata - [Come configurare il servizio di pinning Pinata]({{base}}/configurare-pinning-pinata-ipfs)
- Un account su Cloudflare per il servizio DNS - [Come configurare il proprio sito web con Cloudflare](Coming Soon)

### Istruzioni

*Coming soon*
