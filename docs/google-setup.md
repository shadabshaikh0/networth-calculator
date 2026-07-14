# Google setup (one-time) — to enable Sheets sync

This app stores each user's data in **their own** Google Sheet. It's a pure
client-side flow: **no API key, no client secret, no backend**. The only value
you configure is a public **OAuth Client ID**.

## 1. Create a Google Cloud project
- Go to <https://console.cloud.google.com/> → create a project (e.g. "Wint Net Worth").

## 2. Enable the APIs
- APIs & Services → **Library** → enable **Google Sheets API** and **Google Drive API**.

## 3. Configure the OAuth consent screen
- APIs & Services → **OAuth consent screen**.
- User type: **External**.
- Fill app name, support email, developer email; add a logo + your homepage,
  privacy policy, and terms URLs (required to pass verification later).
- **Scopes** — add exactly these:
  - `.../auth/drive.file`  ← sensitive, but avoids the restricted-scope security assessment
  - `openid`, `email`, `profile`  ← non-sensitive (used only to show which account is connected)
- **Test users**: add your own Google account(s). Up to 100 test users work
  immediately with no verification — enough for the pilot.

## 4. Create the OAuth Client ID
- APIs & Services → **Credentials** → Create credentials → **OAuth client ID**.
- Application type: **Web application**.
- **Authorized JavaScript origins** — add every origin the app runs on:
  - `http://localhost:8743` (local dev)
  - your staging/production URL, e.g. `https://networth.yourdomain.com`
- (No redirect URI needed — the GIS token flow uses origins, not redirects.)
- Copy the **Client ID** (looks like `1234-abc.apps.googleusercontent.com`).

## 5. Drop it into the app
```bash
cp .env.example .env.local
# edit .env.local:
VITE_GOOGLE_CLIENT_ID=1234-abc.apps.googleusercontent.com
```
Restart `npm run dev`. The top bar switches from **Local only** to
**Sign in with Google**.

## What happens on first sign-in
1. Google account chooser → consent (drive.file + identity).
2. The app looks for its spreadsheet in your Drive (Drive `appProperties` marker).
3. None found → it **creates** `Wint · Net worth data` with tabs
   Assets / Liabilities / Members / Meta and pushes your current data up.
4. Found → it **loads** that sheet (the sheet is the source of truth).
5. After that, every edit is written back (debounced ~1.2s). The chip shows a
   green dot when synced, amber while syncing, red on error.

## Going to production later (Phase 3)
- Submit the consent screen for **verification** (brand review; `drive.file` does
  **not** require the paid annual security assessment).
- Add the production origin to the Client ID.
- Restrict via CSP + host on your domain.

## Security notes
- The Client ID is **public by design** — it ships in the browser bundle and is
  protected by the Authorized JavaScript origins allowlist.
- There is **no client secret** and **no API key** in this app.
- User data flows **browser ↔ Google only**; it never touches our servers.
