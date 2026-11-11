# PR C — audit and production choices

Baseline: `d8bfb55` (PR A + B). The worktree has no `AUDIT.md`; the supplied PR C brief is the audit source.

- **H2 scale and weight:** production uses sans 650 on many pages and serif 650 in posts. Apply the explicit audit: Newsreader 450, standard 32/42 below 1100px and 43/56 above, including About. Team1 keeps its existing smaller sizes with explicit 28px leading; only heading metrics change.
- **Related heading size:** PR B shipped 24/28. Keep that compact size, changing to serif 450 as instructed. Should it later join the full H2 scale?
- **Single note:** replace production's small title and sans body with the requested H1 scale and Newsreader 18/28, 26em text-page measure.
- **Speaking content:** keep only the existing 2022–2024 talks. The audit's proposed “go to Team1 / book a call” line requires a content decision and is not added. 2025–2026 entries remain PR D.
- **IPFS production URL choice:** preserve `/installare-nodo-ipfs-en/` for the VPS guide already live and tested by PR B. Assign `/installare-nodo-ipfs-desktop-en/` to the distinct Desktop EN article and pair it with `/installare-nodo-ipfs/`. This removes a build collision; confirm the new Desktop slug before any publication. No redirect can distinguish two articles formerly sharing one URL.

Team1 scope: this is ordinary heading maintenance on Jaack's personal, existing static event deck, not a new official application or deployment. Read the mandatory local V2 Oct 2026 guide. The linked current Google Doc was inaccessible on 12 November 2026; no content, infrastructure, data, integration or deployment changes are made.
