---
title: "Blockchain 201: IPFS e token non fungibili"
layout: post
date: 2019-11-11 17:00
image: /assets/images/projects/blockchain-201/Blockchain-201.jpg
headerImage: true
tag:
- blockchain
category: projects
author: jaack
description: Un approfondimento su due casi d'uso blockchain che ho particolarmente a cuore
published: true
lang: en
---
***
> **Note**: This is an automatic placeholder for the translated version.
***


Per un evento ad [**Ala/34**](https://ala34.com), un co-working a Roma, mi è stato chiesto di preparare
un talk su casi d'uso della blockchain, come naturale evoluzione di un talk che
nella stessa serata avrebbe fatto Gian Luca Comandini sulla nascita di bitcoin e
della blockchain.

Ho iniziato quindi a preparare dei contenuti su **IPFS** e cryptogattini. Di
IPFS ne ho già parlato sul blog [qui](https://jaack.me/filecoin-update-q2-q3-2019/),
mentre di cryptogattini ne ho parlato solo nelle mie masterclass per DoubleBit.

Tramite il bottone qui sotto, è possibile scaricare le slide del mio intervento,
mentre più in basso ancora è possibile leggere la trascrizione completa del mio intervento
durante [Code4Future](https://www.code4future.it), un evento organizzato da HTML.it
al Talent Garden di Roma Ostiense, quello appena aperto, il 9 novembre scorso.

<img class="image" src="{{base}}/assets/images/Blockchain-201_IPFS-e-token-non-fungibili_2019-10-10_cover.png" />
<a class="link" href="{{base}}/assets/docs/Blockchain-201_IPFS-e-token-non-fungibili_2019-10-10.pdf">
Scarica le slide del mio intervento</a>

## IPFS: Interplanetary File System

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-2.jpg" />

*‘You’re all set! Now you have a wallet that only you control, directly without middlemen or bankers.’*

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-3.jpg" />

Quest’app in realtà è di test, perché la blockchain di Telegram oggi ancora non c’è, ma è un buon modo per vedere come funziona in maniera semplice un wallet che è di possesso solo di chi ne possiede le chiavi private. C’è il mio indirizzo, a cui le persone potrebbero mandarmi dei GRAM (i token di Telegram), però la cosa più importante da ricordarsi di un wallet è sicuramente la chiave privata.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-4.jpg" />

Questa è una chiave privata che spero non abbia fondi associati. È un po’ come una password, la chiave privata è una string di un numero variabile (in base alla blockchain di riferimento) di caratteri. Ci sono delle blockchain che hanno delle chiavi private di oltre 80-90 caratteri - ad esempio, il seed di un wallet IOTA.
Ci sono più combinazioni possibili per una password del genere, che atomi nell’universo. 2^91 combinazioni, un numero enorme. È difficile per un computer normale, e anche per un supercomputer, indovinare una password di questo tipo per tentativi.

Sono contentissimo se nessuno conosce questo progetto di cui parlerò, perché altrimenti il mio lavoro non avrebbe senso.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-2.jpg" />

IPFS sta per **‘Interplanetary File System’**: è un sistema interplanetario per la gestione dei dati. E questo c’entra tantissimo con la blockchain.
Quando il bitcoin è nato, aveva lo scopo di dare libertà finanziaria a coloro che usavano il sistema. Di liberare il popolo dalla costrizione delle banche.

IPFS è un progetto, portato avanti da un gruppo di scienziati/sviluppatori del Massachussets Institute of Technology (MIT) di Boston, che vogliono portare il concetto della blockchain oltre. Per loro il sistema blockchain non dovrebbe essere legato solamente alle transazioni in denaro, ma dovrebbe essere l’infrastruttura di internet. Cioè, internet come lo conosciamo non dovrebbe più essere un sistema a cui noi accediamo e di cui qualcun altro possiede l’infrastruttura.

Oggi, quando cerchiamo Facebook su Google, per esempio, stiamo:

- Facendo una richiesta a Google di cercare Facebook
- Facendo una richiesta a Facebook di farci vedere cosa stanno facendo i nostri amici.

Senza contare tutti i passaggi intermedi che si hanno nel trasferire queste informazioni. Il tutto in una millesima frazione di secondo. Le nostre informazioni più delicate, come il nostro indirizzo IP, il nostro indirizzo MAC (l’identificatore unico di qualsiasi dispositivo ch può essere connesso in rete). Tutte le aziende attraverso cui passiamo possono sfruttare queste informazioni per capire come ci comportiamo in rete, e vendere queste informazioni agli inserzionisti per fare pubblicità fatta su misura per i nostri comportamenti in rete che, quasi sempre, sono identici a quelli nel mondo reale.

IPFS parte dal presupposto che al giorno d’oggi ci sono più dispositivi connessi in rete che persone, e il numero è destinato solo a salire. In Italia, per esempio, ci sono più di 2 telefoni per persona. Una vision è lungo termine è: ‘immaginate se non ci fosse bisogno di internet, per accedere ad internet.’ Una cosa realizzabile forse tra 50 anni, se non di più.
Quello che invece stanno facendo oggi è costruire un protocollo di comunicazione che sostituisca l’http(s). L’https è il protocollo di trasferimento dei dati su internet, un protocollo di livello 4, nella pila di protocolli di rete (sono 7 in totale).

IPFS vuole cambiare questo protocollo, da https:// a IPFS://. Questo cambia moltissimo, perché con IPFS quando chiediamo un informazione in rete, non la chiediamo più ad un insieme di server in Islanda o chissà dove di proprietà delle big corporations, ma lo stiamo chiedendo a chi sta accanto a noi, nello spirito dei sistemi peer to peer.

Facciamo finta che io voglio recuperare un’informazione scritta su un pezzo di carta, una persona che prima di me l’ha messa su internet (sull’IPFS), la sta strappando e distribuendo alle persone vicine (peer) una porzione del foglio. Una volta fatto questo, prende una striscia, intestazione, e ci scrive come i pezzi possano essere recuperati. Questo è un concetto alla base del torrent, come si scaricavano le cose usando Emule. In questo modo io prendo il sito web recuperandolo dalle persone vicine a me, anche se non le conosco.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-5.jpg" />

Oggi il web è inefficiente e costoso perché internet costa, non può preservare la storia umana, centralizza le opportunità e si appoggia troppo alle infrastrutture GAFA (Google, Amazon, Facebook, Microsoft).

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-6.jpg" />

IPFS lo risolve in questi modi:

- File Lookup
- Memorizzazione selettiva
- Rimozione duplicati
- Hash crittografico (come in una transazione bitcoin: il file è sicuro)
- Sistema di naming decentralizzato.

Oggi quando scriviamo google.com, stiamo chiedendo a un server di dirci qual è l’indirizzo IP che ha google.com, anche l’IPFS l’ha inventato (esiste un sistema che trasforma parole in numeri). Tramite i seguenti passaggi: file, Hash, Indirizzo IP.
Io spero che diventi senza internet, ma non so se ci sarà così poca pressione e resistenza; in ogni caso, questa mia associazione dell’IPFS ad un mondo senza internet ma pur sempre connesso, è dovuto al fatto che qualche anno fa sono nate le proteste in Hong Kong in modo molto acceso perché il governo cinese non riusciva a fermare il flusso di informazioni scambiate dalle persone (nonostante avessero chiuso internet).

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-7.jpg" />

Utilizzavano infatti un’app che si chiamava **FileChat**: messaggistica istantanea pear to pear. Quest’app usava tutti i sensori possibili su un telefono (Wi-FI, Bluetooth, Infrarossi), per inviare i file da una persona all’altra il più vicino possibile e l’altra persona faceva la stessa cosa... le informazioni quindi, non passano attraverso un server, ma da una parte all’altra.

Oggi l’informazione passa attraverso mille persone diverse, e nel frattempo il mio dato non è più sicuro, in questo modo invece in realtà non ce l’ha nessuno perché le persone attraverso le quali è passato il mio dato non si conoscono e il dato è crittografato.
Ogni persona non è un nome e un cognome, ma uno pseudonimo, un nickname.
L’informazione viene trasmessa attraverso tutti i sensori, è il primo che ha internet può trasferirla anche in un altro posto.

La blockchain di **Filecoin** (progetto nato da IPFS) non funziona esattamente come Bitcoin, ha un sistema misto tra una Proof-of-State e una Proof-of-Work, hanno una serie di algoritmi che permettono di gestire il carico di lavoro e non farlo costare troppo. Per ora sono tutte speculazioni basate sui loro paper: quando la blockchain sarà attiva (forse intorno a Gennaio-Febbraio 2020) potremo sapere se funzionerà. Volevo mostrarvi questo sistema per farvi capire meglio alcuni concetti.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-8.jpg" />

Sono venuto qui per farvi installare una cosa sul vostro pc: potete andare su IPFS ora. Digitare degli indirizzi IPFS completi è assurdo perché le stringhe sono lunghissime, ma passandosi gli indirizzi si può fare.

Queste slides **sono su blockchain**, alla fine c’è un link e potete accedervi solo se avete un Chrome con un'estensione IPFS: cercando **IPFS Companion** e installando l'estensione, bisogna poi configurare l'estensione con un nodo interno di IPFS.

Anche il DNS è decentralizzato: è un sistema che chiede a più persone che sono vicine quale sia la loro lista. E’ un po’ come quando un peer di una blockchain bitcoin deve chiedere agli altri quale sia l’ultimo blocco al quale si è arrivati. Ognuno ha la sua lista che però deve essere sempre aggiornata.
Il concetto di blockchain può funzionare anche senza internet, bisogna sempre ricordare questo.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-18.jpg" />

**Wikipedia su IPFS** è un po’ diversa da quella che vediamo senza accedere a IPFS. Wikipedia è stato uno dei primi progetti ad essere 'portati' su IPFS con un progetto che si chiama Distributed Wikipedia.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-9.jpg" />

## Token non fungibili: Collectibles

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-10.jpg" />

Ai puristi di bitcoin questo argomento non piace, perché per loro non esiste altro che il linguaggio script di bitcoin per creare asset.
Io però sono una persona di più ampie vedute, e quando mi capita di fare questo tipo di talk
cerco di far vedere tutto quello che la blockchain può offrire, anche uscendo dagli schemi.

Una delle blockchain più grandi, **Ethereum**, ha l’obiettivo di creare il sistema operativo globale e dal 2015 ha sviluppato una serie di standard per abilitare delle applicazioni su blockchain: invece di avere il codice con funzioni normali, hanno lo Smart Contract. Quest’ultimo è un codice che si autoesegue verificando le condizioni che avvengono sul web.
Un insieme di Smart Contracts può creare una DApp (applicazione decentralizzata).

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-11.jpg" />

Un’applicazione decentralizzata si basa molto spesso su dei token, i quali possono essere monete (merce di scambio):un token è una **referenza digitale** di un dato in un sistema. Un token non fungibile, invece, è un **token unico distinto** dagli altri in base alle caratteristiche che variano.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-12.jpg" />

Un token normale, si dice fungibile; un bitcoin è sempre tale, quindi posso si possono scambiare indipendentemente. È solo una differenza di quantità e non qualità del token. Un token non fungibile invece, dipende dalle qualità, nonostante le caratteristiche primarie rimangano sempre le stesse. Sono quindi i valori a cambiare.

I token, servono per... i gattini!

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-15.jpg" />

**Dapper Labs** è una società che ha deciso di rendere più funzionale Ethereum attraverso degli esperimenti, creando la Dap per scambio di gattini collezionabile.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-13.jpg" />

Ogni volta che uno entra in un’applicazione decentralizzata, starà firmando il suo accesso confermando la sua identità nel sito CriptoKitties come fosse una firma digitale (bisogna avere anche un add-on come Metamask per gestire la lista degli indirizzi Ethereum e gestire i propri soldi come fosse un portafoglio).

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-19.jpg" />

Io ho 13 gattini, due anni fa quando ho fatto il primo talk su questo argomento mi hanno riso in faccia, quando ho fatto il terzo talk dicendo di averne venduto uno a 340$ sono rimasti tutti zitti. Hanno capito che c’è un mercato dietro.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-14.jpg" />

Il **fenotipo e genotipo** di ogni gattino è scritto nella blockchain, sappiamo che tutti i gattini hanno determinate caratteristiche (occhi, orecchie, colore...), ma queste variano, e devono farlo esattamente nel momento in cui si crea un nuovo gattino. Anche i nomi sono creati casualmente, non li ho dati io, sono creati dalla blockchain: sono token non fungibili.

<img class="image" src="{{base}}/assets/images/projects/blockchain-201/Blockchain-201-16.jpg" />

Ho comprato il primo gattino a circa 10$, poi li ho fatti accoppiare e così via... Queste sono monete uniche, è valore che può essere scambiato all’interno dell’applicazione ma anche fuori grazie al mio wallet.

Immaginate di fare questo non con i gattini ma con: case, pc... Posso spostarli spostando unicamente la sua identità digitale, cambia il concetto.
Oggi quando andiamo su Subito.it facciamo scambi manuali.
Ci sono gattini che sono speciali, nonostante siano tutti unici.

Un esempio realistico dell’accoppiamento dei gattini che ne creano uno nuovo è l’anagrafe.
Dapper Labs ha fatto anche altri esperimenti, come un gioco ad aste fra maghi.
Ogni token non fungibile non è uno solo perché si creano le caratteristiche; c’è la Total Supply che deve essere definita a priori come anche i criteri di rilascio dei nuovi token. C’è una funzione che permette di controllare e gestire il saldo, l’importo di token su ogni indirizzo, e poi ci sono varie funzioni per gestire il trasferimento a/da un singolo indirizzo.

Far accoppiare i gattini costa, ma pochissimo, le commissioni sono sempre molto basse.
L’ereditarietà è qualcosa che non viene specificato, a meno che non si tratti di un gattino che nasce da due che sono stati accoppiati.
I token devono rispettare uno standard che si chiama **ERC-721**, che prende l’eredità dagli standard 20, 23, 165, sviluppati da Ethereum fin dal 2015.

Se volete un token non fungibile che non faccia niente, ma sia comunque un token, si può fare.
Io ne ho fatto uno in 10 minuti che si chiama **JaackCoin**, sulla blockchain Waves: comprandoli, hai il mio tempo. Se ognuno avesse un token, il nostro valore sarebbe un dato determinato dalle leggi del mercato.

Abbiamo la possibilità di creare un mercato da zero: è un’espressione molto grande di libertà finanziaria. Non solo possiamo usare i nostri soldi senza darne conto a qualcun altro, ma possiamo anche creare il nostro mercato.

{% include changes.html %}

## Risorse utili

### IPFS
+ [Build a Decentralized Chat App with Knockout and IPFS](https://medium.com/textileio/build-a-decentralized-chat-app-with-knockout-and-ipfs-fccf11e8ce7b)
+ [How to Host Your Dapp With IPFS+ENS and Access It Via EthDNS](https://medium.com/the-ethereum-name-service/how-to-host-your-dapp-with-ipfs-ens-and-access-it-via-ethdns-c96046059d87)
+ [IPFS Companion for Firefox](https://addons.mozilla.org/it/firefox/addon/ipfs-companion/)
### Token
+ [Contratto Cryptokitties su Etherscan](https://etherscan.io/address/0x06012c8cf97bead5deae237070f9587f8e7a266d#code)
+ [Codice contratto Cryptokitties e progettazione software](https://etherscan.io/viewsvg?t=1&a=0x06012c8cf97bead5deae237070f9587f8e7a266d)

## [Slide intervento su IPFS](https://ipfs.io/ipfs/Qmf1Mo25GAMurJgfunEYzKthwsypkTv9riP5yt5LxChTxK)
