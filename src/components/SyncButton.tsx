import { css } from "../lib/style";
import { useStore } from "../store/useStore";
import { googleEnabled } from "../lib/googleConfig";
import { signIn, signOut } from "../lib/sync";
import { useIsMobile } from "../lib/useIsMobile";

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
);

const GoogleG = () => (
  <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.3 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7C43.7 37.9 46.5 31.8 46.5 24.5z" />
    <path fill="#FBBC05" d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-7.3-5.7c-2 1.4-4.7 2.3-8.2 2.3-6.3 0-11.7-3.7-13.6-9.1l-7.9 6.1C6.4 42.6 14.6 48 24 48z" />
  </svg>
);

const dotColor = (status: string) =>
  status === "synced" ? "#19AA4D" : status === "syncing" ? "#D5B475" : status === "error" ? "#D8645D" : "#8A8A8A";

const pill = "display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 14px;border:1px solid var(--nw-cardbd,#242424);border-radius:999px;background:transparent;font-size:12.5px;font-weight:600;cursor:pointer;";

export default function SyncButton() {
  const authStatus = useStore((s) => s.authStatus);
  const syncStatus = useStore((s) => s.syncStatus);
  const account = useStore((s) => s.account);
  const syncError = useStore((s) => s.syncError);
  const isMobile = useIsMobile();

  if (!googleEnabled()) {
    return (
      <span data-noprint title="Google sync isn’t configured yet (no client ID)" style={css("display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 13px;border:1px solid var(--nw-cardbd,#242424);border-radius:999px;color:var(--nw-text3,#8A8A8A);font-size:12.5px;font-weight:500;")}>
        <span style={{ ...css("width:7px;height:7px;border-radius:999px;"), background: "#8A8A8A" }} />
        Local only
      </span>
    );
  }

  if (authStatus === "signedin") {
    const label = account?.email || account?.name || "Signed in";
    const statusText = syncStatus === "syncing" ? "Syncing…" : syncStatus === "error" ? "Sync error" : "Synced";
    const title = syncError ? `${statusText}: ${syncError}` : `${label} · ${statusText} to your Google Sheet · sign out`;
    // Mobile: one compact button (status dot + logout icon), no email text.
    if (isMobile) {
      return (
        <button data-noprint onClick={signOut} title={title} style={css("display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 12px;border:1px solid var(--nw-cardbd,#242424);border-radius:999px;background:transparent;color:var(--nw-text2,#B1B1B1);cursor:pointer;flex-shrink:0;")}>
          <span style={{ ...css("width:7px;height:7px;border-radius:999px;flex-shrink:0;"), background: dotColor(syncStatus) }} />
          <LogoutIcon />
        </button>
      );
    }
    return (
      <div data-noprint style={css("display:inline-flex;align-items:center;gap:8px;")}>
        <span
          title={syncError ? `${statusText}: ${syncError}` : `${statusText} to your Google Sheet`}
          style={css("display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 13px;border:1px solid var(--nw-cardbd,#242424);border-radius:999px;color:var(--nw-text2,#B1B1B1);font-size:12.5px;font-weight:500;max-width:220px;")}
        >
          <span style={{ ...css("width:7px;height:7px;border-radius:999px;flex-shrink:0;"), background: dotColor(syncStatus) }} />
          <span style={css("white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{label}</span>
        </span>
        <button onClick={signOut} title="Sign out" style={css("display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 13px;border:1px solid var(--nw-cardbd,#242424);border-radius:999px;background:transparent;color:var(--nw-text2,#B1B1B1);font-size:12.5px;font-weight:500;cursor:pointer;")}>
          <LogoutIcon />
          Sign out
        </button>
      </div>
    );
  }

  if (authStatus === "signingin") {
    return (
      <button data-noprint disabled style={css(pill + "color:var(--nw-text,#fff);opacity:0.6;cursor:default;flex-shrink:0;")}>
        <GoogleG /> {isMobile ? "…" : "Signing in…"}
      </button>
    );
  }

  // signed out — if we have a cached account from a prior session, offer Reconnect.
  if (account?.email || account?.name) {
    return (
      <button data-noprint onClick={signIn} title={`Reconnect ${account.email || account.name} to sync`} style={css(pill + "color:var(--nw-text,#fff);flex-shrink:0;")}>
        <GoogleG /> Reconnect
      </button>
    );
  }

  return (
    <button data-noprint onClick={signIn} title="Store your data in your own Google Sheet" style={css(pill + "color:var(--nw-text,#fff);flex-shrink:0;")}>
      <GoogleG /> {isMobile ? "Sign in" : "Sign in with Google"}
    </button>
  );
}
