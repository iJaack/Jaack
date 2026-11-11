---
layout: page
title: Speaking
title_it: Interventi
permalink: /speaking/
---

<p class="page-intro"><span class="lang-en" lang="en">Talks, panels, and conversations from conferences around the world.</span><span class="lang-it" lang="it">Interventi, panel e conversazioni dalle conferenze di tutto il mondo.</span></p>


{% assign years = site.data.speaking | group_by: 'year' | sort: 'name' | reverse %}
{% for year in years %}
<section aria-labelledby="speaking-{{ year.name }}">
  <h2 id="speaking-{{ year.name }}">{{ year.name }}</h2>
  <ul class="dated-rows">
  {% for talk in year.items %}
    <li class="dated-row">
      <time datetime="{{ talk.date }}"><span class="lang-en" lang="en">{{ talk.date_en }}</span><span class="lang-it" lang="it">{{ talk.date_it }}</span></time>
      {% if talk.url %}<a href="{{ talk.url | escape }}">{% else %}<span class="row-title">{% endif %}<span class="lang-en" lang="en">{{ talk.title_en }}</span><span class="lang-it" lang="it">{{ talk.title_it }}</span>{% if talk.url %} <span aria-hidden="true">{% include link-arrow.html href=talk.url %}</span></a>{% else %}</span>{% endif %}
      {% if talk.event_en %}<span class="row-meta"><span class="lang-en" lang="en">{{ talk.event_en }}{% if talk.city_en %} · {{ talk.city_en }}{% endif %}</span><span class="lang-it" lang="it">{{ talk.event_it }}{% if talk.city_it %} · {{ talk.city_it }}{% endif %}</span></span>{% endif %}
    </li>
  {% endfor %}
  </ul>
</section>
{% endfor %}
