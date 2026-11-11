# PR C — audit and production choices

Baseline: `d8bfb55` (PR A + B). The worktree has no `AUDIT.md`; the supplied PR C brief is the audit source.

- **H2 scale and weight:** production uses sans 650 on many pages and serif 650 in posts. Apply the explicit audit: Newsreader 450, standard 32/42 below 1100px and 43/56 above, including About. Team1 keeps its existing smaller sizes with explicit 28px leading; only heading metrics change.
- **Related heading size:** PR B shipped 24/28. Keep that compact size, changing to serif 450 as instructed. Should it later join the full H2 scale?
- **Single note:** replace production's small title and sans body with the requested H1 scale and Newsreader 18/28, 26em text-page measure.
- **Speaking content:** keep only the existing 2022–2024 talks. The audit's proposed “go to Team1 / book a call” line requires a content decision and is not added. 2025–2026 entries remain PR D.
- **IPFS production URL choice:** preserve `/installare-nodo-ipfs-en/` for the VPS guide already live and tested by PR B. Assign `/installare-nodo-ipfs-desktop-en/` to the distinct Desktop EN article and pair it with `/installare-nodo-ipfs/`. This removes a build collision; confirm the new Desktop slug before any publication. No redirect can distinguish two articles formerly sharing one URL.

Team1 scope: this is ordinary heading maintenance on Jaack's personal, existing static event deck, not a new official application or deployment. Read the mandatory local V2 Oct 2026 guide. The linked current Google Doc was inaccessible on 12 November 2026; no content, infrastructure, data, integration or deployment changes are made.

Legacy migration: the 48,255-byte inline sheet is removed from the default layout. A 15KB external `site-structure.css` retains measured layouts and media rules, using existing typography/color/radius tokens and 14px main-content margins. The 65% root reference remains for archived inline/rem content; removing that reference needs a separate content-level migration. No active `_sass` dependency remains. Dormant Sass source files are retained for history. Carta currently uses the existing video/paper-stage component, not a Sass carousel. Its styles and controls remain in `jaack-site.css` and the existing project-video script.

Migration evidence (measurement code and raw reports are in the sibling `Jaack-builder-audit-c-inputs/pr-c-evidence/`, outside the repository):

| Surface | Rules still needed and retained |
| --- | --- |
| Home | Hero composition, featured grids, app previews, contact layout. The writing list uses the common rows. |
| Writing / Notes / Speaking | Reading-path columns and anchor clearance, note section/header metadata. Old archive `.item`, `.writing-entry`, note-title H3, pills and list-grid rules are unused. |
| Single note / About | Note metadata plus the existing `.jk-prose` and stacked portrait treatment; no inherited small note-title rule. |
| Projects / project | Responsive work/app grids, family grouping, facts, artwork, next actions. |
| Team1 / harness | Existing shared frame; Team1 retains its dedicated stylesheet and scripts. |
| Posts | Text/figure width constraints, author and previous/next layout. Diagram detection remains SVG paths or explicit `.figure--diagram`, never a heuristic applied to all raster images. Ombra syntax colors remain in `jaack-site.css`; old light Pygments rules are discarded. |
| Podcast / archived illustrations | Existing `.side-by-side` columns and image sizing; no podcast redesign. |
| Carta | Existing video stage, poster, ratios, captions, accessible controls and scoped script remain intact. No legacy carousel selectors exist in this revision. |
| Newsletter / 404 / footer / navigation | Shared frame, centering and original chrome metrics retained, including the PR A wordmark and footer. |

The survey compares computed properties with the inline sheet enabled/disabled across 231 non-redirect default-layout pages at 390/1280. Source review covers variable-based shorthand borders, pseudo states and keyboard focus that CSSOM differences alone can miss. Browser regressions also cover 669px, overflow, the 14px nav gap, row alignment, hover/focus and target sizes. The redirect stub is excluded from the cascade survey because it navigates during measurement.

The archived `.side-by-side` wrapper used 120% width and depended on hidden overflow on the desktop podcast. During migration it is capped at 100% of its container; its two columns and content remain. The site overrides the vendored `body` overflow with `clip`, and layout tests detect actual document overflow.

IPFS pairing evidence: there is no Italian VPS counterpart in this repository. The old slug heuristic incorrectly paired it with the Desktop article. Only these three IPFS posts now use an explicit translation key; the existing PR B pairing behavior for other posts is unchanged. The VPS guide therefore has no hreflang alternate, while the Desktop EN/IT pair is reciprocal.

Final source review found active ACP-255 custom CSS overriding the common H2/H3 rules. Those research headings now use the audit level tokens and Newsreader 450 for H2. The custom ACP post H1 remains its shipped sans/overlapping-title treatment because the brief forbids reopening PR B post-template decisions; bringing that H1 onto the standard scale remains an explicit open question. The representative standard-post H1 checks still pass.
