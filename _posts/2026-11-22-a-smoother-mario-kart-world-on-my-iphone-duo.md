---
title: "A smoother Mario Kart World on my iPhone Duo"
layout: post
date: 2026-11-22 19:40:00 +0100
permalink: /a-smoother-mario-kart-world-on-my-iphone-duo/
headerImage: false
tag:
- building
- open-source
- gaming
category: blog
author: jaack
lang: en
description: "I ran the same Mario Kart World race twice on my iPhone Duo and measured what Metal 4 prewarming changed."
published: true
---

I got Mario Kart World 1.8.0 running on my iPhone Duo through NX2Apple. I asked Codex to run a race on the phone before calling it done. The first race reached the results screen and averaged close to 30 fps. It also had a gap of almost half a second between two frames. Both facts mattered if I was going to play it again.

## The second race

We ran Mario Bros. Circuit at 50cc in the Mushroom Cup twice. Each sample covers one minute of driving, after the course intro and between screenshots. The phone reported serious thermal state during both runs.

| On the Duo | First run | Tuned run |
| --- | ---: | ---: |
| Average rendered fps | 28.8 | 30.0 |
| 99th-percentile display interval | 66.7 ms | 33.3 ms |
| Longest gap between displayed frames | 466.7 ms | 66.7 ms |
| Display gaps over 100 ms | 13 | 0 |

Both runs completed all three laps. The change I cared about was the time between frames. The second run still spent most of the minute around 30 fps, and its longest gap was two typical frame intervals.

## What changed in the build

NX2Apple uses nxnative to run the game's code and translate its graphics to Metal. In the original run, the submission thread sometimes waited hundreds of milliseconds while pipelines were built. For the second run I switched to Handheld mode, enabled Metal 4 pipelines, and built a pipeline archive on the Mac for the Duo's A20 Pro (`g19p`). The archive added 865 MiB to the game framework. [NX2Apple](https://github.com/LNPANDY/NX2Apple) · [nxnative pipeline documentation](https://github.com/seedds/nxnative/blob/main/docs/development.md#the-pipeline-archive-made-offline)

The phone's log gave me a direct check. With the same learned list, the Metal 4 preparation stage took 32.14 seconds without the bundled archive and 0.44 seconds with it. The archived run pulled in 1,815 bases and compiled zero during that stage. The race result reflects the combined settings, the archive and the cache learned from earlier runs.

There was a smaller build bug along the way. The packager used Python 3.12, then its shell step found macOS's Python 3.9 for the optional archive compiler. That step failed while the rest of the framework still built. Passing the selected interpreter through to the compiler made the archive build run as intended. Checking the output and then checking the phone's log caught both halves of that problem.

## What takes up space

The pipeline archive trades phone storage for less compilation during play. The game images take up much more room. I checked the four images for identical files and found 1.53 GB of repeated bytes. Ocarina of Time was the biggest opportunity.

A local Ocarina prototype went from 26.25 GB to 25.21 GB in the same RomFS image format. It stores each identical file body once and keeps each original path and file digest. The existing format still reads each file by offset, with no new decompression step. This was a local image check. I also opened both images with nxnative’s existing RomFS reader and compared the index entries. Timing the smaller image during gameplay on the phone is still pending.

The same trade-off showed up when I tried Donkey Kong Bananza. Its full A20 Pro archive added 2.29 GB. The game reached the mode picker, then nxnative stopped it at the opening scene because the device was short on disk headroom. Removing that trial build freed 2.36 GB on the Duo. I prepared smaller configurations for Bananza, Pokémon Legends: Z-A and Ocarina of Time that let the phone build pipelines as it needs them. Those configurations still need a gameplay pass.

## Upstream

I opened one pull request for the selected-Python fix and another with the Mario Kart measurements and test conditions. [iOS archive build fix](https://github.com/seedds/nxnative/pull/3219) · [Mario Kart World test notes](https://github.com/seedds/nxnative/pull/3220)
