import { css } from "../lib/style";
import { useStore } from "../store/useStore";
import type { Derived } from "../lib/derive";
import type { Kind } from "../types";

export default function Dashboard({ d }: { d: Derived }) {
  const s = useStore();
  const onboardAction: Record<string, () => void> = {
    asset: s.openAddAsset,
    liab: s.openAddLiab,
    family: s.openAddMember,
    note: s.openAddAsset,
  };

  return (
    <div>
      {/* ONBOARDING CHECKLIST */}
      {d.showOnboard && (
        <div data-noprint style={css("position:relative;overflow:hidden;background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:var(--nw-cardsh,none);")}>
          <div style={css("display:flex;align-items:flex-start;gap:12px;")}>
            <div style={{ flex: 1 }}>
              <div style={css("font-family:'Lora',serif;font-size:19px;font-weight:500;")}>Finish setting up</div>
              <div style={css("font-size:13px;color:var(--nw-text3,#8A8A8A);margin-top:2px;")}>A few quick steps to a complete picture · {d.obProgressLabel}</div>
            </div>
            <button onClick={s.dismissOnboard} style={css("background:transparent;border:none;color:var(--nw-text3,#8A8A8A);font-size:12.5px;cursor:pointer;padding:4px;")}>Dismiss</button>
          </div>
          <div style={css("height:6px;border-radius:3px;background:var(--nw-track,#202020);overflow:hidden;margin:14px 0 4px;")}>
            <div style={{ ...css("height:100%;background:linear-gradient(90deg,#19AA4D,#8BF1A7);transition:width .3s ease;"), width: d.obPct }} />
          </div>
          <div style={css("display:flex;flex-direction:column;")}>
            {d.onboardCards.map((st) => (
              <button key={st.key} onClick={st.pending ? onboardAction[st.key] : undefined} style={css(st.rowStyle)}>
                <span style={css(st.markStyle)}>{st.done ? "✓" : st.num}</span>
                <span style={css(st.textStyle)}>{st.label}</span>
                {st.pending && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nw-text3,#5E5E5E)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={css("position:relative;overflow:hidden;background:linear-gradient(135deg,#0A1F45 0%,#0B2960 52%,#122A6A 100%);border-radius:20px;padding:28px 28px 26px;margin-bottom:16px;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.05);color:#fff;")}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }} viewBox="0 0 600 220" preserveAspectRatio="none"><path d="M0,180 Q150,90 320,140 T600,110 L600,220 L0,220Z" fill="rgba(120,160,255,0.07)" /><path d="M0,190 Q180,120 360,160 T600,150" fill="none" stroke="rgba(180,200,255,0.16)" strokeWidth="1" /></svg>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={css("display:flex;align-items:center;gap:8px;color:#A8B6D6;font-size:12px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;")}>Total net worth</div>
          <div style={css("display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap;margin-top:10px;")}>
            <div style={{ ...css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:56px;line-height:0.95;letter-spacing:-0.02em;"), color: d.heroNwColor }}>{d.nwFull}</div>
            {d.hasDelta && (
              <div style={{ ...css("display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;font-size:13px;font-weight:600;margin-bottom:8px;"), background: d.deltaBg, color: d.deltaColor }}>{d.deltaArrow} {d.deltaLabel}</div>
            )}
          </div>
          <div style={css("color:#96A6C9;font-size:13.5px;margin-top:8px;")}>{d.nwCompact} · updated just now</div>
          <div style={css("display:flex;gap:12px;flex-wrap:wrap;margin-top:22px;")}>
            <div style={css("flex:1;min-width:150px;background:rgba(0,0,0,0.28);border-radius:12px;padding:14px 16px;")}>
              <div style={css("display:flex;align-items:center;gap:7px;color:#8BF1A7;font-size:12px;font-weight:500;")}><span style={css("width:8px;height:8px;border-radius:2px;background:#19AA4D;")} />Assets</div>
              <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:24px;margin-top:6px;")}>{d.assetsFull}</div>
              <div style={css("color:#7E90B3;font-size:11.5px;margin-top:2px;")}>{d.assetCount} holdings</div>
            </div>
            <div style={css("flex:1;min-width:150px;background:rgba(0,0,0,0.28);border-radius:12px;padding:14px 16px;")}>
              <div style={css("display:flex;align-items:center;gap:7px;color:#FE817B;font-size:12px;font-weight:500;")}><span style={css("width:8px;height:8px;border-radius:2px;background:#D8645D;")} />Liabilities</div>
              <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:24px;margin-top:6px;")}>{d.liabFull}</div>
              <div style={css("color:#7E90B3;font-size:11.5px;margin-top:2px;")}>{d.liabCount} debts</div>
            </div>
          </div>
        </div>
      </div>

      {/* HOUSEHOLD STRIP */}
      <div style={css("background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:16px;padding:18px 20px;margin-bottom:16px;box-shadow:var(--nw-cardsh,none);")}>
        <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ stroke: "var(--nw-gold,#D5B475)" }} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M15 11a3 3 0 100-6M2.5 20c0-3.3 2.9-5 6.5-5s6.5 1.7 6.5 5M17 15c2.8.4 4.5 2 4.5 5" /></svg>
          <span style={css("font-family:'Lora',serif;font-size:17px;font-weight:500;")}>Household</span>
          <span style={css("font-size:12.5px;color:var(--nw-text3,#8A8A8A);")}>· {d.householdLabel}</span>
          <span style={{ flex: 1 }} />
          <button onClick={s.openManageMembers} style={css("display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 13px;border:1px solid var(--nw-chipbd,#2A2A2A);border-radius:999px;background:transparent;color:var(--nw-text2,#B1B1B1);font-size:12.5px;font-weight:500;cursor:pointer;")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 00-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 00-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 000 2l-2 1.5 2 3.5 2.4-1a7 7 0 001.7 1l.3 2.5h4l.3-2.5a7 7 0 001.7-1l2.4 1 2-3.5-2-1.5a7 7 0 00.1-1z" /></svg>
            Manage
          </button>
        </div>
        <div style={css("display:flex;gap:12px;flex-wrap:wrap;")}>
          {d.memberCards.map((mb) => (
            <div key={mb.id} onClick={() => s.toggleMember(mb.id)} style={css(mb.cardStyle)}>
              <div style={css("display:flex;align-items:center;gap:10px;")}>
                <span style={css(mb.avatarStyle)}>{mb.initial}</span>
                <div style={{ ...css("flex:1;min-width:0;"), opacity: mb.nameOpacity }}>
                  <div style={css("font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{mb.name}</div>
                  <div style={css("font-size:11.5px;color:var(--nw-text3,#8A8A8A);")}>{mb.relation}</div>
                </div>
                <div style={css(mb.switchTrack)}><div style={css(mb.switchKnob)} /></div>
              </div>
              <div style={{ ...css("display:flex;align-items:baseline;justify-content:space-between;margin-top:12px;"), opacity: mb.nameOpacity }}>
                <span style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;")}>{mb.nwC}</span>
                <span style={css("font-size:11px;color:var(--nw-text3,#8A8A8A);")}>{mb.itemCountLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHART CARDS */}
      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-bottom:16px;")}>
        {/* Donut */}
        <div style={css("background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:16px;padding:20px;box-shadow:var(--nw-cardsh,none);")}>
          <div style={css("font-size:11px;font-weight:600;letter-spacing:0.12em;color:var(--nw-text3,#7E7E7E);text-transform:uppercase;")}>Asset allocation</div>
          <div style={css("display:flex;align-items:center;gap:18px;margin-top:14px;flex-wrap:wrap;")}>
            <div style={css("position:relative;width:160px;height:160px;flex-shrink:0;")}>
              <svg width="160" height="160" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="70" fill="none" style={{ stroke: "var(--nw-track,#202020)" }} strokeWidth="22" />
                <g transform="rotate(-90 90 90)">
                  {d.donutSegs.map((seg, i) => (
                    <circle key={i} cx="90" cy="90" r="70" fill="none" stroke={seg.color} strokeWidth="22" strokeDasharray={seg.dash} strokeDashoffset={seg.offset} />
                  ))}
                </g>
              </svg>
              <div style={css("position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;")}>
                <span style={css("font-size:10.5px;color:var(--nw-text3,#7E7E7E);")}>Assets</span>
                <span style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:19px;color:var(--nw-gold,#D5B475);")}>{d.totalAssetsC}</span>
              </div>
            </div>
            <div style={css("flex:1;min-width:130px;display:flex;flex-direction:column;gap:8px;")}>
              {d.donutLegend.map((lg, i) => (
                <div key={i} style={css("display:flex;align-items:center;gap:8px;font-size:12.5px;")}>
                  <span style={{ ...css("width:9px;height:9px;border-radius:3px;flex-shrink:0;"), background: lg.color }} />
                  <span style={css("flex:1;color:var(--nw-legend,#CFCFCF);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{lg.label}</span>
                  <span style={css("color:var(--nw-text3,#8A8A8A);font-variant-numeric:tabular-nums;")}>{lg.pctLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assets vs Liabilities */}
        <div style={css("background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:16px;padding:20px;box-shadow:var(--nw-cardsh,none);")}>
          <div style={css("font-size:11px;font-weight:600;letter-spacing:0.12em;color:var(--nw-text3,#7E7E7E);text-transform:uppercase;")}>Assets vs liabilities</div>
          <div style={css("display:flex;align-items:flex-end;gap:24px;margin-top:16px;height:150px;")}>
            <div style={css("display:flex;align-items:flex-end;gap:20px;height:100%;padding-bottom:2px;")}>
              <div style={css("display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end;")}>
                <span style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;color:var(--nw-green,#8BF1A7);")}>{d.totalAssetsC}</span>
                <div style={{ ...css("width:46px;border-radius:8px 8px 0 0;background:linear-gradient(180deg,#19AA4D,#0F6E35);min-height:6px;"), height: d.avlAssetH }} />
                <span style={css("font-size:11px;color:var(--nw-text3,#8A8A8A);")}>Assets</span>
              </div>
              <div style={css("display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end;")}>
                <span style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;color:var(--nw-red,#FE817B);")}>{d.totalLiabC}</span>
                <div style={{ ...css("width:46px;border-radius:8px 8px 0 0;background:linear-gradient(180deg,#D8645D,#7A2A28);min-height:6px;"), height: d.avlLiabH }} />
                <span style={css("font-size:11px;color:var(--nw-text3,#8A8A8A);")}>Owed</span>
              </div>
            </div>
            <div style={css("flex:1;display:flex;flex-direction:column;justify-content:center;border-left:1px solid var(--nw-cardbd,#242424);padding-left:20px;height:100%;")}>
              <div style={css("font-size:11px;color:var(--nw-text3,#7E7E7E);")}>Net worth</div>
              <div style={{ ...css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;letter-spacing:-0.01em;margin-top:4px;"), color: d.nwColor }}>{d.totalNwC}</div>
              <div style={css("font-size:12px;color:var(--nw-text3,#8A8A8A);margin-top:8px;line-height:1.5;")}>{d.leverageLabel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* LIQUID vs LOCKED */}
      <div style={css("background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:var(--nw-cardsh,none);")}>
        <div style={css("display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px;")}>
          <div style={css("font-size:11px;font-weight:600;letter-spacing:0.12em;color:var(--nw-text3,#7E7E7E);text-transform:uppercase;")}>Liquid vs locked</div>
          <div style={css("font-size:12.5px;color:var(--nw-text3,#8A8A8A);")}>{d.liqPctLabel} reachable now</div>
        </div>
        <div style={css("display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--nw-track,#202020);margin:16px 0 16px;")}>
          {d.liqBreakdown.map((b, i) => (
            <div key={i} style={{ ...css("transition:width .3s ease;"), width: b.w, background: b.color }} />
          ))}
        </div>
        <div style={css("display:flex;gap:14px;flex-wrap:wrap;")}>
          {d.liqBreakdown.map((b, i) => (
            <div key={i} style={css("flex:1;min-width:150px;")}>
              <div style={css("display:flex;align-items:center;gap:8px;")}>
                <span style={{ ...css("width:9px;height:9px;border-radius:3px;"), background: b.color }} />
                <span style={css("font-size:12.5px;color:var(--nw-text2,#B1B1B1);")}>{b.label}</span>
              </div>
              <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;margin-top:6px;")}>{b.valC}</div>
              <div style={css("font-size:11.5px;color:var(--nw-text3,#8A8A8A);")}>{b.pct} of assets</div>
            </div>
          ))}
        </div>
        <div style={css("display:flex;align-items:center;gap:8px;margin-top:16px;padding-top:14px;border-top:1px solid var(--nw-hair,#202020);color:var(--nw-text3,#8A8A8A);font-size:12.5px;line-height:1.5;")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ stroke: "var(--nw-gold,#D5B475)", flexShrink: 0 }} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z" /></svg>
          {d.emergencyLabel}
        </div>
      </div>

      {/* Net worth trend */}
      <div style={css("background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:var(--nw-cardsh,none);")}>
        <div style={css("display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px;")}>
          <div style={css("font-size:11px;font-weight:600;letter-spacing:0.12em;color:var(--nw-text3,#7E7E7E);text-transform:uppercase;")}>Net worth over time</div>
          {d.hasTrend && <div style={css("font-size:12.5px;color:var(--nw-green,#8BF1A7);font-weight:500;")}>{d.trendGrowthLabel} since {d.firstMonthLabel}</div>}
        </div>
        {d.hasTrend ? (
          <div style={css("margin-top:14px;position:relative;")}>
            <svg width="100%" height="180" viewBox="0 0 640 200" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
              <defs><linearGradient id="nwArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: "var(--nw-gold,#D5B475)", stopOpacity: 0.28 }} /><stop offset="1" style={{ stopColor: "var(--nw-gold,#D5B475)", stopOpacity: 0 }} /></linearGradient></defs>
              <line x1="0" y1="50" x2="640" y2="50" style={{ stroke: "var(--nw-grid,#1E1E1E)" }} strokeWidth="1" />
              <line x1="0" y1="100" x2="640" y2="100" style={{ stroke: "var(--nw-grid,#1E1E1E)" }} strokeWidth="1" />
              <line x1="0" y1="150" x2="640" y2="150" style={{ stroke: "var(--nw-grid,#1E1E1E)" }} strokeWidth="1" />
              <path d={d.lineArea} fill="url(#nwArea)" />
              <path d={d.linePath} fill="none" style={{ stroke: "var(--nw-gold,#D5B475)" }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {d.lineDots.map((dot, i) => (
                <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} style={{ fill: "var(--nw-bg,#0B0B0B)", stroke: "var(--nw-gold,#D5B475)" }} strokeWidth="2.5" />
              ))}
            </svg>
            <div style={css("display:flex;justify-content:space-between;margin-top:8px;")}>
              {d.lineLabels.map((lb, i) => (
                <span key={i} style={css("font-size:10.5px;color:var(--nw-muted,#6E6E6E);")}>{lb}</span>
              ))}
            </div>
          </div>
        ) : (
          <div style={css("margin-top:16px;padding:26px 4px;text-align:center;color:var(--nw-text3,#8A8A8A);font-size:13px;line-height:1.55;")}>
            Your net worth trend builds up as you track over time.<br />This month is your first data point — check back next month to see the line grow.
          </div>
        )}
      </div>

      {/* ASSETS & LIABILITIES COLUMNS */}
      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;")}>
        <CatColumn
          d={d} title="Assets" dotColor="#19AA4D" totalColor="var(--nw-green,#8BF1A7)"
          totalC={d.totalAssetsC} rows={d.assetCatRows} addColor="var(--nw-green,#8BF1A7)"
          addLabel="Add asset" onAdd={s.openAddAsset} kind="asset" emptyShown={false}
        />
        <CatColumn
          d={d} title="Liabilities" dotColor="#D8645D" totalColor="var(--nw-red,#FE817B)"
          totalC={d.totalLiabC} rows={d.liabCatRows} addColor="var(--nw-red,#FE817B)"
          addLabel="Add liability" onAdd={s.openAddLiab} kind="liability" emptyShown={d.noLiab}
        />
      </div>
    </div>
  );
}

function CatColumn(props: {
  d: Derived;
  title: string; dotColor: string; totalColor: string; totalC: string;
  rows: Derived["assetCatRows"]; addColor: string; addLabel: string; onAdd: () => void;
  kind: Kind; emptyShown: boolean;
}) {
  const openCategory = useStore((s) => s.openCategory);
  const { title, dotColor, totalColor, totalC, rows, addColor, addLabel, onAdd, kind, emptyShown } = props;
  return (
    <div style={css("background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:16px;padding:20px;box-shadow:var(--nw-cardsh,none);")}>
      <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;")}>
        <div style={css("display:flex;align-items:center;gap:9px;")}><span style={{ ...css("width:9px;height:9px;border-radius:3px;"), background: dotColor }} /><span style={css("font-family:'Lora',serif;font-size:18px;font-weight:500;")}>{title}</span></div>
        <span style={{ ...css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;"), color: totalColor }}>{totalC}</span>
      </div>
      <div style={css("display:flex;height:8px;border-radius:4px;overflow:hidden;background:var(--nw-track,#202020);margin:12px 0 6px;")}>
        {rows.map((c) => (
          <div key={c.key} style={{ ...css("min-width:0;"), flex: `${c.flex} 1 0`, background: c.color }} />
        ))}
      </div>
      {(!emptyShown) && (
        <div style={css("display:flex;flex-direction:column;")}>
          {rows.map((c) => (
            <button key={c.key} onClick={() => openCategory(kind, c.key)} style={css("display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:transparent;border:none;border-top:1px solid var(--nw-hair,#202020);padding:13px 2px;cursor:pointer;color:var(--nw-text,#fff);")}>
              <span style={{ ...css("width:38px;height:38px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;"), background: c.tint }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={c.iconPath} /></svg>
              </span>
              <span style={css("flex:1;min-width:0;")}>
                <span style={css("display:block;font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{c.label}</span>
                <span style={css("display:block;font-size:12px;color:var(--nw-text3,#8A8A8A);")}>{c.count} · {c.pctLabel}</span>
              </span>
              <span style={{ textAlign: "right" }}>
                <span style={css("display:block;font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:14px;")}>{c.totalC}</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "var(--nw-icongrey,#5E5E5E)" }} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          ))}
        </div>
      )}
      {emptyShown && (
        <div style={css("padding:22px 4px;text-align:center;color:var(--nw-text3,#7E7E7E);font-size:13px;line-height:1.5;")}>No debts added.<br />Debt-free, or add what you owe.</div>
      )}
      <button onClick={onAdd} style={{ ...css("width:100%;margin-top:14px;height:44px;border:1px dashed var(--nw-dash,#333);border-radius:12px;background:transparent;font-size:14px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;"), color: addColor }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg> {addLabel}
      </button>
    </div>
  );
}
