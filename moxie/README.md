# Moxie - bilingual deck-history hub

Public host: https://moxie.jaack.me. Existing Vercel project: moxie-guide.

## Source files
- data/hub.json: decks, journal entries and current tactical-guide sections, with Italian and English copy. The active deck guide_path links the October 1 Torpor Orb guide; the September guide and PDFs remain dated archives.
- data/versions/: dated card lists. Never overwrite an existing version; add a new ID.
- data/versions.sha256.json: immutable-snapshot integrity check.
- guide.json and guide.en.json: complete paired editions of the September 10 guide.
- hands.json: the 12 curated opening hands used to author the Italian guide.
- cards-reference.json: official card links.
- build_hub.py: static multilingual page renderer. build_site.py delegates here for compatibility.
- pdf_renderer.py: shared renderer for either PDF language.
- style.css, hub.css, app.js: mobile reading UI, global hub shell and progressive enhancement.
- seed_hub.py and build_guide.py (one-off provenance import and the original PDF builder) stay on the Mac: they read private local files and are not part of this repository or the build.
- collection-copy.json: paired IT + EN copy for the collection page (its hash is in translation-state.json).
- data/collection.json: sanitized public collection snapshot, written by build_collection.py.
- moxie-collection.js and moxie-collection.css: the interactive collection page.
- data/broodscale-plan.json: the public 13-month Modern purchase plan, copied
  verbatim from the supplied plan.json (26 October 2026); no private inventory.
- data/broodscale-progress.json: explicit actual progress, starting at month 1
  (November 2026), zero completed months, purchases and actual spend. The build
  never advances this from the clock or from planned spending.
- broodscale-copy.json: paired IT + EN narrative for the plan, reviewed via
  translation-state.json. Italian month notes come from the supplied plan.

## Modern purchase plan

`/it/modern/broodscale/` and `/en/modern/broodscale/` show the monthly budget,
carryover, planned purchases and all 13 playable 60 + 15 lists. Native details
keep later months compact; every list is available without JavaScript. The
shared List / Gallery / Deck controls load Scryfall images only on request.
The plan uses the supplied Scryfall EUR snapshot of 26 October 2026; later
months are estimates, excluding shipping, condition and language. Actual
progress is separate from these estimates. Only the public plan and public
card references are used; the build needs neither private inventory nor network.

Current play: Standard Mono Green Landfall online on Endstep; Modern on
Wednesdays at Golden Store Talenti, Rome. Dated journal entries remain historical.

Build, test and preview from the repository root:

    python3 moxie/build_hub.py
    python3 -m unittest discover -s moxie -p 'test_*.py'
    node --check moxie/app.js
    node --check moxie/cards.js
    node --check moxie/moxie-collection.js
    node --test tests/moxie-leak.test.cjs
    python3 -m http.server 8000 --directory moxie/dist

Open http://localhost:8000/it/modern/broodscale/ (or `/en/modern/broodscale/`).

## Content rules
Always ship IT | EN together on every page, entry and guide. Card names, counts,
record IDs and dates are language-independent. After translating and reviewing
changed guide content, update translation-state.json hashes; the build fails if
an edition changed without that step. The dated guide must match its linked
version exactly. Public journal results must link to the exact played snapshot
when known; otherwise use version_id: null. Planned sessions have no result.
Historical discrepancies remain visible and are never silently repaired by guesswork.

## Build and verify
Use Python for build_hub.py, test_guide.py and test_hub.py; run node --check app.js.
For PDFs, use the bundled ReportLab Python runtime and
pdf_renderer.render_pdf(guide['pages'], output_path, language).
The public output is dist only. It contains HTML/CSS/JS, PDFs and card-list text
exports. Do not upload private source notes, inventories, purchase histories,
.env files or secrets. The approved public Modern plan contains estimates for
future purchases, not a private purchase history.

This folder lives in the iJaack/Jaack repository as moxie/. Jekyll excludes it
(_config.yml), so GitHub Pages never publishes it under jaack.me. The Vercel
project moxie-guide (moxie.jaack.me) builds it from Git with Root Directory
moxie: moxie/vercel.json sets buildCommand `python3 build_hub.py` (standard
library only) and outputDirectory dist. dist/ is build output and is not
committed. The September guide PDFs are committed under pdf/ and copied into
dist by the build; regenerating them still needs ReportLab (pdf_renderer.py).
Read back public page/PDF hashes after publishing.

Private collection files (collection CSV, collection_hydrated.json,
cardmarket_prices.json, purchases, Scryfall caches, .env and .vercel) stay on
the Mac. .gitignore blocks them and tests/moxie-leak.test.cjs (part of
npm test) fails on those file names and on purchase, trade-list or credential
strings.

## Mobile-first contract
Check 320, 390 and 430 px widths, and the iPhone Duo window (about 466, 640–760 and 900–960 px): no horizontal overflow, 17 px reading text,
44 px primary tap targets, visible IT | EN, fixed navigation, equivalent-page
language switches with preserved hash, native expandable hand examples and a
lightweight PDF download. Guide pages keep the section sidebar from 640px up (a narrower column until 850px); below that, the section menu replaces it. The hub home places the next two chapters side by side from 900px. Back navigation must preserve restored scroll position.
Use the shared Forma foundation vendored in jaack-design-system/ (same zip sha
as jaack.me): token names, the type scale, 17 px reading text, hairlines, and
one glass panel (the top bar; the card lightbox is the earned second glass
while it is open). Theme follows the visitor's local clock, light from 07:00
to 18:59, with an Auto / Chiaro / Scuro switch stored in localStorage. The
soft gradient is static under prefers-reduced-motion. Moxie's own skin, in
jaack-moxie.css, is a collector's catalog: cool paper, an indigo accent
instead of Forma's gold, sans headlines, tabular counts, a thicker deck stripe
and a denser card gallery. No remote font. The root retains old guide anchors
through a compatibility redirect.

Deck-specific pages (deck, version, journal entry and guide) keep their identity
from data/hub.json colors on the stripe only (--deck-stripe). Multi-color
identities show every color in that split rule. Links and other text use the
catalog's --jk-accent-text so contrast stays WCAG AA on both themes.

## Interactive card views
Deck profiles, saved versions and guide boards offer List / Gallery / Deck views
in both languages. card-images.json contains only Scryfall reference image URLs
and names, never inventory or price data. The initial document requests no card
images; assets load when Gallery or Deck is selected. Deck mode browses unique
card entries with copy counts, not random draws. The native modal supports close,
keyboard navigation, double-faced cards, focus restoration and image-error fallback.
Run test_cards.py alongside the hub and guide regressions.

## Collection page
/it/collezione/ and /en/collection/ show the whole collection: totals (cards,
unique names, sets, total EUR value and the prices date), search, filters (set,
color, type, rarity, finish, language, deck), sorting (name, set, mana value,
quantity, value) and list/grid views that reuse the cards.js lightbox. Images
load lazily from cards.scryfall.io. Without JavaScript the page is a complete
static table.

Refresh the snapshot on a machine that has the private inventory, keeping the
source outside this repository:

    python3 build_collection.py /path/outside/repo/collection_hydrated.json

It refreshes EUR prices from the Scryfall collection API by printing id
(foil-aware, batches of 75, about 100 ms apart, with a User-Agent). If Scryfall
has no price for a printing, the earlier cached price is kept and flagged
price_source "snapshot". It writes only these card fields: name, set, collector
number, language, finish, count, type line, colors, color identity, rarity,
mana value, Scryfall page, card images, price and line value, price source and
deck membership. Prices paid, tags/provenance, trade-list counts, timestamps
and condition are never written. Commit data/collection.json; build_hub.py
reads only that file (and recomputes deck membership from the current
versions), so Vercel builds without any private data. test_collection.py and
tests/moxie-leak.test.cjs enforce the boundary.
