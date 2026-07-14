import { css } from "../lib/style";
import { useStore } from "../store/useStore";
import type { Derived } from "../lib/derive";
import SyncButton from "./SyncButton";

export default function TopBar({ d }: { d: Derived }) {
  const setDark = useStore((s) => s.setDark);
  const setLight = useStore((s) => s.setLight);
  return (
    <div style={css("position:sticky;top:0;z-index:20;background:var(--nw-topbar,rgba(11,11,11,0.86));backdrop-filter:blur(12px);border-bottom:1px solid var(--nw-topbd,#1C1C1C);")}>
      <div style={css("max-width:1120px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;gap:14px;")}>
        <span style={css("width:34px;height:34px;border-radius:10px;background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);display:flex;align-items:center;justify-content:center;flex-shrink:0;")}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style={{ stroke: "var(--nw-gold,#D5B475)" }} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16l4-5 3 3 5-8" /><path d="M4 20h16" /></svg>
        </span>
        <div style={css("display:flex;flex-direction:column;line-height:1.15;")}>
          <span style={css("font-family:'Lora',serif;font-size:18px;font-weight:500;")}>Net worth</span>
          <span style={css("font-size:11.5px;color:var(--nw-text3,#8A8A8A);")}>Track everything you own &amp; owe</span>
        </div>
        <div style={{ flex: 1 }} />
        <SyncButton />
        <div data-noprint style={css("display:inline-flex;background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:999px;padding:4px;gap:2px;")}>
          <button onClick={setDark} title="Dark" style={css(d.darkBtnStyle)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /></svg>
          </button>
          <button onClick={setLight} title="Light" style={css(d.lightBtnStyle)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
