# Salone Lyrics

Find and read the lyrics to Sierra Leonean songs, and meet the artists behind them.

Live site: https://salonelyrics.vercel.app

## How the site works
- `index.html` is the complete site (CSS, JS, data and the Blackhood font are inlined). Vercel serves it as a static site; every push to `main` publishes automatically.
- Pages use the URL hash, for example `#lyrics`, `#song.crush`, `#artist.drizilik`, `#stories`, `#story.drizilik-krio-afro-fusion`. Old `#news` links still open Stories.
- `source/` holds `app.css`, `app.js`, `data.js` and `shell.html` for porting to WordPress/Elementor. If you edit these, apply the same change to `index.html`.
- `assets/img/`, `assets/logo/`, `assets/fonts/`: images, logo versions and Blackhood (TTF + WOFF2).
- `asset-manifest.csv`: internal record of the source and treatment of every image. Photo credits are not shown on the site.

## Lyrics pages
- Every song, including every track on the six albums, has its own lyrics page (`songs` in `source/data.js`). Album tracks carry `release` and `track`.
- Lyrics are only published with the artist's or publisher's approval. A song with approved lyrics gets a `lyrics` array (sections of lines) and the page shows the full lyric reader. Until then the page shows "Lyrics coming soon" followed by **Listen**.
- `listen.links` holds verified song links (Apple Music and Deezer from their official catalogues, plus song links verified in the artist profile document). `listen.embed` is the official player loaded only when a visitor presses "Play while you read".
- Where no song link is verified for a platform, the artist's verified profile shows as "Visit Artist on [Platform]".

## Photos and permissions
- **Artist photos** (`assets/img/r-*`, except team `r-t-*`) were supplied for the site and processed to match the design: background removed, black and white. Every portrait is framed the same way on a 1000×1250 canvas. Team photos are square close-ups for the round badges.
- Kracktwist, Rozzy Sokota and Gemy are `unlisted:true`: they are left out of artist lists, but their profiles still open from song and release links.
- The Gallery shows "Artists on Salone Lyrics" only: listed artists with a photo and at least one lyrics page. Each portrait links to the artist's profile and lyrics.
- To add or replace an artist photo: replace the `r-<artist>` image files, update that artist's entry in `window.SL_PHOTOS` (in `source/data.js` and `index.html`), and its size in `window.SL_DIMS` (in `index.html`).
- **Releases** only list projects with cover art (`assets/img/cover-<release>-[500|1000].webp`). Each has a full `tracklist` from Apple Music, checked against Deezer.
- **Videos** are Salone Lyrics' own lyric videos on TikTok (`tiktok:` video id), loaded only after the visitor presses play.

## Content notes
- The 15 main artist profiles follow the researched profile document, in its display order, with sources.
- Stories are original features and news with sources on every story. Features so far: Drizilik, Incredible JJ, BOII, Samza.
- Events are real listings; venues, times and ticket links are added as organisers confirm them.
- Forms (newsletter, contact, enquiry) do not send data anywhere yet; they only show a confirmation on screen.
