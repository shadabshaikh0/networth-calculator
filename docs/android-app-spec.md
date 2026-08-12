# Android App — Product & Technical Spec

A hand-off spec to build a **native Android version** of this Net Worth
Calculator. The existing **web app in this repo is the reference
implementation** — read the code for exact behavior:

- `src/lib/networth.ts` — net-worth math + month helpers
- `src/lib/derive.ts` — every displayed number/label (the view model)
- `src/store/useStore.ts` — state, actions, local persistence, seed data
- `src/lib/googleSheets.ts` — the Google Sheet read/write format (**the sync contract**)
- `src/lib/sync.ts` — sign-in reconcile + debounced push
- `src/constants.ts` — categories, colors, seed data, theme tokens

Repo: https://github.com/shadabshaikh0/networth-calculator

## Goal

A native Android app with **feature parity** with the web app **and full data
interop**: both platforms read/write the **same spreadsheet** in the user's
Google Drive, so signing in on either shows the same data. Achieving interop
means matching the **Google Sheet contract** below exactly.

## Product overview

- Personal net-worth tracker, **INR**. No backend, no analytics.
- Privacy model: data lives **on-device** and (optionally) in the user's **own
  Google Sheet** via OAuth scope `drive.file` (the app can only touch the file
  it created). **No API key, no client secret.**
- Works fully offline/local; Google sync is optional.

## Features (parity with web)

- **Assets** (8 categories) and **liabilities** (6 categories). Each item:
  `name`, `value`, `owner` (member), `hidden` flag, optional `note` + `ref`
  (reference/link). Gold/silver can be entered **by weight** and priced live
  from a per-gram rate.
- **Household members** — tag items to people; a per-member include/exclude
  toggle changes all totals.
- **Dashboard**: total net worth + "since <last month>" delta; assets-vs-
  liabilities; asset-allocation donut; liquid-vs-locked with emergency
  coverage; monthly net-worth trend.
- **Category drill-down**: per-item list with hide/exclude, edit, delete, notes,
  weight, owner badges.
- **History**: monthly snapshots (trend + table). Delta/trend hidden until 2+
  months exist.
- **Onboarding checklist**, **sample portfolio**, **reset**, **CSV export**,
  **PDF/share**, **dark/light theme**.

## Data model

```
Item      { id, name, cat, value:Long, owner, hidden:Bool, note?, ref?, grams?:Double, metal?:"gold"|"silver" }
Member    { id, name, relation, color }         // "self" always exists (name "You")
Snapshot  { month:"YYYY-MM", value:Long }
Included  = Map<memberId, Boolean>              // false = excluded from totals
Rates     = Map<"gold"|"silver", Long>          // ₹ per gram; defaults gold 7250, silver 92
SnapshotData { assets:[Item], liab:[Item], members:[Member], included, rates, history:[Snapshot], onboardDismissed:Bool }
```

Asset categories (`key` → label, hex color): `bonds` Bonds & fixed income
#D5B475 · `stocks` Stocks & mutual funds #417CF1 · `cash` Cash & bank #19AA4D ·
`epf` EPF/PPF/retirement #6FCAFF · `vehicles` Vehicles #FC823A · `gold` Gold
#FBC450 · `realestate` Real estate #A964F7 · `other_a` Other assets #B1B1B1.

Liability categories: `home` Home loan #D8645D · `carloan` Car/vehicle loan
#FE817B · `personal` Personal loan #F877D2 · `creditcard` Credit card debt
#E142BC · `education` Education loan #FFB48C · `other_l` Other liabilities
#979797.

Liquidity map (for liquid-vs-locked): **liquid** = cash, stocks, gold, bonds;
**locked** = epf, realestate, vehicles, other_a.

(Exact SVG icon paths, seed portfolio, and dark/light theme tokens are in
`src/constants.ts` — copy them for pixel parity.)

## Calculations (exact — port from the web)

- **Item value**: `grams && metal && rates[metal] ? round(grams*rates[metal]) : value`.
- **Net worth**: sum of *visible & included* asset values − visible & included
  liabilities. "Included" = `included[owner] != false`; "visible" = `!hidden`.
- **Allocation %** per category = categoryTotal / totalAssets.
- **Liquid total** = visible+included assets whose category is `liquid`.
  Emergency label compares liquid vs total liabilities.
- **Leverage label**: debt-free, else "You owe X% of what you own"
  (`totalLiab/totalAssets`).
- **Monthly history**: upsert a snapshot for the current month (`YYYY-MM`) with
  the current net worth whenever data changes and on load; skip while there are
  zero items. The current month always reflects live net worth.
- **"since <month>" delta** = currentNW − previousMonthSnapshot; **hidden until
  ≥2 months**. **Growth %** = (currentNW − firstSnapshot)/|firstSnapshot|.

## The Google Sheet contract (CRITICAL for cross-platform sync)

Match this exactly so Android and web share one spreadsheet.

- **Scope**: `https://www.googleapis.com/auth/drive.file` (+ `openid email
  profile` for the account chip).
- **Find** the sheet: Drive `files.list` with
  `q = mimeType='application/vnd.google-apps.spreadsheet' and trashed=false and appProperties has { key='networthApp' and value='1' }`.
- **Create** (first time): Sheets `spreadsheets.create` with `title = "Net worth
  data"` and four tabs — `Assets`, `Liabilities`, `Members`, `Meta`. Then Drive
  `files.update` to set `appProperties = { networthApp: "1" }`.
- **Assets** & **Liabilities** tabs — header row then one row per item, columns:
  `id, name, cat, value, owner, hidden, note, ref, grams, metal`.
  `hidden` serialized as `TRUE`/`FALSE` (parse `TRUE`/`true`/`1` as true).
- **Members** tab — columns: `id, name, relation, color`.
- **Meta** tab — `key, value` rows: `schemaVersion=1`, `currency=INR`,
  `included=<JSON>`, `rates=<JSON>`, `history=<JSON array of {month,value}>`,
  `onboardDismissed=0|1`.
- **Load**: `values.batchGet` ranges `Assets!A1:Z1000` … for all tabs; drop
  header row; parse.
- **Save**: `values.batchClear` all four ranges, then `values.batchUpdate`
  (`valueInputOption: RAW`) with the full matrices.
- **Reconcile on sign-in**: if the sheet exists it wins (load it). If not,
  create it and push local data — **unless** local is just the untouched demo
  seed (nothing persisted yet), in which case start clean (empty assets/liab,
  members = just "You").

## Android technical guidance (suggested)

- **Kotlin + Jetpack Compose**, MVVM. Offline-first.
- **Auth**: Google Sign-In via **Credential Manager** requesting the `drive.file`
  scope; obtain an OAuth access token for the REST calls. You need a **new
  OAuth client ID of type _Android_** (app package name + signing SHA-1) created
  in the **same Google Cloud project** as the web app (Sheets + Drive APIs are
  already enabled there). The web Client ID does not work for Android.
- **Networking**: call the Sheets/Drive **REST** endpoints with the Bearer
  token (or the Google API Java client). No API key needed.
- **Local storage**: Room or DataStore mirroring `SnapshotData`; debounce the
  push to Sheets (~1s) on change; refresh token silently on 401.
- **Theming**: reuse the dark/light color tokens and category colors from
  `src/constants.ts` for a consistent look.

## Non-goals / deferred (same as web)

- Privacy policy / Terms pages and Google OAuth **verification** are only needed
  to go past 100 users; a pilot works with test users.

## Web ↔ Android logic map

| Web file | Android equivalent |
| --- | --- |
| `store/useStore.ts` | ViewModel + repository + local store |
| `lib/networth.ts`, `lib/derive.ts` | Domain/use-case layer (pure math) |
| `lib/googleSheets.ts` | `SheetsRepository` (REST) — **match the contract above** |
| `lib/googleAuth.ts`, `lib/sync.ts` | Auth + sync manager |
| `components/*` | Compose screens |
