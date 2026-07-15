# Net Worth Calculator

A private, client-side net-worth tracker. Add everything you own and owe, and
see your net worth, asset allocation, liquidity, and trend over time — with
**your data stored only on your device and (optionally) in your own Google
Sheet**. There is no backend server, and nothing is ever sent to a third party.

## Features

- **Assets & liabilities** across 8 asset types and 6 liability types, with
  per-item notes and reference links.
- **Household view** — tag items to family members and toggle who's included
  in the totals.
- **Gold & silver by weight** — price holdings live from a rate you set.
- **Insights** — asset-allocation donut, assets-vs-liabilities, liquid-vs-locked
  (emergency reachability), and a **real monthly net-worth trend** that builds up
  as you use the app.
- **Export** to CSV, or save a PDF via print.
- **Dark / light** themes.
- **CSV / offline-first** — works fully without signing in (data in your
  browser's local storage).

## Privacy model

- **Pure client-side.** No backend, no database, no analytics.
- **Local first.** Your data lives in `localStorage`.
- **Optional Google Sheets sync.** If you sign in with Google, the app creates
  **one spreadsheet in your own Google Drive** and reads/writes only that file
  (OAuth scope `drive.file` — it cannot see anything else in your Drive).
- **No secrets in the app.** The only credential is a public OAuth Client ID.
  There is no API key and no client secret.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [Zustand](https://github.com/pmndrs/zustand) for state
- Google Identity Services + Sheets/Drive REST (for optional sync)

## Getting started

Requires Node 18+ (developed on Node 22).

```bash
npm install
npm run dev      # http://localhost:8743
```

Build for production:

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

The app works out of the box with local storage. Google sync is optional.

## Enabling Google Sheets sync (optional)

Sync stores your data in your own Google Drive. You need a Google OAuth
Client ID (free):

1. Follow **[docs/google-setup.md](docs/google-setup.md)** to create the OAuth
   Client ID.
2. Copy `.env.example` to `.env.local` and set your Client ID:
   ```bash
   cp .env.example .env.local
   # VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
3. Restart `npm run dev`. The top bar switches from **Local only** to
   **Sign in with Google**.

Without a Client ID the app runs fully locally (the sync button shows
"Local only").

## Deployment

Deploys as a static site. See **[docs/deploy-cloudflare.md](docs/deploy-cloudflare.md)**
for a free Cloudflare Pages setup (with CSP + security headers via
`public/_headers`). Any static host works.

## Project structure

```
src/
  App.tsx            # layout + wiring
  store/useStore.ts  # Zustand store (all state + actions)
  lib/
    derive.ts        # pure view-model from state
    networth.ts      # net-worth math + month helpers
    googleAuth.ts    # Google Identity Services token client
    googleSheets.ts  # Sheets/Drive REST (Bearer token only)
    sync.ts          # sign-in reconcile + debounced push
    history.ts       # monthly net-worth snapshots
  components/        # UI (TopBar, Dashboard, modals, …)
public/
  _headers           # CSP + security headers (Cloudflare Pages)
  _redirects         # SPA fallback
docs/                # Google + deploy guides
```

## License

Personal project — no license granted. All rights reserved unless a `LICENSE`
file is added.
