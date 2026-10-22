# jaack design system

A data-free design system for jaack.me pages, subpages and subdomains. It is extracted from a private dashboard, but this package contains **no data, no endpoints and no secrets**: every number in `demo.html` is a placeholder generated in `demo.js`.

```
jaack-design-system/
  README.md            this guide
  tokens.css           colours (light/dark), type scale, spacing, densities, radii, hairlines, shadows, motion
  theme.js             light/dark by local clock + Auto/Chiaro/Scuro switch (load blocking in <head>)
  jaack.css            bundle: tokens.css + components/*.css
  jaack.js             bundle: components/*.js (load with defer)
  build.sh             rebuilds the two bundles from the sources
  components/          one .css (+ .js where needed) + .html snippet per component
  demo.html, demo.js   every component on one page, PLACEHOLDER content
  screenshots/         demo in light and dark (1440, 1440 full page, 390, 2560)
```

## Quick start

```html
<head>
  <meta name="color-scheme" content="light dark">
  <script src="/theme.js"></script>              <!-- blocking: sets data-theme before first paint -->
  <link rel="stylesheet" href="/jaack.css">
  <script src="/jaack.js" defer></script>
</head>
<body>
  <div class="jk-bg" aria-hidden="true"><i></i><i></i><i></i></div>
  <header class="jk-top jk-glass"> … <span data-jk-theme-switch></span></header>
  <main class="jk-page"><div class="jk-chs"> chapters … </div></main>
</body>
```

Everything is prefixed `jk-` (classes) and `--jk-` (custom properties), so it can sit next to existing CSS.

## Principles

1. **Containers are earned.** Open layout is the default: hierarchy comes from type, spacing and 1 px hairlines (`--jk-hair`), not boxes. Use **at most one glass block per screen** besides the top bar, for a summary or side panel, a sheet or a tooltip. Rows, stats and charts sit on the page.
2. **Scroll moves the background, never the data.** Layer 0 (`.jk-bg`) may drift and parallax at 0.2× scroll, capped. Numbers, rows and charts never translate, scale or parallax. Groups may fade in with **opacity only** (`.jk-fx`). Charts get their size before they draw, so nothing shifts.
3. **4 px spacing scale and compact densities.** `--jk-s1…s18` = 4…72 px. Current densities:
   - rows about 36 px (`--jk-row-pad: 7px`)
   - 28 px between groups
   - 24 px from the chapter header to the hero
   - 64 px between chapters on desktop, 40 on mobile, with the hairline in the middle
   - no section should leave more than ~80 px of unused vertical space or a large empty column
4. **Grey-opacity hierarchy.** Text uses one ink colour at decreasing opacity: `--jk-ink` (primary) → `--jk-t2` (.70) → `--jk-t3` (.64 light / .56 dark, the lowest allowed for text). Colour is for data marks and states, never the only signal.
5. **A comparison next to every big number.** Each `.jk-big` / `.jk-mid` gets a `.jk-cmp` line beneath: a target, yesterday, the 7/30-day average or the previous period. A missing value reads `nessun dato` (`.jk-na`), never 0.
6. **Editorial chapters.** A page is a sequence of chapters (`.jk-ch`), each answering one question. A chapter has:
   - a numeral, an eyebrow, the question and a one-line lede
   - **one** hero number, then a figure, then groups
   - the title inline above the content (no empty title column)
   - ≥ 1920 px: chapters become 2 columns; ≥ 2560 px: 3 columns. No wide empty strips.
7. **Light/dark by the local clock.**
   - `theme.js` picks light from 07:00 to 18:59 and dark otherwise, before first paint. It re-checks every minute, on focus and on visibility change, and cross-fades for 0.4 s.
   - The **Auto / Chiaro / Scuro** switch stores an override in `localStorage` (`jaack.theme`). `?theme=light|dark` works for previews.
   - Options: `<script src="/theme.js" data-light-from="7" data-light-to="19" data-key="jaack.theme">`.
8. **Reduced motion.** Under `prefers-reduced-motion: reduce` the background drift and parallax, the fade-ins, the theme cross-fade, the pill spring and the sheet animation are all off. `theme.js` also adds `html.jk-rm`.
9. **Accessibility (AA).**
   - All text is ≥ 4.5:1 on the page background in both themes (demo minimum: light 4.78, dark 5.87). The logo dot is a brand mark and exempt.
   - Interactive elements: visible `:focus-visible` rings, about 40 px targets, keyboard support in the pill (← →) and sheet (Esc).
   - Charts need `role="img"` + `aria-label`.
   - Status colours always come with a word or a marker shape.
10. **CSP: no inline scripts.**
    - All JS ships as external files. The pages this comes from run with: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'`.
    - `style-src 'unsafe-inline'` is only needed for the few `style=""` attributes in the demo (for example `--jk-cols` on a row list). Replace them with classes if your CSP forbids inline styles.

## Tokens (tokens.css)

| Group | Tokens |
|---|---|
| Surfaces | `--jk-bg` (#f7f5f0 / #121314), `--jk-surface`, `--jk-surface-2` |
| Text | `--jk-ink`, `--jk-ink-2`, `--jk-t2`, `--jk-t3` |
| Lines | `--jk-hair` |
| Accent | `--jk-accent` (gold; `--jk-accent-text` for text use), `--jk-amb` (warning text) |
| States | `--jk-ok`, `--jk-fail`, `--jk-info` |
| Data marks | `--jk-c-blue/orange/yellow/green/cyan/purple/pink/red` (charts only, not text) |
| Glass | `--jk-tint`, `--jk-tint-hi`, `--jk-tint-edge`, `--jk-rim`, `--jk-rim-lo`, `--jk-glow`, `--jk-drop` |
| Background veil | `--jk-bg-1…3` (+ `b` variants) |
| Type | `--jk-font`, `--jk-fs-xs` 12.5 · `sm` 13 · `note` 14 · `body` 16 · `lede` 17 · `title` clamp(30–44) · `mid` clamp(36–52) · `big` clamp(56–120) · `deco` clamp(96–150) |
| Spacing | `--jk-s1`…`--jk-s18` (4 px steps), `--jk-row-pad`, `--jk-group-gap`, `--jk-hero-gap`, `--jk-chapter-gap(-m)`, `--jk-page-x`, `--jk-topbar-h` |
| Radii | `--jk-r-xs` 8 · `s` 14 · `m` 20 · `panel` 24 · `l` 26 · `xl` 34 · `pill` 999 |
| Motion | `--jk-ease`, `--jk-spring`, `--jk-d-fast` .15 s · `fade` .4 s · `theme` .4 s · `draw` .6 s · `pill` .35 s; background drift 32–40 s |

Breakpoints are 768, 900, 1100, 1920 and 2560 px. Inside components prefer container queries: each chapter body (`.jk-cb`), group (`.jk-group`) and hero (`.jk-hero`) is an inline-size container.

## Components

| Component | Files | Notes |
|---|---|---|
| Top bar | `topbar.css`, `topbar.html` | Floating glass pill: wordmark, tag, link pills, theme switch. Content scrolls under it; reserve `--jk-topbar-h`. |
| Chapter header | `chapter.css`, `chapter.html` | `.jk-ch` > `.jk-ct` (6 % numeral, eyebrow, question, lede) + `.jk-cb` body. `.jk-duo` puts two short groups side by side; `.jk-split` puts the main column beside one glass `.jk-aside`. |
| Hero number + comparison | `hero.css`, `hero.html` | `.jk-big` + `.jk-cmp`; optional `.jk-sec` secondary number beside it after a hairline (stacks below 820 px of container). `.jk-mark.neg/.pos` is a non-text sign marker. `.jk-chip` for deltas. |
| Hairline row list | `rows.css`, `rows.html` | `<ul class="jk-rows">`, columns via `--jk-cols`, `.jk-opt` columns hide below 520 px. `.jk-alerts` lays alerts side by side from 900 px. |
| Stat row | `stats.css`, `stats.html` | `.jk-stats` (4 cells) / `.jk-stats.two`, vertical hairlines, collapses 4 → 2 → 1. Optional `.jk-viz` spark. |
| Glass panel / sheet | `glass.css`, `glass.html`, `sheet.js` | `.jk-glass.jk-panel`. `<dialog class="jk-sheet jk-glass">` opened by any `[data-jk-sheet="#id"]`; closes on Esc, × or backdrop; focus returns to the opener. |
| Nav pill | `navpill.css`, `navpill.js`, `navpill.html` | Segmented control with a sliding indicator. `.jk-dock` for bottom chapter nav (hidden ≥ 1920); `.flat` for a period switch. `JaackPill.init(el, onChange)`. |
| Tooltip | `tooltip.css`, `tooltip.js`, `tooltip.html` | `[data-jk-tip="…"]` on hover/focus (textContent, safe). `JaackTip.scrub(box, n, html)` for chart scrubbers; only pass strings you built. |
| Theme switch | `themeswitch.css`, `themeswitch.html`, `../theme.js` | `<span data-jk-theme-switch>` or `JaackTheme.mount(el)`. Icons only below 760 px. |
| Animated soft gradient background | `background.css`, `background.html`, `background.js` | Three slow drifting discs, transform only. Parallax 0.2× capped, off < 768 px and with reduced motion. |
| Base | `base.css`, `fade.js` | Page frame, type roles (`.jk-lab`, `.jk-big`, `.jk-mid`, `.jk-u`, `.jk-cmp`, `.jk-note`, `.jk-na`), focus rings, opacity-only fade-in, theme cross-fade. |

## Charts

The design system does not ship a chart library: `demo.js` draws simple SVGs only to show the look. Rules:

- **Heights:** main charts `max(160, min(27 % viewport height, 24 % width, 300))` px; sparks 72–112 px.
- **Bars:** rounded, warm gradient (`--jk-c-yellow` → `--jk-c-orange`). The partial or current period is dashed or outlined.
- **Lines:** 3–3.5 px, round joins, the last point marked.
- **Axes:** hairline gridlines, labels in `--jk-t2` 11–12 px on the right.
- **Values on hover:** a scrubber tooltip and hairline (`JaackTip.scrub`).
- **Drawing:** charts draw once, when 30 % visible (or immediately with reduced motion), and never animate on scroll.

## Rules for the Builder

- Do not copy any data, endpoint or analytics from the source dashboard; this package has none.
- Keep the theme script blocking in `<head>`, so it runs before first paint.
- Keep JS external (CSP).
- Re-run `./build.sh` after editing sources.
- Check every new page at 390, 1440×900, 1920, 2560 and 3440, in light and dark, with reduced motion on and off.
