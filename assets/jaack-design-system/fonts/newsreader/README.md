# Newsreader (opt-in)

Self-hosted, upright variable Newsreader for reading text. The WOFF2 retains
`wght` 200–800 and `opsz` 6–72, with only the Latin / Latin Extended Unicode
ranges listed in `fonts.css`. Italic is not included.

Source: [google/fonts, ofl/newsreader](https://github.com/google/fonts/tree/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/newsreader),
commit `8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5` (2026-03-12).
Upstream: `productiontype/NewsReader`, commit
`1ece6a8bfe5db1a2b90c76cc1fe5d3b2eed5dcf3`, as recorded in `METADATA.pb`.
The source `Newsreader[opsz,wght].ttf` SHA-256 is
`8a08d13f8a6c0d51be379a60af84f945f65369a67e509ee3c3bdcc421254d7c1`.

Licensed under the **SIL Open Font License 1.1**; `OFL.txt` is copied verbatim
from the source. No Reserved Font Name is declared in that file. Copyright
2020 The Newsreader Project Authors. Keep the licence with redistributed copies.

## Use

Link the stylesheet separately from `jaack.css`. It is never imported by
`components/reading.css`; sites choose whether to load it. Paths are relative to
the site's existing vendor directory:

```html
<link rel="stylesheet" href="/vendor/jaack-design/jaack.css">
<link rel="stylesheet" href="/vendor/jaack-design/fonts/newsreader/fonts.css">
<!-- Optional: preload the same URL resolved by fonts.css. -->
<link rel="preload" href="/vendor/jaack-design/fonts/newsreader/Newsreader-roman.woff2"
      as="font" type="font/woff2" crossorigin>
```

`.jk-prose` uses `--jk-font-read`, including the metric-adjusted Iowan and Georgia
local fallback faces defined here. Fonts use `font-display:swap`.
Only the Newsreader WOFF2 is distributed; system fallback fonts stay local.

## Rebuild

Requires Python with fontTools and brotli, the `pyftsubset` executable, and the
macOS fallback fonts below. No download runs. From the repository root:

```sh
tools/build-fonts.sh '/path/to/Newsreader[opsz,wght].ttf'
```

Set `PYTHON` and `PYFTSUBSET` to executables in your environment if needed.
The exact subset command run by the script (with `$source_font` pointing at the
provided TTF) is:

```sh
pyftsubset "$source_font" \
  --output-file=fonts/newsreader/Newsreader-roman.woff2 \
  --unicodes="U+0000-00FF,U+0100-024F,U+0259,U+1E00-1EFF,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2190-21FF,U+2212,U+2215,U+FEFF,U+FFFD" \
  --layout-features='*' --flavor=woff2 --no-hinting \
  --name-IDs='*' --name-languages='*' --no-recalc-timestamp
```

The script also regenerates `fonts.css`. It uses fontTools to instantiate the
source at `wght=400` and its actual `fvar` default `opsz=18` (the metadata registry
override of 16 does not change that default). The weighted sample uses standard
English a–z frequencies, normalized to 81.82% of the sample, plus 18.18% space;
the full frequency table and raw calculated numbers are in the generated CSS.
It averages `hmtx` advances, normalized by each font's `unitsPerEm`, without kerning.

Fallback inputs are `/System/Library/Fonts/Supplemental/Iowan Old Style.ttc`
(the `IowanOldStyle-Roman` face) and
`/System/Library/Fonts/Supplemental/Georgia.ttf`. Their metrics are read from the
real files; no guessed metrics are used. The formulas are:

- `size-adjust = normalized Newsreader average / normalized fallback average`
- `ascent-override = Newsreader hhea.ascent / (unitsPerEm × size-adjust)`
- `descent-override = abs(Newsreader hhea.descent) / (unitsPerEm × size-adjust)`
- `line-gap-override = Newsreader hhea.lineGap / (unitsPerEm × size-adjust)`

CSS percentages round to two decimals. Rebuilding metrics needs these same
system font versions; it is separate from the ordinary cross-platform bundle
build. The packaged WOFF2 is 207,040 bytes with the supplied source and toolchain.
