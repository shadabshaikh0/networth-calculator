import { css } from "../lib/style";
import { useStore } from "../store/useStore";
import type { Derived } from "../lib/derive";

export default function CategoryDrilldown({ d }: { d: Derived }) {
  const s = useStore();
  const sel = d.selVals;
  if (!sel) return null;
  return (
    <div style={{ animation: "nwfade .2s ease-out" }}>
      <button onClick={s.gotoDashboard} style={css("display:flex;align-items:center;gap:6px;background:transparent;border:none;color:var(--nw-text2,#9A9A9A);font-size:13px;cursor:pointer;padding:0;margin-bottom:16px;")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6M8 12h12" /></svg> Back to dashboard
      </button>
      <div style={css("display:flex;align-items:center;gap:14px;margin-bottom:20px;flex-wrap:wrap;")}>
        <span style={{ ...css("width:52px;height:52px;border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;"), background: sel.selTint }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={sel.selColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={sel.selIconPath} /></svg>
        </span>
        <div>
          <div style={css("font-family:'Lora',serif;font-size:22px;font-weight:500;")}>{sel.selLabel}</div>
          <div style={css("font-size:13px;color:var(--nw-text3,#8A8A8A);")}>{sel.selKindLabel} · {sel.selCount} shown</div>
          {sel.selHasHidden && <div style={css("font-size:12px;color:var(--nw-gold,#D5B475);margin-top:2px;")}>{sel.selHiddenNote}</div>}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ ...css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:28px;"), color: sel.selColor }}>{sel.selTotalFull}</div>
          <div style={css("font-size:12px;color:var(--nw-text3,#8A8A8A);")}>{sel.selPctLabel} of {sel.selKindLabel}</div>
        </div>
      </div>

      <div style={css("background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:16px;padding:8px 20px;box-shadow:var(--nw-cardsh,none);")}>
        {sel.selItems.map((it) => (
          <div key={it.id} style={css("display:flex;align-items:center;gap:12px;border-top:1px solid var(--nw-hair,#202020);padding:16px 2px;")}>
            <div style={{ ...css("flex:1;min-width:0;"), opacity: it.contentOp }}>
              <div style={css("display:flex;align-items:center;gap:8px;")}>
                <span style={css(it.ownerStyle)} title={it.ownerName}>{it.ownerInitial}</span>
                <span style={css("font-size:15px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{it.name}</span>
                {it.hidden && <span style={css("font-size:9.5px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--nw-text3,#8A8A8A);border:1px solid var(--nw-chipbd,#2A2A2A);border-radius:5px;padding:1px 6px;flex-shrink:0;")}>Hidden</span>}
                {it.excludedTag && <span style={css("font-size:9.5px;font-weight:600;letter-spacing:0.04em;color:var(--nw-text3,#8A8A8A);border:1px solid var(--nw-chipbd,#2A2A2A);border-radius:5px;padding:1px 6px;flex-shrink:0;white-space:nowrap;")}>{it.excludedLabel}</span>}
              </div>
              <div style={css("height:6px;border-radius:3px;background:var(--nw-track,#202020);margin-top:9px;overflow:hidden;max-width:260px;")}>
                <div style={{ ...css("height:100%;"), background: it.barColor, width: it.barW }} />
              </div>
              {it.hasWeight && (
                <div style={css("display:flex;align-items:center;gap:6px;margin-top:8px;font-size:12px;color:var(--nw-gold,#D5B475);")}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v5H4zM14 14h6v5h-6zM9 8h6v5H9z" /></svg>{it.weightLabel}
                </div>
              )}
              {it.hasNote && (
                <div style={css("display:flex;align-items:flex-start;gap:6px;margin-top:8px;font-size:12.5px;color:var(--nw-text3,#8A8A8A);line-height:1.45;")}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><path d="M5 4h11l3 3v13H5zM15 4v4h4M8 12h8M8 16h5" /></svg>{it.note}
                </div>
              )}
              {it.hasRef && (
                <div style={css("display:flex;align-items:center;gap:6px;margin-top:6px;font-size:12px;color:var(--nw-text3,#8A8A8A);")}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M9 15l6-6M8 12l-2 2a3 3 0 004 4l2-2M16 12l2-2a3 3 0 00-4-4l-2 2" /></svg><span style={css("white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{it.ref}</span>
                </div>
              )}
            </div>
            <div style={{ ...css("font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;white-space:nowrap;"), opacity: it.contentOp }}>{it.valFull}</div>
            <button onClick={() => s.toggleHidden(it.kind, it.id)} title={it.toggleTitle} style={{ ...css("width:34px;height:34px;border-radius:9px;border:1px solid var(--nw-btnbd,#2A2A2A);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;"), color: it.toggleColor }}>
              {it.visible ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.1A9.6 9.6 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 3.9M6.1 6.1A17 17 0 002 12s3.5 7 10 7a9.5 9.5 0 004-.9" /></svg>
              )}
            </button>
            <button onClick={() => { const src = it.kind === "asset" ? s.assets : s.liab; const item = src.find((x) => x.id === it.id); if (item) s.editItem(it.kind, item); }} title="Edit" style={css("width:34px;height:34px;border-radius:9px;border:1px solid var(--nw-btnbd,#2A2A2A);background:transparent;color:var(--nw-text2,#B1B1B1);cursor:pointer;display:flex;align-items:center;justify-content:center;")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4l10-10-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg>
            </button>
            <button onClick={() => { if (typeof confirm !== "function" || confirm("Delete " + it.name + "?")) s.deleteItem(it.kind, it.id); }} title="Delete" style={css("width:34px;height:34px;border-radius:9px;border:1px solid var(--nw-btnbd,#2A2A2A);background:transparent;color:#D8645D;cursor:pointer;display:flex;align-items:center;justify-content:center;")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" /></svg>
            </button>
          </div>
        ))}
        {sel.selEmpty && (
          <div style={css("padding:26px 4px;text-align:center;color:var(--nw-text3,#7E7E7E);font-size:13.5px;")}>Nothing here yet — add your first entry.</div>
        )}
      </div>
      <button onClick={s.addToSelected} style={css("width:100%;margin-top:14px;height:48px;border:1px dashed var(--nw-dash,#333);border-radius:12px;background:transparent;color:var(--nw-text,#fff);font-size:14px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg> Add to {sel.selLabel}
      </button>
    </div>
  );
}
