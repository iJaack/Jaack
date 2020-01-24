---
layout: page
Title: Routine
description: Routine e workflows per una vita più efficiente e produttiva
---

Questa pagina non è un post, non è una recensione né un progetto. È la mia vita.
Il modo in cui la mia vita è organizzata e il modo in cui alcune cose accadono
per inerzia. Il modo in cui riesco a creare momenti casuali positivi per me e le persone che mi stanno intorno e con cui lavoro.

È come se fosse il libro di me, ma non la mia biografia. E per questo è a capitoli, che si possono consultare, in maniera sparsa, usando la tabella dei contenuti
qui in basso.

# Indice

- [Homescreen](#La mia homescreen)
- [App e servizi](#Le app e i servizi che uso)
- [Workflow](#I semplici workflow che utilizzo)

# La mia homescreen

## iPhone
L'iPhone è il fulcro delle mie attività, in mobilità e in ufficio o a casa.
Non perché iOS sia migliore di Android in qualche modo, anzi, gli ultimi smartphone Android mi piacciono sempre di più. Come dico sempre, è tutta una questione di ecosistema: su iOS ci sono app che non ci sono su Android, o che su Android hanno un'interfaccia meno intuitiva e, di conseguenza, meno usabile con facilità durante le operazioni quotidiane.

[L'homescreen attuale del mio iPhone: autunno 2019](https://jaack.me/homescreen-estate-autunno-2019)

## iPad

## Apple Watch

## Android

## macOS (laptop)

## Windows (desktop)

# Le app e i servizi che uso (in ordine alfabetico)

- Agenda

- Airmail

- Balance

- CARROT Weather

- Fantastical

- Good Morning Italia

- Google Foto

- Pocket

- Telegram

- Pillow

- YouTube

- Messenger

- Scribd

- Strava

- Elevate

- Revolut

- Waze

- Reeder

- Goodreads

- Musica

# I workflow che utilizzo

<section class="list">
	{% if site.posts.size == 0 %}
		<p class="text-center">Nessuna routine per ora :)</p>
	{% else %}
		{% for post in site.posts %}
			{% if post.category == 'routines' %}
				{% if post.hidden != true %}
					{% include blog-post.html %}
				{% endif %}
			{% endif %}
		{% endfor %}
	{% endif %}
</section>
