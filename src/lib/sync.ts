import { useStore } from "../store/useStore";
import { clearToken, fetchUserInfo, requestToken } from "./googleAuth";
import { createSheet, findSheet, loadAll, saveAll } from "./googleSheets";
import { googleEnabled } from "./googleConfig";
import { DEFAULT_MEMBERS, STORE_KEY } from "../constants";

const SHEET_ID_KEY = "wint_nw_sheetid_v1";
const ACCOUNT_KEY = "wint_nw_account_v1";

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pushInFlight = false;
let pushQueued = false;

const cacheSheetId = (id: string | null) => {
  try { id ? localStorage.setItem(SHEET_ID_KEY, id) : localStorage.removeItem(SHEET_ID_KEY); } catch { /* ignore */ }
};
const cachedSheetId = () => {
  try { return localStorage.getItem(SHEET_ID_KEY); } catch { return null; }
};
const cacheAccount = (acc: { email?: string; name?: string } | null) => {
  try { acc ? localStorage.setItem(ACCOUNT_KEY, JSON.stringify(acc)) : localStorage.removeItem(ACCOUNT_KEY); } catch { /* ignore */ }
};

/** Push the current snapshot to the Sheet; coalesces concurrent calls. */
async function pushNow() {
  const st = useStore.getState();
  if (st.authStatus !== "signedin" || !st.spreadsheetId) return;
  if (pushInFlight) { pushQueued = true; return; }
  pushInFlight = true;
  st.setSync({ syncStatus: "syncing", syncError: null });
  try {
    await saveAll(st.spreadsheetId, useStore.getState().snapshot());
    useStore.getState().setSync({ syncStatus: "synced" });
  } catch (e) {
    useStore.getState().setSync({ syncStatus: "error", syncError: (e as Error).message });
  } finally {
    pushInFlight = false;
    if (pushQueued) { pushQueued = false; void pushNow(); }
  }
}

/** Debounced push, called on any data change while signed in. */
function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { void pushNow(); }, 1200);
}

/** Find (or create) the user's sheet and reconcile. Assumes already signed in.
 *  A failure here does NOT sign the user out — it just surfaces a sync error. */
async function syncFromRemote() {
  if (useStore.getState().authStatus !== "signedin") return;
  useStore.getState().setSync({ syncStatus: "syncing", syncError: null });
  try {
    let id = cachedSheetId() || (await findSheet());
    if (id) {
      // Sheet is the source of truth once it exists.
      const data = await loadAll(id);
      useStore.getState().hydrate(data);
    } else {
      // First time creating this user's sheet.
      id = await createSheet();
      // If the app is only showing the untouched demo seed (nothing persisted
      // locally yet), don't push the sample portfolio into the user's real
      // sheet — start them on a clean slate instead.
      const untouchedSeed = !localStorage.getItem(STORE_KEY);
      if (untouchedSeed) {
        useStore.getState().hydrate({
          assets: [], liab: [], members: [{ ...DEFAULT_MEMBERS[0] }],
          included: {}, rates: {}, onboardDismissed: false, history: [],
        });
      }
      await saveAll(id, useStore.getState().snapshot());
    }
    cacheSheetId(id);
    useStore.getState().setSync({ spreadsheetId: id, syncStatus: "synced" });
  } catch (e) {
    // Stay signed in; the account chip shows a red dot + this message.
    useStore.getState().setSync({ syncStatus: "error", syncError: (e as Error).message });
  }
}

/** Explicit "Sign in with Google" — interactive consent, then reconcile. */
export async function signIn() {
  if (!googleEnabled()) return;
  useStore.getState().setSync({ authStatus: "signingin", syncError: null });
  let token: string;
  try {
    token = await requestToken(true);
  } catch (e) {
    // Auth itself failed (popup closed, origin not allowlisted, etc.)
    useStore.getState().setSync({ authStatus: "signedout", syncStatus: "error", syncError: (e as Error).message });
    return;
  }
  // Auth succeeded — this state STICKS regardless of what the sheet step does.
  const account = await fetchUserInfo(token);
  cacheAccount(account);
  useStore.getState().setSync({ authStatus: "signedin", account });
  await syncFromRemote();
}

export function signOut() {
  clearToken();
  cacheSheetId(null);
  cacheAccount(null);
  if (pushTimer) clearTimeout(pushTimer);
  useStore.getState().setSync({ authStatus: "signedout", syncStatus: "idle", account: null, spreadsheetId: null, syncError: null });
}

/**
 * Wire the store → debounced cloud push. Called once at app start.
 * Only data-bearing fields trigger a push (not view/modal/theme churn).
 */
export function initSync() {
  if (!googleEnabled()) return;

  // Restore a cached account chip immediately (token still needs a silent grant).
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (raw) useStore.getState().setSync({ account: JSON.parse(raw) });
  } catch { /* ignore */ }

  let prev = snapshotKey(useStore.getState());
  useStore.subscribe((s) => {
    const key = snapshotKey(s);
    if (key !== prev) {
      prev = key;
      if (s.authStatus === "signedin") schedulePush();
    }
  });
}

/** Cheap change-detection key over the synced fields only. */
function snapshotKey(s: ReturnType<typeof useStore.getState>): string {
  return JSON.stringify([s.assets, s.liab, s.members, s.included, s.rates, s.onboardDismissed]);
}
