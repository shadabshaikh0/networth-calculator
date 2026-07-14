import { css } from "../lib/style";
import { useStore } from "../store/useStore";
import type { Derived } from "../lib/derive";

interface MMember { id: string; name: string; relation: string; initial: string; isSelf: boolean; notSelf: boolean; countLabel: string; avatarStyle: string; }
interface MRelation { label: string; chipStyle: string; }
interface MColor { color: string; swatchStyle: string; }

export default function ManageMembersModal({ d }: { d: Derived }) {
  const s = useStore();
  const mm = d.memberModalVals as Record<string, unknown>;
  if (!mm.memberModalOpen) return null;

  const mmMembers = mm.mmMembers as MMember[];
  const mmRelations = mm.mmRelations as MRelation[];
  const mmColors = mm.mmColors as MColor[];

  return (
    <div style={css("position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:20px;")}>
      <div onClick={s.closeMemberModal} style={css("position:absolute;inset:0;background:rgba(0,0,0,0.6);animation:nwscrim .18s ease-out;")} />
      <div style={css("position:relative;width:100%;max-width:460px;max-height:90vh;overflow-y:auto;background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#2A2A2A);border-radius:24px;padding:22px 22px 26px;animation:nwsheet .28s cubic-bezier(0.2,0.8,0.2,1);box-shadow:0 24px 64px rgba(0,0,0,0.4);color:var(--nw-text,#fff);")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;")}>
          <div style={css("font-family:'Lora',serif;font-size:21px;font-weight:500;")}>{mm.mmTitle as string}</div>
          <button onClick={s.closeMemberModal} style={css("width:34px;height:34px;border-radius:9px;border:1px solid var(--nw-btnbd,#2A2A2A);background:transparent;color:var(--nw-text2,#B1B1B1);cursor:pointer;display:flex;align-items:center;justify-content:center;")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div style={css("font-size:13px;color:var(--nw-text3,#8A8A8A);margin-bottom:20px;")}>{mm.mmSubtitle as string}</div>

        {(mm.mmList as boolean) && (
          <div>
            <div style={css("display:flex;flex-direction:column;border:1px solid var(--nw-cardbd,#242424);border-radius:14px;overflow:hidden;margin-bottom:16px;")}>
              {mmMembers.map((p) => (
                <div key={p.id} style={css("display:flex;align-items:center;gap:12px;padding:14px 14px;border-bottom:1px solid var(--nw-hair,#202020);")}>
                  <span style={css(p.avatarStyle)}>{p.initial}</span>
                  <div style={css("flex:1;min-width:0;")}>
                    <div style={css("font-size:15px;font-weight:600;")}>{p.name}</div>
                    <div style={css("font-size:12px;color:var(--nw-text3,#8A8A8A);")}>{p.relation} · {p.countLabel}</div>
                  </div>
                  <button onClick={() => s.openEditMember(p.id)} title="Edit" style={css("width:34px;height:34px;border-radius:9px;border:1px solid var(--nw-btnbd,#2A2A2A);background:transparent;color:var(--nw-text2,#B1B1B1);cursor:pointer;display:flex;align-items:center;justify-content:center;")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4l10-10-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg>
                  </button>
                  {p.isSelf && <span style={css("min-width:34px;text-align:center;font-size:9.5px;font-weight:600;letter-spacing:0.06em;color:var(--nw-text3,#8A8A8A);")}>YOU</span>}
                  {p.notSelf && (
                    <button onClick={() => s.removeMember(p.id)} title="Remove" style={css("width:34px;height:34px;border-radius:9px;border:1px solid var(--nw-btnbd,#2A2A2A);background:transparent;color:#D8645D;cursor:pointer;display:flex;align-items:center;justify-content:center;")}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={s.openAddMember} style={css("width:100%;height:50px;border:1px dashed var(--nw-dash,#333);border-radius:12px;background:transparent;color:var(--nw-text,#fff);font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg> Add family member
            </button>
          </div>
        )}

        {(mm.mmForm as boolean) && (
          <div>
            <div style={css("display:flex;align-items:center;gap:12px;background:var(--nw-inputbg,#0E0E0E);border-radius:14px;padding:14px 16px;margin-bottom:20px;")}>
              <span style={css(mm.mmPreviewAvatar as string)}>{mm.mmPreviewInitial as string}</span>
              <div style={css("font-size:13px;color:var(--nw-text3,#8A8A8A);")}>This colour and initial mark everything they own across your dashboard.</div>
            </div>

            <label style={css("display:block;font-size:12.5px;color:var(--nw-text2,#B1B1B1);margin-bottom:7px;")}>Name</label>
            <input value={mm.mmDraftName as string} onChange={(e) => s.setMemberDraft({ name: e.target.value })} placeholder="e.g. Priya" style={css("width:100%;height:48px;padding:0 14px;border-radius:10px;border:1px solid var(--nw-inputbd,#2E2E2E);background:var(--nw-inputbg,#0E0E0E);color:var(--nw-text,#fff);font-size:15px;outline:none;margin-bottom:16px;")} />

            {(mm.mmNotSelf as boolean) && (
              <>
                <label style={css("display:block;font-size:12.5px;color:var(--nw-text2,#B1B1B1);margin-bottom:7px;")}>Relationship</label>
                <div style={css("display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;")}>
                  {mmRelations.map((r) => (
                    <button key={r.label} onClick={() => s.setMemberDraft({ relation: r.label })} style={css(r.chipStyle)}>{r.label}</button>
                  ))}
                </div>
              </>
            )}

            <label style={css("display:block;font-size:12.5px;color:var(--nw-text2,#B1B1B1);margin-bottom:9px;")}>Colour</label>
            <div style={css("display:flex;flex-wrap:wrap;gap:10px;margin-bottom:24px;")}>
              {mmColors.map((c) => (
                <button key={c.color} onClick={() => s.setMemberDraft({ color: c.color })} style={css(c.swatchStyle)} />
              ))}
            </div>

            <div style={css("display:flex;gap:10px;align-items:center;")}>
              <button onClick={s.openManageMembers} style={css("height:50px;padding:0 18px;border-radius:999px;border:1px solid var(--nw-btnbd,#2A2A2A);background:transparent;color:var(--nw-text2,#B1B1B1);font-size:15px;font-weight:500;cursor:pointer;")}>Back</button>
              <button onClick={s.saveMember} style={css(mm.mmSaveStyle as string)}>{mm.mmSaveLabel as string}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
