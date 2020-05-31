---
title: "Cosa ho scoperto della Pubblica Amministrazione facendo ricorso per un verbale"
layout: post
date: 2020-05-31 12:00
image: /assets/images/firmo-con-cie-android.png
headerImage: true
tag:
- tech
category: blog
author: jaack
description: Dalla Carta d'Identità Elettronica alla firma digitale, la Pubblica Amministrazione funziona benissimo, ma bisogno navigarci
published: true
---

Per chi ha seguito le mie (sfortunate) vicende, il 2 maggio ho preso una cosiddetta
'multa COVID-19', una multa per aver violato le leggi di un Decreto creato per contrastare la pandemia COVID-19.

Mi hanno multato per 400€, ed io ovviamente non ho pagato - le ragioni per cui non ho pagato, e per cui credo di avere ragione sono nell'[articolo dedicato]({{base}}/coronavirus-multa-400-euro-correre/), quindi non le rispiegherò qui.

Secondo le disposizioni indicate nel verbale che ho ricevuto, avrei avuto 30 giorni di tempo per fare ricorso, ma (per mia fortuna), non è così: ho 30 giorni a partire dal 16 maggio 2020, secondo quello che è scritto in [questa pagina](http://www.prefettura.it/roma/contenuti/Indicazioni_in_caso_di_violazioni_alle_disposizioni_dettate_dal_d.p.c.m._emergenza_covid_19-8955547.htm) della Prefettura di Roma, che indica che *"Ai sensi dell'art. 37 del D.L. 8 aprile 2020, n. 23, il termine dei 30 gg , per la presentazione di memorie e scritti difensivi o per la richiesta di audizione al Prefetto da parte del trasgressore, decorrono (salvo ulteriori proroghe di legge) dalla data del 16 maggio 2020.".*

Avevo quindi tempo fino al **16 giugno** per fare ricorso, usando tutte le motivazioni che ho descritto anche nell'articolo precedente (tutte valide, dopo un confronto con altri). Ma ho voluto togliere il dente il prima possibile: mi sono auto-imposto di fare tutto entro il 1 giugno, per non tirare tutto per le lunghe (ho due esami da preparare, e **Campus Party Digital Edition**). E poi mi da fastidio che quel task, '**Ricorso verbale polizia**', stia lì ogni giorno a ricordarmi di quello spiacevole evento.

<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fijaack94%2Fposts%2F10222363900589671&show_text=true&width=552&height=735&appId" width="552" height="735" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>

Ma io non sono un avvocato. Dopo aver sentito alcuni pareri familiari, ho pensato che fosse una buona idea chiedere consiglio ad un avvocato, però sinceramente non avrei voluto spendere soldi per l'ignoranza della polizia che mi aveva fatto la multa. Ho così scritto un post su Facebook per chiedere aiuto *pro bono*, e il mio amico [Valerio Barbato](https://www.facebook.com/Valerio.Barbato93/) ha risposto (insieme a Sasà, che ringrazio lo stesso).

[Ho conosciuto Valerio in ERASMUS](https://medium.com/italia/non-ho-saputo-trovare-un-titolo-per-il-mio-erasmus-9a8bce5a1d79), e si è offerto di darmi una mano perché forse ha capito che avrei avuto bisogno solo di un piccolo aiuto. Gli ho condiviso il Google Doc a cui avevo lavorato, insieme agli allegati che volevo includere, e lui ha revisionato il tutto.

Ovviamente avevo sbagliato tutto nella forma, ma il contenuto era corretto: le motivazioni erano corrette, bastava solo scriverle in *legalese* e infine certificare l'atto di ricorso con la **firma digitale**. Ecco, da questa esigenza è partita una piccola *odissea* durata un venerdì notte, in cui io e Valerio abbiamo scoperto che la Pubblica Amministrazione italiana funziona meglio di quanto si pensi, e che alcuni pilastri sono addirittura **open-source**.

---

<img class="image" src="{{base}}/assets/images/piano-ricorso-things-3.png" alt="Come per ogni cosa da fare, ho impostato un progettino con la lista di cose da fare su Things 3">
<figcaption class="caption">Come per ogni cosa da fare, ho impostato un progettino con la lista di cose da fare su Things 3</figcaption>

Per fare la firma digitale (che non è la firma che si disegna a mano con Anteprima su macOS), bisogna disporre di un identità digitale che sia riconosciuta dallo Stato e il cui procedimento di certificazione sia riconosciuto a livello legale. Da quanto ne sapevo all'inizio della ricerca, l'unico modo per fare una firma digitale (che banalmente consiste nel certificare un documento con una marca temporale e applicando un certificato al PDF del documento) è tramite una **CNS** (Carta Nazionale dei Servizi, una penna USB fondamentalmente) o una **Smart Card** abilitata alla firma.

Io ho una CNS: l'avevo presa per poter firmare l'atto di costituzione della startup che avevo fondato qualche anno fa ormai (2017). Pagata 70€ circa, se non ricordo male. Ma con la CNS ho sempre avuto problemi: bisogna installare un software, che installa una serie di altri programmi, e la compatibilità è pessima. Su macOS non ha mai funzionato bene (nemmeno riconosciuta qualche volta), mentre su Windows ha sempre più o meno funzionato, ma per usare i certificati nella pennetta potevo usare solo il browser web (Firefox) avviato dalla pennetta stessa. Insomma, un incubo: non voglio più usare la CNS.

Quando accedo al portale dell'Agenzia delle Entrate, però, noto che posso fare login anche con SPID, e quindi penso che forse, con SPID, posso fare anche la firma digitale. Faccio un po' di ricerche e [trovo conferma](https://www.corrierecomunicazioni.it/pa-digitale/firmare-con-spid-adesso-si-puo-ecco-le-linee-guida-agid/): peccato che nell'articolo sia scritto che le linee guida sono state rilasciate, ma non c'è traccia di un procedimento che si possa attuare al momento - tutto etereo, per ora.

Non mi arrendo: mi ricordo che, quando è stata introdotta nel 2013, la Carta d'Identità Elettronica è stata definita dal Ministero dell'Interno come il prossimo passo per l'identità digitale, accorpando sotto un'unico scopo SPID, CNS e CIE (Carta d'Identità Digitale). Il senso è che, a tendere, con la Carta d'Identità Elettronica si potrà fare tutto quello che ora si fa con la CNS, lo SPID, e anche con la **firma digitale**.

Mi ritengo un'inguaribile ottimista: quando leggo che qualcosa *sarà disponibile*, penso sempre che possa esserlo *anche ora*. E così faccio una semplice ricerca su Google, '*CIE firma digitale*', con cui mi imbatto in una discussione sul [forum di Italia.it](https://forum.italia.it/t/e-possibile-firmare-digitalmente-documenti-tramite-la-cie-3-0/8945/44) che affonta proprio questo tema, e scopro che **sì**, è possibile usare la firma digitale anche con la CIE!

Pronto per il download, cerco prima il [**driver CIE**](https://www.cartaidentita.interno.gov.it/identificazione-digitale/software-cie/) (che servono per far riconoscere la CIE al sistema operativo), ma poi mi chiedo come faccio a farla riconoscere dal computer, dato che è una carta. Ed ecco il primo *gap*, il primo buco: che senso ha, nel 2020, stare ancora dietro alle smart card per collegare una carta ad un computer?

Ed infatti qualcuno questa domanda se la deve essere fatta, perché facendo una ricerca più approfondita, scopro che esiste un'app per Android, [**Firmo con CIE**](https://www.firmoconcie.it/), che sfrutta i driver CIE per collegare lo smartphone alla CIE **usando direttamente l'NFC** - purtroppo, a causa delle restrizioni di Apple sull'utilizzo dell'NFC, quest'app non funziona perfettamente su iOS..

<img class="image" src="{{base}}/assets/images/firmo-con-cie-android.png" alt="I passi per mettere la firma digitale con 'Firma con CIE'">
<figcaption class="caption">I passi per mettere la firma digitale con 'Firmo con CIE'</figcaption>

Scarico l'app da Play Store e seguo la procedura per **aggiungere un nuovo cerificato**: inserisco il PIN della CIE e poi la avvicino sulla scocca dello smartphone. La registrazione è immediata, ora posso usare la firma digitale!

<img class="image" src="{{base}}/assets/images/documenti-ricorso.png" alt="La cartella con i documenti del ricorso">
<figcaption class="caption">La cartella con i documenti del ricorso</figcaption>

Condivido queste mie scoperte con Valerio, che anche lui, sorpreso, fa il mio stesso procedimento e prova tutto. Per usare la firma digitale ho dovuto trasferire il documento del ricorso sullo smartphone (io ho usato Telegram), aprire il documento dall'app e poi ritrasferire il documento sul computer. Ci ho messo 10 minuti per registrare la CIE e 2 minuti per fare la firma digitale.

<img class="image" src="{{base}}/assets/images/pec-ricorso.gif" alt="Ho mandato la mail per il ricorso tramite PEC">
<figcaption class="caption">Ho mandato la mail per il ricorso tramite PEC</figcaption>

Ho mandato il ricorso tramite PEC, con il documento certificato tramite firma digitale avvicinando semplicemente la CIE allo smartphone. Mi sono sentito veramente nel 21esimo secolo, devo essere sincero.

<img class="image" src="{{base}}/assets/images/promemoria-ricorso-things-3.png" alt="Things 3 mi ricorderà se ho vinto il ricorso o meno">
<figcaption class="caption">Things 3 mi ricorderà se ho vinto il ricorso o meno</figcaption>

Spero che il mio ricorso sia accolto (ho 210 giorni di tempo, oltre i quali il ricorso si presume accolto comunque), ma intanto ho capito che la Pubblica Amministrazione non funziona poi così male: basta solo cercare bene.
