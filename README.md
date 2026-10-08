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
- **Artist photos** (`assets/img/r-*`, except team `r-t-*`) were supplied for the site and processed to match the design: background removed, black and white. In `window.SL_PHOTOS` they carry `artist:true` and the credit reads "Photographer credit to be added" until names are confirmed.
- Kracktwist and Rozzy Sokota have no supplied photo yet (`photo:null`), so their profiles show "Official artist photograph to be supplied".
- To add or replace an artist photo: replace the `r-<artist>` image files, update that artist's entry in `window.SL_PHOTOS` (in `source/data.js` and `index.html`), and its size in `window.SL_DIMS` (in `index.html`).
- **Release covers** live in `assets/img/cover-<release>-[500|1000].webp`; a release with `cover:true` shows its cover instead of a typographic tile.
- Team cards use labelled Pexels placeholder headshots until real team photos are supplied.

## Content notes
- The 15 main artist profiles follow the researched profile document, in its display order. Each lists its sources; proposed story headlines show as "Coming soon".
- Real song lyrics are not reproduced. Real songs show "Lyrics coming soon"; one labelled demo song shows the full lyric reader.
- Events are real listings; venues, times and ticket links are added as organisers confirm them. The six Guides/Features articles are labelled samples.
- Forms (newsletter, contact, lyric submission, enquiry) do not send data anywhere yet; they only show a confirmation on screen.
