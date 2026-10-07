# Salone Lyrics

Lyrics, artists, releases, events and stories from Sierra Leone's music scene.

Live site: https://salonelyrics.vercel.app

## How the site works
- `index.html` is the complete site (CSS, JS, data and the Blackhood font are inlined). Vercel serves it as a static site; every push to `main` publishes automatically.
- Pages use the URL hash, for example `#artist.drizilik`, `#song.crush`, `#story.hottest-2025`, `#promote`.
- `source/` holds `app.css`, `app.js`, `data.js` and `shell.html` for porting to WordPress/Elementor. If you edit these, apply the same change to `index.html`.
- `assets/img/`, `assets/logo/`, `assets/fonts/`: images, logo versions and Blackhood (TTF + WOFF2).
- `asset-manifest.csv`: source and treatment for every image.

## Photos and permissions
- **Artist photos are not published yet.** Each artist (`assets/img/r-*`, except team `r-t-*`) shows a Pexels stand-in, credited on the page as "Illustrative image, not the artist". In the data these entries carry `stand:true`.
- To add an official artist photo once permission is given: replace the `r-<artist>` image files and update that artist's entry in `window.SL_PHOTOS` (in `source/data.js` and `index.html`) with the real source, and the size in `window.SL_DIMS` (in `index.html`).
- Team cards use labelled Pexels placeholder headshots until real team photos are supplied.

## Content notes
- Artist biographies, songs and releases are summarised from published sources, listed on each profile.
- Real song lyrics are not reproduced. Real songs show "Lyrics coming soon"; one labelled demo song shows the full lyric reader.
- Events and the six Guides/Features articles are labelled samples.
- Forms (newsletter, contact, lyric submission, enquiry) do not send data anywhere yet; they only show a confirmation on screen.
