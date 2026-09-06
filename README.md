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
project status. Routescan is a former role, ending in May 2026; its older
articles are historical context. The shared author biography describes the
current role and is separate from those article bodies.

## Checks

`npm run check` validates JavaScript syntax, builds the full site, runs
language-switch unit tests, and checks the generated pages for navigation,
local links and anchors, metadata, content states, and retained special pages.

Inspect English and Italian at desktop and phone widths after layout changes.
The existing wide research articles have their own styles and scripts.

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

Homepage visuals use the existing GMS brand cover, Eva mark, app icons, and a
Pommidoro iPhone screenshot. Hundred uses a text monogram. Images are resized
for the site; the screenshot is a product preview, not a live timer.
