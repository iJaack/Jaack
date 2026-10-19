# Jaack

Personal website for Giacomo Barbieri, published at https://jaack.me.
Jekyll builds the site; GitHub Pages publishes the root of the master branch.

## Local development

Use Ruby 3.3 and Bundler, plus Node.js 18 or later for the JavaScript checks.
No npm dependencies are required.

```sh
bundle install
npm run check
bundle exec jekyll serve --config _config.yml,_config-dev.yml --host 127.0.0.1
```

On macOS with Homebrew's Ruby 3.3, add its bin directory to your shell's PATH
before running these commands.

## Content

- Homepage: index.html
- Work entries: _data/projects.yml (English and Italian, with role and stage)
- Project pages: projects/*/index.md, _layouts/project.html, and _data/project_notes.yml
- Curated reading paths: _data/reading_paths.yml; the full archive remains in blog.html
- Current focus: now.md and the homepage summary
- Biography: _includes/about-body.html, shared by both existing About URLs
- Writing: _posts; homepage selections use their existing slugs
- Navigation: _data/ui_text.yml

Keep release claims grounded in the relevant public product or release system.
A development entry does not imply an App Store release or protocol launch.
Older articles retain their original dates and describe the system at that time.
Review the current profile and initiative registry before changing roles or
project status. Current public title: DevRel at Team1 (started 5 October 2026),
working with builders across Avalanche while continuing Team1 Italy coordination.
Use DevRel publicly; the Lead title is deferred. The personal portfolio and advisory
work remain distinct from Team1. Routescan is a former role, ending in May 2026; its older
articles are historical context. The shared author biography describes the
current role and is separate from those article bodies.

## Checks

`npm run check` validates JavaScript syntax, builds the full site, runs
language-switch unit tests, and checks the generated pages for navigation,
local links and anchors, metadata, content states, and retained special pages.

Inspect English and Italian at desktop and phone widths after layout changes.
The existing wide research articles have their own styles and scripts.

All shared pages use a fluid shell capped at 1440px. Desktop layouts in
`_sass/pages/wide-layout.sass` add columns for collections, priorities and project
details at 960px; smaller screens keep the stacked layouts. Article prose stays
within 720px while figures and tables can expand to 1120px. Custom research
components retain their own layouts, with margin notes kept inside the page.

## Hosting

The canonical domain is jaack.me. Its Cloudflare configuration and the GitHub
Pages certificate are managed outside this repository.

A Cloudflare HTTP 526 response cannot be fixed by changing page content.
Check the origin certificate and GitHub Pages custom-domain health before
calling a deployment available. Keep HTTPS verification enabled.

On 6 September 2026, a Cloudflare 526 was resolved by making the four GitHub
Pages apex A records DNS-only and setting www to a DNS-only CNAME to
ijaack.github.io. Re-registering the custom domain provisioned a certificate
for both names. GitHub Pages enforces HTTPS. Keep the website records DNS-only
so certificate validation and renewal can reach GitHub directly.

Homepage visuals use the existing GMS brand cover, Eva interface preview, app icons, and a
Pommidoro iPhone screenshot. Hundred uses a text monogram. Images are resized
for the site; the screenshot is a product preview, not a live timer.

Eva's featured cover is an unaltered screenshot of the public
[Eva Protocol homepage](https://eva.jaack.me/), captured on 19 October 2026
(1425 × 748 image). Both featured covers use a 40:21 aspect ratio. The proof record and market
signals visible inside it are a dated interface preview, not live portfolio data.

The team1 featured card uses the unmodified `Team1_MAIN_WHITE.svg` wordmark from
`AvalancheTeam1/common`, `brand/assets/text/SVG/`, source commit
`9d1b3d1a9d9e3e254149885605504c6dfd84ec54`. Its image is the unmodified artwork
attached to [Giacomo's 16 October DevRel announcement](https://x.com/ijaack94/status/2111136683299054031/photo/1),
saved as `assets/images/work/team1-announcement.jpg` (1672 × 941). It replaces the
venue photograph. The full illustration stays visible without cropping its text.

Evalanche's cover is an unaltered screenshot of [its public homepage](https://evalanche.xyz/),
captured on 19 October 2026 (1247 × 663). Its logo is an unmodified copy of the
published [favicon](https://evalanche.xyz/favicon.svg), retrieved the same day.
The preview is a dated image of the product site. A CSS crop hides the source
screenshot's white left edge and the scrollbar at the bottom of its code panel.
