---
title: "How I built book.jaack.me with Jev"
layout: post
date: 2026-09-26 16:50:00 +0200
permalink: /how-i-built-book-jaack-me-with-jev/
headerImage: false
tag:
- ai
- agents
- building
category: blog
author: jaack
description: "My booking page checks every calendar, accounts for travel and project workload, and uses Jev for bounded decisions without letting AI override the scheduling rules."
published: true
lang: en
---

My calendar could show a free half hour between two commitments. That didn't mean I wanted a meeting there.

Maybe the first commitment was in person and I needed to get home. Maybe the gap was the only uninterrupted time I had to finish a project. A normal booking link sees an empty rectangle. I see what that rectangle is for.

So I built [book.jaack.me](https://book.jaack.me/) with Codex. It looks like a simple scheduling page: pick a length, choose a date and time, get a Google Meet invitation. Underneath, I wanted it to answer a harder question: **which free slots can I actually afford to give away?**

It's a small Node app with SQLite for its private state, running on my Mac. We built it in layers: get Calendar and booking right, account for travel, then make availability respond to the work around each meeting.

## Google Calendar decides whether I'm free

The starting point is Google Calendar, across every calendar in every account I've connected. Hidden calendars and busy-only shared calendars count too. If one of those checks fails, the app doesn't assume I'm available.

Visitors see times in their own time zone. Early on, a day with no slots could still be clicked. The picker now checks the month, disables empty days and rechecks a selected day. I can set the minimum notice in a private dashboard; right now it's eight hours. A time that was available when someone opened the page is checked again before the app creates anything. The booking itself goes to the Google account I've chosen for invitations, with a new Meet link.

A guest can later cancel or reschedule from a signed link. Rescheduling checks availability again and moves the original event, keeping its Meet link.

That is the part I don't want an AI model to improvise. Overlaps, working hours, time zones, notice and the final conflict check are ordinary rules in code.

## A meeting can take more time than its calendar block

My visitors are booking remote calls, but some of my existing events are in person. If I have to travel to or from one, a 30-minute opening beside it may be unusable.

I keep a base location in the private dashboard. When an in-person event is adjacent to a possible slot, Google Routes supplies the travel duration. The app adds my minimum buffer and removes slots that don't fit. It calculates the relevant direction, before or after the event; it doesn't ask a visitor for their location.

This is where Jev enters the system. [TypeSafe describes it as a model for structured decisions](https://typesafe.ai/blog/introducing-system-one-models-and-jev). It can choose a travel mode from a short list and add up to 15 minutes of extra margin. Google Routes still supplies the actual route time. If Jev suggests a mode that cannot be routed, the app uses the driving route. Each uncertain choice falls back separately: driving if the mode is uncertain, zero extra minutes if the margin is uncertain.

Jev sees rounded route distance and duration, the trip direction and candidate times. It doesn't receive my addresses, event titles, attendees or the visitor's details.

## A free day has a workload type

Travel was only one part of the problem. A week of calls needs a different booking pattern from a week of deep work or a deadline.

The private service looks at the previous four weeks of calendar load and checks current events when it builds availability. I can map projects through calendar selections and words in event titles. A title match takes precedence over a calendar match, and I can mark an event `[meeting]`, `[focus]` or `[deadline]` when the default is wrong. Events it cannot classify still count as busy time.

The slot rules then respond to the kind of work:

- Meeting-heavy days offer fewer times, grouped near meetings already on the calendar.
- Focus-heavy days keep openings near the edges, leaving a longer block in the middle.
- An approaching deadline progressively reduces openings; the deadline day can close, and availability resumes afterward.
- Across a week, the picker favors days that already have meetings. Quieter days can keep just a couple of edge slots instead of being cut into pieces.

These are scheduling rules, not Jev inventing a new calendar plan. The app also starts ranking safe slots using the time patterns of bookings that were kept, cancelled or rescheduled. That feedback is local and will become more useful as there are more outcomes.

## What Jev decides each day

Once a day, the app gives Jev aggregate workload numbers for the next two workdays and asks one bounded question: keep my minimum booking notice, increase it by 50%, or double it? Jev can extend the eight-hour floor I set. It cannot shorten it.

If the coming five workdays look unusually full, Jev can also choose a private suggestion: cluster meetings, protect focus or protect a deadline. I see that in the owner dashboard. It doesn't silently move an event or message anyone.

The integration uses Jev's typed choices and confidence scores. I set a confidence threshold of 0.55. Below that, or if the request fails, the app uses its defined fallback. We saw why this matters while testing: a valid API key and a healthy response didn't always mean Jev's travel answer was confident enough to use. Later, a live availability check beside an in-person event did accept Jev's advice. I wanted to distinguish those two states instead of calling every successful API response “AI-powered scheduling.”

## What stays private

The public page can show available times and a suggested date. It cannot read my project rules, workload report, calendar names or owner settings. The owner dashboard is on a private network; the public booking page runs through a gateway that only exposes the booking routes.

At publication, the service is live and its scheduling tests pass, including the new workload rules. Jev's daily notice choice has currently kept my eight-hour minimum. I checked live availability without placing a test booking; the historical slot ranking is still early because it needs real booking outcomes.

The useful change is already visible: a booking link can now account for more than whether a square on my calendar is empty. If a time appears on [book.jaack.me](https://book.jaack.me/), it has passed the calendar, notice, travel and workload checks that matter to me.
