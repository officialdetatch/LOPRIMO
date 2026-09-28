# LO'PRIMO — official site

Plain HTML/CSS/JS, no build step, no framework. Open any `.html` file
in a browser and it works; upload the whole folder anywhere static
(GitHub Pages, Netlify, any host) and it works there too.

## Estado actual: página "Muy pronto" (pre-lanzamiento)

Ahora mismo `index.html` es una página de "Estamos preparando algo para
ustedes" con cuenta regresiva. La página de inicio real está guardada como
`index-live.html`.

**Para lanzar el sitio completo:**
1. Borra `index.html` (la página "Muy pronto").
2. Renombra `index-live.html` a `index.html`.
3. Sube todo el sitio.

**Fecha de la cuenta regresiva:** abre `index.html` y cambia `LAUNCH_DATE`
(dentro del `<script>`, formato `2026-11-01T00:00:00-04:00`).

**Para que las demás páginas no sean accesibles antes del lanzamiento:**
sube al hosting solo `index.html` y la carpeta `images/`. El resto se sube
el día del lanzamiento.

## Pages

| Page              | What it is                                              |
|--------------------|----------------------------------------------------------|
| `index.html`        | Home — next show, latest single, latest Instagram posts |
| `about.html`        | Bio + social links                                       |
| `shows.html`        | Full list of show dates                                  |
| `music.html`        | Singles, each with a YouTube embed + streaming links     |
| `contact.html`      | Contact form (Formspree)                                 |

## Editing content — the `*-writer.html` pages

You never touch the HTML/CSS/JS to update content. Each writer page
loads what's currently live, lets you edit it in a normal form, and
gives you back a finished file to save over the old one.

| Writer page          | Edits...                          | Produces...              |
|-----------------------|------------------------------------|----------------------------|
| `about-writer.html`   | Bio text + social links            | `assets/about-data.js`    |
| `shows-writer.html`   | Show dates                         | `assets/shows-data.js`    |
| `music-writer.html`   | Singles / videos                   | `assets/music-data.js`    |
| `posts-writer.html`   | Instagram posts shown on the home page | `assets/posts-data.js` |

Workflow for all four: open the writer page → edit → press **Download**
(or **Copy to clipboard**) → replace the matching file inside `assets/`
→ re-upload. Your in-progress edits are also auto-saved to your
browser's local storage, so refreshing or closing the tab won't lose
your draft.

These writer pages aren't linked from the site's navigation, but
they're not password-protected either — anyone with the URL can open
them. If that matters to you, delete the four `*-writer.html` files
and their matching `assets/*-writer.js` files before you upload the
site anywhere public, and keep a local copy for editing instead.

## Things to set up before going live

- **Logo & photos** — see `images/README.txt`. Nothing is broken without
  them, but the site looks much better with a real logo at minimum.
- **Contact form** — `contact.html`'s form needs your own Formspree
  endpoint (it's free). Instructions are in an HTML comment right above
  the `<form>` tag in that file. Until you do this, the form politely
  tells visitors to email you directly instead of silently failing.
- **Contact email** — replace `hello@loprimomusic.com` (a placeholder)
  with the band's real email in `contact.html` — it appears twice: the
  `SITE_CONTACT_EMAIL` script line and the `mailto:` link further down.
- **Custom domain** (optional) — if you're hosting on GitHub Pages and
  have a domain, add a `CNAME` file at the root containing just the
  domain name (e.g. `loprimomusic.com`), same as the old site had.

## What changed from the old fantasy-league site

Everything content- and league-specific is gone (standings, rosters,
free agents, team pages, the commissioner easter egg). What's kept is
the underlying pattern: one shared `assets/style.css` and
`assets/app.js`, small per-page data files, and the `*-writer.html`
editing tools — just re-themed and re-pointed at a band instead of a
league.

## 2026 revamp — Don Diablo-style touches, LO'PRIMO palette

- **New accent color**: `--olive: #3F5C33`, matching the green in the
  band logo's "LO'" mark. It's used for brand/identity elements
  (header underline, active nav link, hero headline accent, section
  headings, show-date numbers, outline buttons, the bio accent bar).
  The original amber stays exactly where it was — solid CTA buttons,
  tickets, the ticker, form focus states — so there are two colors
  with two clear jobs instead of one competing with the other.
- **Live countdown banner** on the home page (`#homeNextShow` in
  `index.html`, built by `nextShowBannerHTML()` / `startCountdown()`
  in `app.js`): shows Days/Hrs/Min/Sec ticking down to the next
  upcoming date in `shows-data.js`, with a ticket button. It counts
  down to midnight of the show's date (no show-time field exists yet
  — see below if you want to add one).
- **Filter tabs on the Shows page** (Todos / Próximos / Anteriores):
  client-side toggle between the upcoming and past lists, no page
  reload.

If you later want the countdown to target an exact show time instead
of midnight, add a `"time": "20:00"` field to a show in
`shows-data.js` and a matching tweak to `parseDate()`/`startCountdown()`
in `app.js` — ask whoever's maintaining the code (or Claude) to wire
it up.
