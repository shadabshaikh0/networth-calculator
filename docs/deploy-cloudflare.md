# Deploy to Cloudflare Pages (free)

Pure static deploy of the Vite build. Free tier, HTTPS, global CDN, real
response headers (CSP etc. via `public/_headers`).

## What's already set up in the repo
- `public/_headers` — CSP + security headers served on every response.
- `public/_redirects` — SPA fallback so any path serves `index.html`.
- `npm run build` outputs to `dist/` (what Cloudflare serves).

## Steps you run (account + auth are yours — I can't do these)

### 1. Create a free Cloudflare account
<https://dash.cloudflare.com/sign-up> — no card needed for Pages.

### 2. Build with your Google Client ID baked in
The Client ID is inlined at build time, so build locally where `.env.local` exists:
```bash
npm run build
```
(Confirm `.env.local` contains `VITE_GOOGLE_CLIENT_ID=…`.)

### 3. Deploy the build
```bash
npx wrangler pages deploy dist --project-name=networth-calculator
```
- First run opens a browser to authorize Wrangler with your Cloudflare account
  (`wrangler login`) — approve it.
- It creates the Pages project and uploads `dist/`.
- You'll get a URL like `https://networth-calculator.pages.dev`.

### 4. Point Google OAuth at the new URL
In Google Cloud Console → Credentials → your OAuth Client ID →
**Authorized JavaScript origins**, add:
```
https://networth-calculator.pages.dev
```
(and any custom domain you later attach). Save. Sign-in only works from an
allowlisted origin.

### 5. Verify the live site
Open the `.pages.dev` URL and click **Sign in with Google**. If it's blocked,
check the browser console for a CSP violation and tell me the blocked origin —
it's a one-line fix in `public/_headers`.

## Redeploying after changes
```bash
npm run build && npx wrangler pages deploy dist --project-name=networth-calculator
```

## Alternative: Git-based deploys (optional, later)
If you push this repo to GitHub, you can connect it in the Cloudflare Pages
dashboard instead of uploading manually:
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable: `VITE_GOOGLE_CLIENT_ID` = your Client ID
Then every push auto-deploys.
