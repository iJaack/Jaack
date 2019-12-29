---
title: "Maccy è un semplice ma efficace clipboard manager"
layout: post
date: 2019-09-11 22:20
image: /assets/maccy-macos.jpg
headerImage: false
tag:
- tech
category: blog
author: jaack
description: Maccy è gratis, open source e senza interfaccia da finestra
published: true
---
Quando su iOS e macOS Apple ha abilitato la possibilità di copiare automaticamente
e rendere disponibili gli appunti copiati su tutti i dispositivi connessi allo
stesso account iCloud, ho gioito parecchio.

Ho utilizzato quella funzionalità, Handoff, per molto tempo perchè molto spesso
mi trovato a copiare un file, una frase senza dover sincronizzare per forza
lo stato di tutta l'app sul cloud. Dopo qualche mese, però, questa 'gioia' è pian
piano svanita: forse perché sempre più app supportavano Handoff, quindi non c'era bisogno
di copiare il link se bastava cliccare sull'icona della stessa app su un altro
dispositivo e tutto veniva subito sincronizzato velocemente.

O forse perché qualche volta non funzionava. In generale il problema più grande era
la mancanza di un modo per raccogliere i miei appunti di poche parole in maniera veloce,
senza doverli scambiare da un dispositivo all'altro o da un'app all'altra.

Non sapevo che esistesse una categoria di applicazioni chiamate *clipboard manager*.

E non sapevo nemmeno che costassero quasi almeno 5-10€. Ma poi su Product Hunt ho
trovato Maccy, un clipboard manager leggero ed open source.
Così leggero che non ha nemmeno un'interfaccia a finestre. Funziona solo con una finestrella
che si apre dalla barra di stato superiore, su macOS.

<img class="image" src="{{base}}/assets/images/maccy-macos.png" alt="Maccy su macOS">

Quello che fa è molto semplice da spiegare: ricorda **tutti** gli appunti copiati durante una sessione.
Li ricorda anche se faccio il logout o spengo proprio il computer. Per cancellare gli appunti basta
cliccare il tasto 'clear' nel menù a tendina che si apre. Non so quanto sia il limite massimo di
appunti che può tenere, probabilmente migliaia, che si possono ricercare facilmente perché
la prima riga della finestrella è proprio una barra di ricerca.

<img class="image" src="{{base}}/assets/images/maccy-macos-about.png" alt="La finestra About di Maccy su macOS">

Si può cancellare un solo appunto, premendo alt + delete, ma solo dalla prossima release
([lo sviluppatore ha già ascoltato il feedback degli utenti](https://github.com/p0deje/Maccy/commit/a654f3bfa4b4cb90fc631cea3bd93f19bc204821)). Certo, sarebbe stata utile una specie di classificazione degli appunti più cercati, magari fissati in alto - io intanto [l'ho chiesto](https://github.com/p0deje/Maccy/issues/46). Per ora è solo una lista in ordine cronologico. Ma per zero euro e massima facilità, qualche compromesso lo si può accettare.

Maccy è disponibile per macOS a [questo link](https://maccy.app/), gratis.
