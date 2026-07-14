import { css } from "../lib/style";
import { useStore } from "../store/useStore";
import type { Derived } from "../lib/derive";
import type { Metal } from "../types";

interface CatOpt { key: string; label: string; color: string; chipStyle: string; }
interface OwnerOpt { id: string; label: string; color: string; initial: string; chipStyle: string; avatarStyle: string; }
interface MetalOpt { key: Metal; label: string; chipStyle: string; }
interface QuickAmt { label: string; amt: number; }

export default function AddEditModal({ d }: { d: Derived }) {
  const s = useStore();
  const m = d.modalVals as Record<string, unknown>;
  if (!m.modalOpen) return null;

  const catOptions = m.catOptions as CatOpt[];
  const ownerOptions = m.ownerOptions as OwnerOpt[];
  const metalOptions = m.metalOptions as MetalOpt[];
  const quickAmounts = m.quickAmounts as QuickAmt[];

  return (
    <div style={{ ...css("position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:20px;"), ...css(d.dark ? "" : "") }}>
      <div onClick={s.closeModal} style={css("position:absolute;inset:0;background:rgba(0,0,0,0.6);animation:nwscrim .18s ease-out;")} />
      <div style={css("position:relative;width:100%;max-width:460px;max-height:90vh;overflow-y:auto;background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#2A2A2A);border-radius:24px;padding:22px 22px 26px;animation:nwsheet .28s cubic-bezier(0.2,0.8,0.2,1);box-shadow:0 24px 64px rgba(0,0,0,0.4);color:var(--nw-text,#fff);")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;")}>
          <div style={css("font-family:'Lora',serif;font-size:21px;font-weight:500;")}>{m.modalTitle as string}</div>
          <button onClick={s.closeModal} style={css("width:34px;height:34px;border-radius:9px;border:1px solid var(--nw-btnbd,#2A2A2A);background:transparent;color:var(--nw-text2,#B1B1B1);cursor:pointer;display:flex;align-items:center;justify-content:center;")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div style={css("font-size:13px;color:var(--nw-text3,#8A8A8A);margin-bottom:20px;")}>{m.modalSubtitle as string}</div>

        <div style={{ ...css("border-radius:14px;padding:16px 18px;margin-bottom:20px;"), background: m.modalPreviewBg as string }}>
          <div style={{ ...css("font-size:11px;letter-spacing:0.08em;text-transform:uppercase;"), color: m.modalPreviewColor as string }}>{m.modalPreviewLabel as string}</div>
          <div style={{ ...css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:32px;margin-top:4px;"), color: m.modalPreviewColor as string }}>{m.draftPreview as string}</div>
        </div>

        <label style={css("display:block;font-size:12.5px;color:var(--nw-text2,#B1B1B1);margin-bottom:7px;")}>Name</label>
        <input value={m.draftName as string} onChange={(e) => s.setDraft({ name: e.target.value })} placeholder={m.namePlaceholder as string} style={css("width:100%;height:48px;padding:0 14px;border-radius:10px;border:1px solid var(--nw-inputbd,#2E2E2E);background:var(--nw-inputbg,#0E0E0E);color:var(--nw-text,#fff);font-size:15px;outline:none;margin-bottom:16px;")} />

        <label style={css("display:block;font-size:12.5px;color:var(--nw-text2,#B1B1B1);margin-bottom:7px;")}>Category</label>
        <div style={css("display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;")}>
          {catOptions.map((c) => (
            <button key={c.key} onClick={() => s.pickCat(c.key)} style={css(c.chipStyle)}>
              <span style={{ ...css("width:8px;height:8px;border-radius:2px;"), background: c.color }} />{c.label}
            </button>
          ))}
        </div>

        <label style={css("display:block;font-size:12.5px;color:var(--nw-text2,#B1B1B1);margin-bottom:7px;")}>Belongs to</label>
        <div style={css("display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;")}>
          {ownerOptions.map((o) => (
            <button key={o.id} onClick={() => s.pickOwner(o.id)} style={css(o.chipStyle)}>
              <span style={css(o.avatarStyle)}>{o.initial}</span>{o.label}
            </button>
          ))}
        </div>

        {(m.isGold as boolean) && (
          <div style={css("display:flex;background:var(--nw-inputbg,#0E0E0E);border:1px solid var(--nw-inputbd,#2E2E2E);border-radius:10px;padding:4px;gap:4px;margin-bottom:14px;")}>
            <button onClick={() => s.setEntryMode("value")} style={css(m.modeValueStyle as string)}>Enter value</button>
            <button onClick={() => s.setEntryMode("weight")} style={css(m.modeWeightStyle as string)}>By weight</button>
          </div>
        )}

        {(m.byWeight as boolean) && (
          <>
            <div style={css("display:flex;gap:8px;margin-bottom:12px;")}>
              {metalOptions.map((mt) => (
                <button key={mt.key} onClick={() => s.pickMetal(mt.key)} style={css(mt.chipStyle)}>{mt.label}</button>
              ))}
            </div>
            <div style={css("display:flex;gap:10px;margin-bottom:10px;")}>
              <div style={{ flex: 1 }}>
                <label style={css("display:block;font-size:12px;color:var(--nw-text2,#B1B1B1);margin-bottom:6px;")}>Weight (grams)</label>
                <input value={m.draftGrams as string} onChange={(e) => s.setGrams(e.target.value)} inputMode="decimal" placeholder="0" style={css("width:100%;height:46px;padding:0 14px;border-radius:10px;border:1px solid var(--nw-inputbd,#2E2E2E);background:var(--nw-inputbg,#0E0E0E);color:var(--nw-text,#fff);font-size:15px;font-family:'Space Grotesk',sans-serif;outline:none;")} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={css("display:block;font-size:12px;color:var(--nw-text2,#B1B1B1);margin-bottom:6px;")}>{m.metalUnitLabel as string}</label>
                <input value={m.metalRateStr as string} onChange={(e) => s.setRateFromModal(e.target.value)} inputMode="numeric" style={css("width:100%;height:46px;padding:0 14px;border-radius:10px;border:1px solid var(--nw-inputbd,#2E2E2E);background:var(--nw-inputbg,#0E0E0E);color:var(--nw-text,#fff);font-size:15px;font-family:'Space Grotesk',sans-serif;outline:none;")} />
              </div>
            </div>
            <div style={css("font-size:12.5px;color:var(--nw-gold,#D5B475);margin-bottom:22px;")}>{m.weightPreview as string}</div>
          </>
        )}

        {(m.notByWeight as boolean) && (
          <>
            <label style={css("display:block;font-size:12.5px;color:var(--nw-text2,#B1B1B1);margin-bottom:7px;")}>Value (₹)</label>
            <div style={css("position:relative;margin-bottom:6px;")}>
              <span style={css("position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--nw-text3,#8A8A8A);font-size:16px;")}>₹</span>
              <input value={m.draftValueStr as string} onChange={(e) => s.setValue(e.target.value)} inputMode="numeric" placeholder="0" style={css("width:100%;height:48px;padding:0 14px 0 30px;border-radius:10px;border:1px solid var(--nw-inputbd,#2E2E2E);background:var(--nw-inputbg,#0E0E0E);color:var(--nw-text,#fff);font-size:16px;font-family:'Space Grotesk',sans-serif;font-weight:500;outline:none;")} />
            </div>
            <div style={css("display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px;")}>
              {quickAmounts.map((q, i) => (
                <button key={i} onClick={() => s.addQuick(q.amt)} style={css("height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--nw-chipbd,#2A2A2A);background:transparent;color:var(--nw-text2,#B1B1B1);font-size:12px;cursor:pointer;")}>+{q.label}</button>
              ))}
            </div>
          </>
        )}

        <label style={css("display:block;font-size:12.5px;color:var(--nw-text2,#B1B1B1);margin-bottom:7px;")}>Note <span style={css("color:var(--nw-text3,#8A8A8A);font-weight:400;")}>(optional)</span></label>
        <textarea value={m.draftNote as string} onChange={(e) => s.setDraft({ note: e.target.value })} placeholder="Account no., maturity date, anything to remember…" rows={2} style={css("width:100%;padding:11px 14px;border-radius:10px;border:1px solid var(--nw-inputbd,#2E2E2E);background:var(--nw-inputbg,#0E0E0E);color:var(--nw-text,#fff);font-size:14px;outline:none;resize:vertical;margin-bottom:14px;font-family:'Inter',sans-serif;")} />
        <label style={css("display:block;font-size:12.5px;color:var(--nw-text2,#B1B1B1);margin-bottom:7px;")}>Reference / link <span style={css("color:var(--nw-text3,#8A8A8A);font-weight:400;")}>(optional)</span></label>
        <div style={css("position:relative;margin-bottom:22px;")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nw-text3,#8A8A8A)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}><path d="M9 15l6-6M8 12l-2 2a3 3 0 004 4l2-2M16 12l2-2a3 3 0 00-4-4l-2 2" /></svg>
          <input value={m.draftRef as string} onChange={(e) => s.setDraft({ ref: e.target.value })} placeholder="Folio no., statement URL, locker…" style={css("width:100%;height:46px;padding:0 14px 0 36px;border-radius:10px;border:1px solid var(--nw-inputbd,#2E2E2E);background:var(--nw-inputbg,#0E0E0E);color:var(--nw-text,#fff);font-size:14px;outline:none;")} />
        </div>

        <div style={css("display:flex;gap:10px;align-items:center;")}>
          {(m.isEdit as boolean) && (
            <button onClick={s.deleteCurrent} style={css("height:52px;padding:0 18px;border-radius:999px;border:1px solid #D8645D55;background:transparent;color:#D8645D;font-size:15px;font-weight:500;cursor:pointer;")}>Delete</button>
          )}
          <button onClick={s.saveDraft} disabled={!(m.canSave as boolean)} style={css(m.saveBtnStyle as string)}>{m.saveLabel as string}</button>
        </div>
      </div>
    </div>
  );
}
