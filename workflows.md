---
layout: page
Title: Workflows
description: Routine e workflows per una vita più efficiente e produttiva
---

*Questa pagina è in costruzione*

Questa pagina non è un post, non è una recensione né un progetto. È la mia vita.
Il modo in cui la mia vita è organizzata e il modo in cui alcune cose accadono
per inerzia. Il modo in cui riesco a creare momenti casuali positivi per me e le persone che mi stanno intorno e con cui lavoro.

È come se fosse il libro di me, ma non la mia biografia. E per questo è a capitoli, che si possono consultare, in maniera sparsa, usando la tabella dei contenuti
qui in basso.

## Indice
- [Homescreen](#La mia homescreen)
- [App e servizi](#Le app e i servizi che uso)
- [Workflow](#I semplici workflow che utilizzo)

## La mia homescreen

### iPhone

<img class="image" src="{{base}}/assets/images/routines/homescreen/2020/homescreen-2020-iphone-cover.png" alt="Homescreen iOS, iPhone, 2020">

L'iPhone è il fulcro delle mie attività, in mobilità e in ufficio o a casa.
Non perché iOS sia migliore di Android in qualche modo, anzi, gli ultimi smartphone Android mi piacciono sempre di più. Come dico sempre, è tutta una questione di ecosistema: su iOS ci sono app che non ci sono su Android, o che su Android hanno un'interfaccia meno intuitiva e, di conseguenza, meno usabile con facilità durante le operazioni quotidiane.

[L'homescreen attuale del mio iPhone: 2020]({{base}}/homescreen-iphone-2020)

#### Homescreen precedenti

[Estate-autunno]({{base}}/homescreen-estate-autunno-2019)

### iPad

#### Homescreen precedenti

...

### Apple Watch

<img class="image" src="{{base}}/assets/images/routines/homescreen/2020/homescreen-2020-watchos-cover.png" alt="Homescreen Apple Watch, 2020">

L'Apple Watch è il dispositivo che meno uso, più guardo, meglio lo sto usando. Non ho ancora trovato un metodo universale per configurarlo in maniera definitiva, ma ci sto lavorando.

[L'homescreen attuale del mio Apple Watch: 2020]({{base}}/homescreen-2020-apple-watch)

#### Homescreen precedenti

...

### Android

#### Homescreen precedenti

...

### macOS (laptop)

<img class="image" src="{{base}}/assets/images/routines/homescreen/2020/homescreen-2020-macos-cover.png" alt="Dock del MacBook Pro, macOS, 2020">

Il MacBook è il cuore delle mie operazioni di tutti i giorni: se con l'iPhone controllo con un attimo tutti gli aspetti della mia vita quotidiana, con il MacBook *faccio le cose*.

[Il dock di macOS - 2020]({{base}}/homescreen-2020-macos)

#### Homescreen precedenti

...

### Windows (desktop)

## Le app e i servizi che uso

- 1Password
- Agenda (solo iOS, iPadOS e macOS)
- Airmail (solo iOS, iPadOS e macOS)
- Apple Music
- Balance (solo iOS)
- CARROT Weather
- Day One
- Exist.io
- Fantastical
- Fattura24
- Feedly
- Good Morning Italia
- Goodreads
- Google Foto
- Pocket
- Telegram
- Things 3
- Trakt.tv
- Pillow (solo iOS e WatchOS)
- Strava
- Raindrop.io
- Revolut
- Waze

## I workflow che utilizzo

<section class="list">
	{% if site.posts.size == 0 %}
		<p class="text-center">Nessuna routine per ora :)</p>
	{% else %}
		{% for post in site.posts %}
			{% if post.category == 'workflows' %}
				{% if post.hidden != true %}
					{% include blog-post.html %}
				{% endif %}
			{% endif %}
		{% endfor %}
	{% endif %}
</section>
