import { CLIENT_ID, SCOPES } from "./googleConfig";

/* Minimal typings for the Google Identity Services token client we use. */
interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}
interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
  callback: (resp: TokenResponse) => void;
}
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (resp: TokenResponse) => void;
          }) => TokenClient;
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";

let gisPromise: Promise<void> | null = null;
function ensureGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(s);
  });
  return gisPromise;
}

let tokenClient: TokenClient | null = null;
let accessToken: string | null = null;
let tokenExpiry = 0; // epoch ms

async function ensureClient(): Promise<TokenClient> {
  await ensureGis();
  if (!tokenClient) {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: () => {}, // replaced per-request below
    });
  }
  return tokenClient;
}

/**
 * Request an access token. `interactive` shows the account chooser / consent
 * (used for the explicit "Sign in" click); non-interactive attempts a silent
 * refresh (used when a token expires mid-session).
 */
export function requestToken(interactive: boolean): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await ensureClient();
      client.callback = (resp: TokenResponse) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error_description || resp.error || "Authorization failed"));
          return;
        }
        accessToken = resp.access_token;
        tokenExpiry = Date.now() + (resp.expires_in ?? 3600) * 1000;
        resolve(accessToken);
      };
      // explicit sign-in → show the account chooser; silent refresh → no prompt.
      client.requestAccessToken({ prompt: interactive ? "select_account" : "" });
    } catch (e) {
      reject(e);
    }
  });
}

/** A valid cached token, or a freshly refreshed one (silent). */
export async function getValidToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry - 60_000) return accessToken;
  return requestToken(false);
}

export function currentToken(): string | null {
  return accessToken && Date.now() < tokenExpiry ? accessToken : null;
}

export function clearToken() {
  const t = accessToken;
  accessToken = null;
  tokenExpiry = 0;
  if (t && window.google?.accounts?.oauth2) {
    try { window.google.accounts.oauth2.revoke(t); } catch { /* ignore */ }
  }
}

/** Fetch the signed-in account's email/name via the userinfo endpoint. */
export async function fetchUserInfo(token: string): Promise<{ email?: string; name?: string }> {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return {};
    const j = await res.json();
    return { email: j.email, name: j.name };
  } catch {
    return {};
  }
}
