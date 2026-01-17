---
title: "How to install an IPFS node on a VPS server"
layout: post
date: 2020-01-31 12:00
image: /assets/images/ipfs-node-install.jpg
headerImage: true
tag:
- blockchain
- tech
- ipfs
category: blog
author: jaack
description: Setup guide
published: true
lang: en
---

Web 3.0 is coming, and InterPlanetary File System (IPFS) is one of its fundamental pillars. If you want to contribute to the network or simply want to host your files in a decentralized way, installing an IPFS node on a server is a great starting point.

In this guide we will see how to install `go-ipfs` (the Go implementation of IPFS) on a VPS with Ubuntu 18.04.

## Prerequisites
- A VPS with Ubuntu 18.04 (DigitalOcean, Vultr, Hetzner, etc.)
- Access via SSH
- Basic knowledge of the terminal

## 1. Download and Install
First, access your server via SSH.
Then download the latest version of ipfs (check on the official site for updates):

```bash
wget https://dist.ipfs.io/go-ipfs/v0.4.23/go-ipfs_v0.4.23_linux-amd64.tar.gz
```

Extract the archive:
```bash
tar -xvzf go-ipfs_v0.4.23_linux-amd64.tar.gz
```

Run the installation script:
```bash
cd go-ipfs
sudo bash install.sh
```

Check that the installation was successful:
```bash
ipfs --version
```

## 2. Initialize the Node
Now initialize the node. It is important to do this as the user who will run the process, not necessarily root (better to create a dedicated user).

```bash
ipfs init
```

This command generates the key pair for your node (PeerID) and the configuration folders in `~/.ipfs`.

## 3. Run as Service (Systemd)
To ensure that IPFS starts automatically upon checking and stays active, we create a systemd service.

File: `/etc/systemd/system/ipfs.service`

```ini
[Unit]
Description=IPFS Daemon
After=network.target

[Service]
User=root
ExecStart=/usr/local/bin/ipfs daemon
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ipfs
sudo systemctl start ipfs
```

Check the status:
```bash
sudo systemctl status ipfs
```

## 4. Open Ports (Optional)
If you use a firewall (UFW), remember to open the ports necessary for IPFS:
- 4001/tcp (Swarm)
- 4001/udp (Swarm)
- 5001/tcp (API - Be strict with this, do not open it to the public!)
- 8080/tcp (Gateway)

```bash
sudo ufw allow 4001/tcp
sudo ufw allow 4001/udp
sudo ufw allow 8080/tcp
```

**Security Warning**: Never open port 5001 to the public internet unless you know exactly what you are doing. It gives full control over your node.

## Conclusion
Your IPFS node is now active and part of the network!
You can add files with `ipfs add filename` and view them through any IPFS gateway using the returned hash.

Welcome to the distributed web.
