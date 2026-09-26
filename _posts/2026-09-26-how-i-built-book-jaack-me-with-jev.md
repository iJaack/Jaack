---
title: "My calendar was free. I wasn't."
layout: post
date: 2026-09-26 16:50:00 +0200
permalink: /how-i-built-book-jaack-me-with-jev/
image: /assets/images/2026/book-jev-cover.png
headerImage: true
tag:
- ai
- agents
- building
category: blog
author: jaack
description: "I built a booking page that checks my calendars, travel and project workload, with Jev making a few bounded decisions inside the scheduling rules."
published: true
lang: en
---

An empty half hour on my calendar is not always a half hour I can give someone. I may need to get home from an in-person event. I may have a deadline and still need time to finish the work. I wanted my booking link to take those things into account.

I built [book.jaack.me](https://book.jaack.me/) with Codex. It's a small Node app running on my Mac, with SQLite holding its private state. A visitor chooses a meeting length and a time, then gets a Google Meet invitation. Most of the work is deciding which times to offer.

For every availability request, the app checks all the calendars in my connected Google accounts, including hidden calendars and busy-only shared ones. If it cannot check one of them, it doesn't offer the time. I'd rather miss a possible meeting than book over something I already have.

Visitors see times in their own time zone. The date picker disables days with no available slots and recalculates when someone changes the meeting length. I set my minimum booking notice in a private dashboard; it's eight hours now. Before a booking is confirmed, the app checks the calendars again. It creates the meeting on the Google account I selected for invitations, with a new Meet link. Guests can cancel or reschedule from a signed link. A reschedule checks availability again and moves the original event, keeping its Meet link.

Those checks are rules in code. Calendar conflicts, working hours, notice and time-zone conversion do not depend on a model's answer.

Travel needs another check. Visitors are booking remote calls, but I have in-person events on my calendar. The app uses my base location and the event's location to ask Google Routes how long the trip takes. It checks the direction that matters for a slot before or after that event, adds my minimum buffer and removes times that don't fit. It never asks the visitor where they are.

I use [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) for a smaller decision within that travel calculation. It can choose a travel mode and add up to 15 minutes of extra margin. Google Routes still supplies the route time. If Jev chooses another mode, the app asks Google Routes for that route too. If the route fails, it uses driving.

Jev gets rounded route distance and duration, the trip direction and possible meeting times. It doesn't get either address, the event title, attendees or the visitor's details. I accept a choice only when its confidence reaches 0.55. If the mode is uncertain, the app uses driving; if the extra margin is uncertain, it uses zero. One weak answer doesn't force me to discard the other.

I also wanted the page to account for what kind of week I'm having. The app uses the previous four weeks to learn a baseline for busy time, then reads current events when it calculates slots. In the private dashboard I can match projects by calendar and title keywords. A title match takes priority, and I can mark an event `[meeting]`, `[focus]` or `[deadline]` when its default classification is wrong. Events without a project still count as busy.

I set the scheduling rules around that classification. If a day already has several meetings, new calls are grouped into fewer nearby times. If I have a long focus block, the page keeps possible calls near the day's edges. Ahead of a deadline, it reduces openings over the preceding workdays and can close the deadline day. Across a week, it favors dates that already have calls instead of cutting up quieter days. Safe times are also ranked using local history of bookings that were kept, cancelled or rescheduled. That history needs more real outcomes before I can judge how useful the ranking is.

Jev doesn't set those rules. Once a day, it sees aggregate workload for the next two workdays and chooses whether to keep my minimum booking notice, increase it by 50% or double it. With my current eight-hour minimum, that means eight, twelve or sixteen hours. It cannot shorten the minimum I set. If the next five workdays are unusually full, Jev can also choose a private suggestion to cluster meetings, protect focus or protect a deadline. I see the suggestion in the dashboard; it does not move calendar events.

Testing this made me more careful about what I call “working.” A valid API key and a response from Jev did not mean its advice was usable. Some live travel answers were below my confidence threshold, so the app used the fallback. On a later availability check beside an in-person event, it accepted Jev's answer. Both are expected outcomes. The eight-hour notice is currently unchanged because that is what Jev chose from the recent workload.

The public page exposes available times and a suggested date. My project rules, workload report and Google account settings stay behind the private dashboard. Jev sees only the limited travel features or aggregate workload needed for each choice.

The booking page is live at [book.jaack.me](https://book.jaack.me/). I'll learn more from actual bookings, especially whether the ranking of times improves. For now, I know exactly which decisions come from Google Calendar, which come from my rules and which ones I've asked Jev to make.
