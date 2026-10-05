---
layout: project
project_id: lg-tv-use
title: LG TV Use
description: "An open-source MCP and CLI for LG webOS TVs: reusable app routes, visual fallback, remote input and verified power control."
permalink: /projects/lg-tv-use/
image: /assets/images/work/lg-tv-use-cover.png
cover: /assets/images/work/lg-tv-use-cover.png
cover_width: 1734
cover_height: 907
cover_alt: "LG TV Use: a television with a reusable command path and cursor, in amber on charcoal."
cover_caption_en: "Project artwork generated with AI."
cover_caption_it: "Grafica del progetto generata con AI."
---

<h2><span class="lang-en" lang="en">How it started</span><span class="lang-it" lang="it">Come è nato</span></h2>
<p><span class="lang-en" lang="en">I wanted to open a YouTube video on the TV and couldn’t find the remote. I asked Codex to build a local MCP tool for the LG TVs I use. The first attempt worked through webOS screenshots and remote commands, but the whole operation took about 50–60 seconds.</span><span class="lang-it" lang="it">Volevo aprire un video su YouTube sulla TV e non trovavo il telecomando. Ho chiesto a Codex di costruire un MCP locale per le TV LG che uso. Il primo tentativo funzionava attraverso screenshot di webOS e comandi del telecomando, ma l’intera operazione richiedeva circa 50–60 secondi.</span></p>

<p><span class="lang-en" lang="en">The next step was to make that exploration reusable: inspect a new screen, verify the result, then compile the route into code for the local MCP. Known routes use direct commands or bounded sequences, with screenshots as a fallback when the app or state is unfamiliar. After exploring the installed apps and testing power control, I made the tool open source. The useful idea is that discovering a route should make the next attempt faster.</span><span class="lang-it" lang="it">Il passo successivo è stato rendere riutilizzabile quell’esplorazione: osservare una schermata nuova, verificare il risultato e tradurre il percorso in codice per l’MCP locale. I percorsi conosciuti usano comandi diretti o sequenze limitate, con gli screenshot come fallback quando l’app o lo stato sono sconosciuti. Dopo una prima esplorazione delle app installate e le prove sull’alimentazione, ho reso il tool open source. L’idea utile è che scoprire un percorso renda più veloce il tentativo successivo.</span></p>

<h2><span class="lang-en" lang="en">Try it</span><span class="lang-it" lang="it">Provalo</span></h2>
<p><span class="lang-en" lang="en">You need Python 3.11 or later on macOS or Linux and a compatible LG webOS TV on your local network. Clone the repo, install it in a virtual environment, set your TV’s private IPv4 address and accept the pairing prompt on the television.</span><span class="lang-it" lang="it">Servono Python 3.11 o successivo su macOS o Linux e una TV LG webOS compatibile sulla rete locale. Clona la repo, installa il tool in un ambiente virtuale, imposta l’indirizzo IPv4 privato della TV e accetta la richiesta di associazione sul televisore.</span></p>

<p><a class="text-link" href="https://github.com/iJaack/lg-tv-use#install-and-pair"><span class="lang-en" lang="en">Installation and pairing guide</span><span class="lang-it" lang="it">Guida a installazione e associazione</span> →</a></p>

<p><span class="lang-en" lang="en">Once paired, ask your MCP agent to open YouTube, search for a video, inspect an unfamiliar screen or learn a checked route. The CLI is available for direct commands. Pair and register each TV separately before using multi-device or wake commands.</span><span class="lang-it" lang="it">Dopo l’associazione, chiedi al tuo agente MCP di aprire YouTube, cercare un video, osservare una schermata sconosciuta o imparare un percorso verificato. La CLI permette di inviare comandi diretti. Associa e registra ogni TV separatamente prima di usare i comandi per più dispositivi o per l’accensione.</span></p>

<h2><span class="lang-en" lang="en">Evidence and limits</span><span class="lang-it" lang="it">Verifiche e limiti</span></h2>
<p><span class="lang-en" lang="en">The public package passes 55 automated tests and build/install checks on macOS and Linux with Python 3.11 and 3.14. Physical exploration covered two LG models; power-off and wake were verified on one. App foreground checks do not prove focus, search results or playback. Wake and screenshots depend on the TV’s firmware and network settings.</span><span class="lang-it" lang="it">Il pacchetto pubblico supera 55 test automatici e i controlli di build e installazione su macOS e Linux con Python 3.11 e 3.14. Le prove fisiche hanno coinvolto due modelli LG; spegnimento e riaccensione sono stati verificati su uno. Il controllo dell’app in primo piano non prova il focus, i risultati di ricerca o la riproduzione. Accensione e screenshot dipendono da firmware e impostazioni di rete della TV.</span></p>

<p><a class="text-link" href="https://github.com/iJaack/lg-tv-use/blob/main/docs/validation.md"><span class="lang-en" lang="en">Read the validation notes</span><span class="lang-it" lang="it">Leggi le note di verifica</span> →</a> · <a class="text-link" href="https://github.com/iJaack/lg-tv-use/releases/tag/v0.3.1"><span class="lang-en" lang="en">Download release 0.3.1</span><span class="lang-it" lang="it">Scarica la release 0.3.1</span> →</a></p>

<p><span class="lang-en" lang="en">The code is MIT-licensed. Contributions and sanitized compatibility reports are welcome. This is an independent project; local credentials and private captures are excluded from the repository.</span><span class="lang-it" lang="it">Il codice ha licenza MIT. Contributi e segnalazioni di compatibilità senza dati privati sono benvenuti. È un progetto indipendente; credenziali locali e immagini private sono escluse dalla repo.</span></p>
