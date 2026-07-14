import { css } from "../lib/style";
import type { Derived } from "../lib/derive";

export default function HistoryView({ d }: { d: Derived }) {
  return (
    <div style={{ animation: "nwfade .2s ease-out" }}>
      <div style={css("background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:var(--nw-cardsh,none);")}>
        <div style={css("font-size:11px;font-weight:600;letter-spacing:0.12em;color:var(--nw-text3,#7E7E7E);text-transform:uppercase;")}>Net worth journey</div>
        <div style={css("display:flex;align-items:flex-end;gap:14px;margin-top:8px;flex-wrap:wrap;")}>
          <div style={{ ...css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:44px;letter-spacing:-0.02em;"), color: d.nwColor }}>{d.nwFull}</div>
          <div style={css("color:var(--nw-green,#8BF1A7);font-size:14px;font-weight:500;margin-bottom:10px;")}>{d.trendGrowthLabel} since Jan</div>
        </div>
        <div style={css("margin-top:18px;position:relative;")}>
          <svg width="100%" height="240" viewBox="0 0 640 260" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
            <defs><linearGradient id="nwArea2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: "var(--nw-gold,#D5B475)", stopOpacity: 0.3 }} /><stop offset="1" style={{ stopColor: "var(--nw-gold,#D5B475)", stopOpacity: 0 }} /></linearGradient></defs>
            <line x1="0" y1="65" x2="640" y2="65" style={{ stroke: "var(--nw-grid,#1E1E1E)" }} />
            <line x1="0" y1="130" x2="640" y2="130" style={{ stroke: "var(--nw-grid,#1E1E1E)" }} />
            <line x1="0" y1="195" x2="640" y2="195" style={{ stroke: "var(--nw-grid,#1E1E1E)" }} />
            <path d={d.lineAreaTall} fill="url(#nwArea2)" />
            <path d={d.linePathTall} fill="none" style={{ stroke: "var(--nw-gold,#D5B475)" }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {d.lineDotsTall.map((dot, i) => (
              <circle key={i} cx={dot.cx} cy={dot.cy} r="4" style={{ fill: "var(--nw-bg,#0B0B0B)", stroke: "var(--nw-gold,#D5B475)" }} strokeWidth="2.5" />
            ))}
          </svg>
          <div style={css("display:flex;justify-content:space-between;margin-top:8px;")}>
            {d.lineLabels.map((lb, i) => (
              <span key={i} style={css("font-size:10.5px;color:var(--nw-muted,#6E6E6E);")}>{lb}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={css("background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:16px;padding:8px 20px;box-shadow:var(--nw-cardsh,none);")}>
        {d.histRows.map((h, i) => (
          <div key={i} style={css("display:flex;align-items:center;gap:14px;border-top:1px solid var(--nw-hair,#202020);padding:14px 2px;")}>
            <span style={css("width:64px;font-size:13px;color:var(--nw-text2,#B1B1B1);")}>{h.label}</span>
            <div style={css("flex:1;height:8px;border-radius:4px;background:var(--nw-track,#202020);overflow:hidden;")}><div style={{ ...css("height:100%;background:linear-gradient(90deg,#8A6A2E,#D5B475);"), width: h.barW }} /></div>
            <span style={css("font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;width:96px;text-align:right;")}>{h.valC}</span>
            <span style={{ ...css("font-size:12px;font-weight:500;width:64px;text-align:right;"), color: h.deltaColor }}>{h.deltaLabel}</span>
          </div>
        ))}
      </div>
      <div style={css("text-align:center;color:var(--nw-muted,#6E6E6E);font-size:12px;margin-top:14px;line-height:1.5;")}>Historical months are illustrative. The latest point reflects your live entries.</div>
    </div>
  );
}
