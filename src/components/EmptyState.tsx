import { css } from "../lib/style";
import { useStore } from "../store/useStore";

export default function EmptyState() {
  const openAddAsset = useStore((s) => s.openAddAsset);
  const loadSample = useStore((s) => s.loadSample);
  return (
    <div style={css("display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:72px 24px;min-height:60vh;")}>
      <div style={css("width:96px;height:96px;border-radius:24px;background:linear-gradient(150deg,#122A6A,#0A1530);display:flex;align-items:center;justify-content:center;margin-bottom:28px;box-shadow:inset 0 0 0 1px #223;")}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#D5B475" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l5-6 4 3 5-8 4 5" /><path d="M3 21h18" /></svg>
      </div>
      <div style={css("font-family:'Lora',serif;font-size:30px;font-weight:500;line-height:1.2;max-width:440px;")}>See your whole financial picture in one place</div>
      <div style={css("color:var(--nw-text2,#B1B1B1);font-size:15px;line-height:1.55;max-width:420px;margin-top:14px;")}>Add what you own and what you owe. We’ll do the math and show your net worth, live.</div>
      <div style={css("display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:32px;")}>
        <button onClick={openAddAsset} style={css("height:50px;padding:0 26px;border:none;border-radius:999px;background:var(--nw-cta-bg,#fff);color:var(--nw-cta-tx,#000);font-size:15px;font-weight:600;cursor:pointer;")}>Add your first asset</button>
        <button onClick={loadSample} style={css("height:50px;padding:0 24px;border:1px solid var(--nw-chipbd,#2E2E2E);border-radius:999px;background:transparent;color:var(--nw-text,#fff);font-size:15px;font-weight:500;cursor:pointer;")}>Load a sample portfolio</button>
      </div>
      <div style={css("display:flex;gap:22px;flex-wrap:wrap;justify-content:center;margin-top:40px;color:var(--nw-text3,#7E7E7E);font-size:12.5px;")}>
        <span>✓ 8 asset types</span><span>✓ 6 liability types</span><span>✓ Nothing leaves your device</span>
      </div>
    </div>
  );
}
