import { useEffect } from "react";
import { css } from "./lib/style";
import { DARK_VARS, LIGHT_VARS } from "./constants";
import { derive } from "./lib/derive";
import { useStore } from "./store/useStore";
import { initSync } from "./lib/sync";
import { initHistory } from "./lib/history";
import TopBar from "./components/TopBar";
import EmptyState from "./components/EmptyState";
import Dashboard from "./components/Dashboard";
import CategoryDrilldown from "./components/CategoryDrilldown";
import HistoryView from "./components/HistoryView";
import AddEditModal from "./components/AddEditModal";
import ManageMembersModal from "./components/ManageMembersModal";

export default function App() {
  const s = useStore();
  useEffect(() => {
    useStore.getState().init();
    initHistory();
    initSync();
  }, []);

  const d = derive({
    assets: s.assets, liab: s.liab, loaded: s.loaded, theme: s.theme,
    included: s.included, members: s.members, rates: s.rates,
    onboardDismissed: s.onboardDismissed, view: s.view,
    catSel: s.catSel, modal: s.modal, memberModal: s.memberModal,
    history: s.history, currentMonth: new Date().toISOString().slice(0, 7),
  });

  const themeVars = d.dark ? DARK_VARS : LIGHT_VARS;

  return (
    <div style={{ ...css("min-height:100vh;background:var(--nw-bg,#0B0B0B);color:var(--nw-text,#fff);"), ...css(themeVars) }}>
      <TopBar d={d} />

      <div style={css("max-width:1120px;margin:0 auto;padding:24px;")}>
        {d.isEmpty && <EmptyState />}

        {d.showApp && (
          <div style={{ animation: "nwfade .25s ease-out" }}>
            {/* View switcher */}
            <div data-noprint style={css("display:flex;align-items:center;gap:8px;margin-bottom:20px;flex-wrap:wrap;")}>
              <div style={css("display:inline-flex;background:var(--nw-card,#141414);border:1px solid var(--nw-cardbd,#242424);border-radius:999px;padding:4px;gap:2px;")}>
                <button onClick={s.gotoDashboard} style={css(d.tabDashStyle)}>Dashboard</button>
                <button onClick={s.gotoHistory} style={css(d.tabHistStyle)}>History</button>
              </div>
              <div style={{ flex: 1 }} />
              <button onClick={s.exportCSV} title="Download CSV" style={css("display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 13px;border:1px solid var(--nw-cardbd,#242424);border-radius:999px;background:transparent;color:var(--nw-text2,#B1B1B1);font-size:12.5px;font-weight:500;cursor:pointer;")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M8 11l4 4 4-4M4 20h16" /></svg> CSV
              </button>
              <button onClick={s.exportPDF} title="Save as PDF" style={css("display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 13px;border:1px solid var(--nw-cardbd,#242424);border-radius:999px;background:transparent;color:var(--nw-text2,#B1B1B1);font-size:12.5px;font-weight:500;cursor:pointer;")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3h7l5 5v13H7zM14 3v5h5M9 13h6M9 17h6" /></svg> PDF
              </button>
              <button onClick={s.clearAll} style={css("height:34px;padding:0 14px;border:1px solid var(--nw-cardbd,#242424);border-radius:999px;background:transparent;color:var(--nw-text2,#9A9A9A);font-size:12.5px;font-weight:500;cursor:pointer;")}>Reset</button>
            </div>

            {d.viewDashboard && <Dashboard d={d} />}
            {d.viewCategory && <CategoryDrilldown d={d} />}
            {d.viewHistory && <HistoryView d={d} />}
          </div>
        )}
      </div>

      <AddEditModal d={d} />
      <ManageMembersModal d={d} />
    </div>
  );
}
