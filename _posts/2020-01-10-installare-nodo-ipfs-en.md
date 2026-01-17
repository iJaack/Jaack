---
title: "How to install an IPFS node"
layout: post
date: 2020-01-20 12:00
image: /assets/images/projects/IPFS/ipfs-desktop.png
headerImage: true
tag:
- blockchain
category: blog
author: jaack
description: Join the decentralization!
published: true
lang: en
---
<pre>Note: this little guide is part of a series of guides to learn about and develop on IPFS. <a href="{{base}}/distribuire-sito-web-ipfs">Click here</a> to go to the main page of the guide.</pre>

To install an IPFS node, the instructions are very simple.

First of all, just go to the [Release page on Github of the IPFS project](https://github.com/ipfs-shipyard/ipfs-desktop/releases) and select the *ipfs-desktop* file followed by version number and operating system.

<img class="image" src="{{base}}/assets/images/projects/IPFS/ipfs-desktop-github.png" alt="The Release page of IPFS Desktop on Github">

Once the file is downloaded, simply run it to proceed with the installation.

Once installed, upon first run the operating system will give a security warning. On MacOS, just go to Settings -> Security & Privacy and select 'Open Anyway' after opening the lock in the bottom left corner of the window.

<img class="image" src="{{base}}/assets/images/projects/IPFS/ipfs-desktop-allow.png">

A new banner will appear informing that IPFS is trying to listen to events on the external network: you must click OK and continue, otherwise the app will not be able to communicate with the network to send files synchronized locally.

The IPFS Desktop app is very intuitive: no additional configuration is needed in the settings. The **Status** tab indicates the connection status.

<img class="image" src="{{base}}/assets/images/projects/IPFS/ipfs-desktop-status.png" alt="The Status tab of IPFS Desktop">

In the **Files** tab you can view files downloaded from the IPFS network and it is also possible to add files to IPFS, a bit like I did for the research on [IPFS and non-fungible tokens]({{base}}/blockchain-201-ipfs-token-non-fungibili/).

<img class="image" src="{{base}}/assets/images/projects/IPFS/ipfs-desktop-files.png" alt="The Files tab of IPFS Desktop">

The **Explore** and **Peers** tabs serve to explore content on IPFS and other users who are sharing their resources for the good of network decentralization.

Installing IPFS Desktop is just the first step towards decentralization! :rocket:
