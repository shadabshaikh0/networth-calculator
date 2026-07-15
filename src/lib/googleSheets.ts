import type { Included, Item, Member, Metal, Rates, Snapshot, SnapshotData } from "../types";
import { APP_PROPERTY_KEY, APP_PROPERTY_VALUE, SCHEMA_VERSION, SHEET_TITLE } from "./googleConfig";
import { getValidToken, requestToken } from "./googleAuth";

const SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";
const DRIVE = "https://www.googleapis.com/drive/v3/files";

const TAB_ASSETS = "Assets";
const TAB_LIAB = "Liabilities";
const TAB_MEMBERS = "Members";
const TAB_META = "Meta";

const ITEM_COLS = ["id", "name", "cat", "value", "owner", "hidden", "note", "ref", "grams", "metal"] as const;
const MEMBER_COLS = ["id", "name", "relation", "color"] as const;

/** fetch with Bearer token; on 401 refresh once and retry. */
async function api(url: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const token = await getValidToken();
  const res = await fetch(url, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (res.status === 401 && retry) {
    await requestToken(false); // silent refresh
    return api(url, init, false);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res;
}

/** Find the app's existing spreadsheet (created by us, via drive.file). */
export async function findSheet(): Promise<string | null> {
  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.spreadsheet' and trashed=false and ` +
      `appProperties has { key='${APP_PROPERTY_KEY}' and value='${APP_PROPERTY_VALUE}' }`,
  );
  const res = await api(`${DRIVE}?q=${q}&spaces=drive&fields=files(id,modifiedTime)&orderBy=modifiedTime desc`);
  const j = await res.json();
  return j.files && j.files.length ? (j.files[0].id as string) : null;
}

/** Create the spreadsheet with our named tabs and stamp the Drive marker. */
export async function createSheet(): Promise<string> {
  const res = await api(SHEETS, {
    method: "POST",
    body: JSON.stringify({
      properties: { title: SHEET_TITLE },
      sheets: [TAB_ASSETS, TAB_LIAB, TAB_MEMBERS, TAB_META].map((title) => ({ properties: { title } })),
    }),
  });
  const j = await res.json();
  const id = j.spreadsheetId as string;
  // Stamp the app marker so findSheet() can locate it next time.
  await api(`${DRIVE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ appProperties: { [APP_PROPERTY_KEY]: APP_PROPERTY_VALUE } }),
  });
  return id;
}

// ---- serialization ----
function itemToRow(i: Item): (string | number)[] {
  return [
    i.id, i.name, i.cat, i.value, i.owner ?? "self",
    i.hidden ? "TRUE" : "FALSE", i.note ?? "", i.ref ?? "",
    i.grams ?? "", i.metal ?? "",
  ];
}
function rowToItem(r: string[]): Item | null {
  const [id, name, cat, value, owner, hidden, note, ref, grams, metal] = r;
  if (!id) return null;
  const item: Item = {
    id, name: name ?? "", cat: cat ?? "", value: Number(value) || 0, owner: owner || "self",
  };
  if (hidden === "TRUE" || hidden === "true" || hidden === "1") item.hidden = true;
  if (note) item.note = note;
  if (ref) item.ref = ref;
  if (grams && !Number.isNaN(Number(grams))) item.grams = Number(grams);
  if (metal === "gold" || metal === "silver") item.metal = metal as Metal;
  return item;
}

function matrix(header: readonly string[], rows: (string | number)[][]) {
  return [header.slice(), ...rows];
}

/** Read all tabs and assemble a snapshot. */
export async function loadAll(spreadsheetId: string): Promise<SnapshotData> {
  const ranges = [TAB_ASSETS, TAB_LIAB, TAB_MEMBERS, TAB_META]
    .map((t) => `ranges=${encodeURIComponent(t + "!A1:Z1000")}`)
    .join("&");
  const res = await api(`${SHEETS}/${spreadsheetId}/values:batchGet?${ranges}`);
  const j = await res.json();
  const vr: { values?: string[][] }[] = j.valueRanges || [];
  const rowsOf = (idx: number) => (vr[idx]?.values || []).slice(1); // drop header

  const assets = rowsOf(0).map(rowToItem).filter((x): x is Item => !!x);
  const liab = rowsOf(1).map(rowToItem).filter((x): x is Item => !!x);
  const members: Member[] = rowsOf(2)
    .map((r) => ({ id: r[0], name: r[1] ?? "", relation: r[2] ?? "", color: r[3] ?? "#D5B475" }))
    .filter((m) => !!m.id);

  const meta: Record<string, string> = {};
  for (const r of rowsOf(3)) if (r[0]) meta[r[0]] = r[1] ?? "";
  const parseJson = <T,>(s: string | undefined, fallback: T): T => {
    if (!s) return fallback;
    try { return JSON.parse(s) as T; } catch { return fallback; }
  };
  const included = parseJson<Included>(meta.included, {});
  const rates = parseJson<Rates>(meta.rates, {});
  const history = parseJson<Snapshot[]>(meta.history, []);
  const onboardDismissed = meta.onboardDismissed === "1";

  return { assets, liab, members, included, rates, onboardDismissed, history };
}

/** Overwrite all tabs with the given snapshot (clear then write, 2 calls). */
export async function saveAll(spreadsheetId: string, data: SnapshotData): Promise<void> {
  await api(`${SHEETS}/${spreadsheetId}/values:batchClear`, {
    method: "POST",
    body: JSON.stringify({ ranges: [TAB_ASSETS, TAB_LIAB, TAB_MEMBERS, TAB_META].map((t) => `${t}!A1:Z1000`) }),
  });
  const metaRows: (string | number)[][] = [
    ["schemaVersion", SCHEMA_VERSION],
    ["currency", "INR"],
    ["included", JSON.stringify(data.included || {})],
    ["rates", JSON.stringify(data.rates || {})],
    ["history", JSON.stringify(data.history || [])],
    ["onboardDismissed", data.onboardDismissed ? "1" : "0"],
  ];
  await api(`${SHEETS}/${spreadsheetId}/values:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      valueInputOption: "RAW",
      data: [
        { range: `${TAB_ASSETS}!A1`, values: matrix(ITEM_COLS, data.assets.map(itemToRow)) },
        { range: `${TAB_LIAB}!A1`, values: matrix(ITEM_COLS, data.liab.map(itemToRow)) },
        { range: `${TAB_MEMBERS}!A1`, values: matrix(MEMBER_COLS, data.members.map((m) => [m.id, m.name, m.relation, m.color])) },
        { range: `${TAB_META}!A1`, values: matrix(["key", "value"], metaRows) },
      ],
    }),
  });
}
