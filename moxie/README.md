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
- seed_hub.py: initial provenance import only; normal builds do not rerun it or depend on temporary source backups.

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
exports. Do not upload source notes, inventories, purchases, .env files or secrets.

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
Check 320, 390 and 430 px widths: no horizontal overflow, 17 px reading text,
44 px primary tap targets, visible IT | EN, sticky navigation, equivalent-page
language switches with preserved hash, native expandable hand examples and a
lightweight PDF download. Back navigation must preserve restored scroll position.
Match the live jaack.me style: #0c0c0c background, #141414 surfaces, #f0ede8 text,
#aaa69f muted text and #e8c547 accent. Use native system sans-serif, 500-weight
headings with no italic display serif, yellow underlined actions and language
selection, and the dotted wordmark. No heavy framework or remote font dependency. The root retains old guide anchors through a compatibility redirect.

Deck-specific pages (deck, version, journal entry and guide) inherit their accent
from data/hub.json colors. Multi-color identities show all colors in a split rule;
links and controls use the first color. Hub-level pages use jaack.me yellow.

## Interactive card views
Deck profiles, saved versions and guide boards offer List / Gallery / Deck views
in both languages. card-images.json contains only Scryfall reference image URLs
and names, never inventory or price data. The initial document requests no card
images; assets load when Gallery or Deck is selected. Deck mode browses unique
card entries with copy counts, not random draws. The native modal supports close,
keyboard navigation, double-faced cards, focus restoration and image-error fallback.
Run test_cards.py alongside the hub and guide regressions.
