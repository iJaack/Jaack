---
title: "How to deploy a website on IPFS with ipfs-deploy"
layout: post
date: 2020-02-17 15:00
image: /assets/images/projects/IPFS/decentralizzare-web-ipfs.svg
headerImage: true
tag:
- blockchain
category: blog
tags: [research]
author: jaack
description: It works with static sites and is almost entirely user-friendly
published: true
lang: en
---

By popular demand, I publish a guide on how to deploy your website
on the decentralized web, on IPFS (Interplanetary File System). To get an idea
of what IPFS is, I wrote some slides [here]({{base}}/blockchain-201-ipfs-token-non-fungibili/).

<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fijaack94%2Fposts%2F10220740078835142&width=750&show_text=true&height=656&appId" width="750" height="656" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>

For simplicity, this guide has links to other guides (preparatory for this one) and specific instructions.

First of all: what does it mean to distribute a website on IPFS? Basically it means that, instead of connecting to my site using the gigantic servers of the companies that host most of the world's websites (Amazon, Facebook, Google), my site is reconstructed in the visitor user's computer by collecting bits coming from many different computers around the world, which can belong to ordinary people. A part of my website is also on my desktop computer at home. It is a beautiful example of content decentralization.

The advantage is that my site can **virtually never** go offline: if a computer goes offline, there are always others who reconstruct the rest. If, on the other hand, a Google datacenter goes offline, for a few moments all sites connected to Google in that datacenter are unreachable. Occasionally it happened with Facebook, which also drove the servers of Whatsapp and Instagram crazy.

### Requirements

To start, you need to see the requirements:
- A static website using the following frameworks: jekyll, hakyll, elevently, gatsby, hugo, hexo, nuxt, pelican, create-react-app, metalsmith, middleman, docusaurus and all websites that support content in the *site* and *docs* folders
- **npm** installed ([download npm](https://nodejs.org/en/download/))
- recommended: IPFS node installed locally - [How to install an IPFS node]({{base}}/installare-nodo-ipfs)
- an account on a data pinning service, recommended with Pinata - [How to configure the Pinata pinning service]({{base}}/configurare-pinning-pinata-ipfs)
- A Cloudflare account for DNS service

### Instructions
