# Newsreader (opt-in)

Self-hosted Newsreader for reading text: variable roman and static italic.
`Newsreader-roman.woff2` is 118,716 bytes and retains `wght` 400–700 and
`opsz` 6–72. The separate `Newsreader-italic.woff2` is 30,684 bytes, a fully
static instance at weight 400 only with `opsz` pinned at 18 (the axis default).
Bold-italic is synthesized. Both WOFF2 files cover Latin-1, Latin Extended-A and
selected punctuation/symbols in the identical Unicode ranges listed in `fonts.css`.
Latin Extended-B, Latin Extended Additional and IPA characters use the
metric-adjusted local/system fallbacks. Roman weights below 400 and above 700
are no longer packaged; select a fallback family explicitly for those weights
because browsers may otherwise match the nearest available Newsreader weight.

Source: [google/fonts, ofl/newsreader](https://github.com/google/fonts/tree/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/newsreader),
commit `8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5` (2026-03-12).
Upstream: `productiontype/NewsReader`, commit
`1ece6a8bfe5db1a2b90c76cc1fe5d3b2eed5dcf3`, as recorded in `METADATA.pb`.
The source `Newsreader[opsz,wght].ttf` SHA-256 is
`8a08d13f8a6c0d51be379a60af84f945f65369a67e509ee3c3bdcc421254d7c1`.
The italic source is `ofl/newsreader/Newsreader-Italic[opsz,wght].ttf` at the
same pinned google/fonts commit. Its SHA-256 is
`796668611f80b64d5adf182fde3b6f29ed83b4e7cbec7b96937e84ac01364792`.

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
The italic file is not preloaded; browsers load it on demand when italic text is
used. Only the Newsreader WOFF2 files are distributed; system fallback fonts stay local.

## Rebuild

Requires Python with fontTools 4.68 and brotli, the `pyftsubset` executable, and the
macOS fallback fonts below. No download runs. From the repository root:

```sh
tools/build-fonts.sh '/path/to/Newsreader[opsz,wght].ttf' '/path/to/Newsreader-Italic[opsz,wght].ttf'
```

Set `PYTHON` and `PYFTSUBSET` to executables in your environment if needed.
Both source arguments are required. The script limits roman to `wght=400:700`,
keeping optical size variable. It instantiates italic at `wght=400 opsz=18`,
removing both variable axes, then subsets all layout features with the same
options for both files. In the command below, `$style` is `roman` or `italic`,
`$input` is its source TTF,
`$output` is its corresponding `fonts/newsreader/Newsreader-{roman,italic}.woff2`
path, and `$instance` is a temporary file. The fixed build timestamp preserves
the existing roman bytes and makes both font outputs reproducible:

```sh
export SOURCE_DATE_EPOCH=1794431893 # 2026-11-11 21:18:13 UTC
case "$style" in
  roman) set -- wght=400:700 ;;
  italic) set -- wght=400 opsz=18 ;;
esac
"${PYTHON:-python3}" -m fontTools.varLib.instancer "$input" "$@" -o "$instance"
"${PYFTSUBSET:-pyftsubset}" "$instance" \
  --output-file="$output" \
  --unicodes="U+0000-00FF,U+0100-017F,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD" \
  --layout-features='*' --flavor=woff2 --no-hinting \
  --name-IDs='*' --name-languages='*' --no-recalc-timestamp
```

The script also regenerates `fonts.css`. It uses fontTools to instantiate the
roman source at `wght=400` and its actual `fvar` default `opsz=18` (the metadata registry
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
build. With the supplied sources and toolchain, the packaged roman is 118,716
bytes and the static italic is 30,684 bytes. Both the font build and `tools/check.sh`
enforce separate budgets: 120,000 bytes for roman and 70,000 bytes for italic.
