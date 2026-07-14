import {
  ASSET_CATS, LIAB_CATS, DEFAULT_RATES, LIQUIDITY, METALS, MEMBER_COLORS,
  RELATIONS, SEED_HISTORY,
} from "../constants";
import type {
  CatSel, CategoryDef, Included, Item, Kind, Member, MemberModalDraft, ModalDraft, Rates,
} from "../types";
import { compact, inr, tintFor } from "./format";

interface DeriveInput {
  assets: Item[];
  liab: Item[];
  loaded: boolean;
  theme: "dark" | "light";
  included: Included;
  members: Member[];
  rates: Rates;
  onboardDismissed: boolean;
  view: string;
  catSel: CatSel | null;
  modal: ModalDraft | null;
  memberModal: MemberModalDraft | null;
}

const catMetaOf = (list: CategoryDef[], key: string) => list.find((c) => c.key === key) || list[list.length - 1];

export function derive(state: DeriveInput) {
  const A = ASSET_CATS, L = LIAB_CATS;
  const rates = { ...DEFAULT_RATES, ...(state.rates || {}) };
  const resolve = (i: Item): Item =>
    i.grams && i.metal && rates[i.metal] ? { ...i, value: Math.round(i.grams * rates[i.metal]) } : i;
  const assets = state.assets.map(resolve);
  const liab = state.liab.map(resolve);
  const loaded = state.loaded;
  const theme = state.theme;
  const dark = theme !== "light";
  const included = state.included || {};
  const incOwner = (i: Item) => included[i.owner || "self"] !== false;
  const visA = assets.filter((i) => !i.hidden && incOwner(i));
  const visL = liab.filter((i) => !i.hidden && incOwner(i));
  const totalAssets = visA.reduce((s, i) => s + i.value, 0);
  const totalLiab = visL.reduce((s, i) => s + i.value, 0);
  const nw = totalAssets - totalLiab;
  const isEmpty = loaded && assets.length === 0 && liab.length === 0;
  const showApp = loaded && !isEmpty;
  const nwColor = nw >= 0 ? "var(--nw-gold)" : "var(--nw-red)";
  const heroNwColor = nw >= 0 ? "#D5B475" : "#FE817B";

  const members = state.members && state.members.length ? state.members : [];
  const memberMeta = (id: string) => members.find((m) => m.id === id) || members[0];

  // trend
  const hist = SEED_HISTORY.concat([{ label: "Now", value: nw }]);
  const histVals = hist.map((h) => h.value);
  const hMin = Math.min(...histVals), hMax = Math.max(...histVals);
  const span = hMax - hMin || 1;
  const firstV = histVals[0];
  const growthPct = firstV ? ((nw - firstV) / Math.abs(firstV)) * 100 : 0;
  const trendGrowthLabel = (growthPct >= 0 ? "▲ " : "▼ ") + Math.abs(growthPct).toFixed(1) + "%";

  const lineGeom = (W: number, H: number, pad: number) => {
    const n = hist.length;
    const xs = hist.map((_h, i) => (n === 1 ? W / 2 : pad + (i * (W - 2 * pad)) / (n - 1)));
    const ys = hist.map((h) => H - pad - ((h.value - hMin) / span) * (H - 2 * pad));
    const path = xs.map((x, i) => (i === 0 ? "M" : "L") + x.toFixed(1) + " " + ys[i].toFixed(1)).join(" ");
    const area = path + ` L${xs[xs.length - 1].toFixed(1)} ${H} L${xs[0].toFixed(1)} ${H} Z`;
    const dots = xs.map((x, i) => ({ cx: x.toFixed(1), cy: ys[i].toFixed(1), r: i === xs.length - 1 ? "5" : "3.5" }));
    return { path, area, dots };
  };
  const g1 = lineGeom(640, 200, 16);
  const g2 = lineGeom(640, 260, 20);

  // groupBy
  const groupBy = (items: Item[], cats: CategoryDef[]) => {
    const inc = (i: Item) => (included ? included[i.owner || "self"] !== false : true);
    return cats
      .map((c) => {
        const its = items.filter((i) => i.cat === c.key && inc(i));
        const vis = its.filter((i) => !i.hidden);
        const total = vis.reduce((s, i) => s + i.value, 0);
        return { ...c, items: its, total, count: vis.length, hiddenCount: its.length - vis.length };
      })
      .filter((g) => g.items.length > 0);
  };

  const groups = groupBy(assets, A);
  const C = 2 * Math.PI * 70;
  let acc = 0;
  const donutSegs = groups.map((gp) => {
    const frac = totalAssets ? gp.total / totalAssets : 0;
    const len = frac * C;
    const seg = { color: gp.color, dash: `${len.toFixed(2)} ${(C - len).toFixed(2)}`, offset: (-acc * C).toFixed(2) };
    acc += frac;
    return seg;
  });
  const donutLegend = groups.map((gp) => ({
    color: gp.color, label: gp.label,
    pctLabel: (totalAssets ? Math.round((gp.total / totalAssets) * 100) : 0) + "%",
  }));

  const mkCatRow = (gp: ReturnType<typeof groupBy>[number], total: number, kind: Kind) => ({
    key: gp.key, kind,
    color: gp.color, label: gp.label, iconPath: gp.iconPath, tint: tintFor(gp.color),
    count:
      (gp.count > 0 ? gp.count + (gp.count === 1 ? " item" : " items") : "All hidden") +
      (gp.hiddenCount > 0 && gp.count > 0 ? " · " + gp.hiddenCount + " hidden" : ""),
    totalC: compact(gp.total),
    pctLabel: (total ? Math.round((gp.total / total) * 100) : 0) + "%",
    flex: gp.total,
  });
  const assetCatRows = groups.map((gp) => mkCatRow(gp, totalAssets, "asset")).sort((a, b) => b.flex - a.flex);
  const liabGroups = groupBy(liab, L);
  const liabCatRows = liabGroups.map((gp) => mkCatRow(gp, totalLiab, "liability")).sort((a, b) => b.flex - a.flex);

  const maxV = Math.max(totalAssets, totalLiab, 1);
  const avlAssetH = Math.round((totalAssets / maxV) * 130) + "px";
  const avlLiabH = Math.round((totalLiab / maxV) * 130) + "px";
  let leverageLabel: string;
  if (totalLiab === 0) leverageLabel = "Debt-free — every rupee is yours.";
  else leverageLabel = `You owe ${Math.round((totalLiab / totalAssets) * 100)}% of what you own.`;

  const histRows = hist.map((h, i) => {
    const prev = i > 0 ? hist[i - 1].value : h.value;
    const delta = h.value - prev;
    return {
      label: h.label,
      valC: compact(h.value),
      barW: (hMax ? Math.max(4, (h.value / hMax) * 100) : 0) + "%",
      deltaLabel: i === 0 ? "—" : (delta >= 0 ? "+" : "") + compact(delta).replace("₹", ""),
      deltaColor: i === 0 ? "var(--nw-muted)" : delta >= 0 ? "var(--nw-green)" : "var(--nw-red)",
    };
  });

  const prevNw = SEED_HISTORY[SEED_HISTORY.length - 1].value;
  const monthDelta = nw - prevNw;
  const deltaLabel = compact(Math.abs(monthDelta)) + " this month";
  const deltaColor = monthDelta >= 0 ? "#8BF1A7" : "#FE817B";
  const deltaBg = monthDelta >= 0 ? "rgba(25,170,77,0.18)" : "rgba(216,100,93,0.18)";
  const deltaArrow = monthDelta >= 0 ? "▲" : "▼";

  // household members
  const memberCards = members.map((mb) => {
    const mine = (i: Item) => (i.owner || "self") === mb.id && !i.hidden;
    const ma = assets.filter(mine).reduce((s, i) => s + i.value, 0);
    const ml = liab.filter(mine).reduce((s, i) => s + i.value, 0);
    const on = included[mb.id] !== false;
    const itemCount =
      assets.filter((i) => (i.owner || "self") === mb.id).length +
      liab.filter((i) => (i.owner || "self") === mb.id).length;
    return {
      id: mb.id, name: mb.name, relation: mb.relation, color: mb.color,
      initial: mb.name.slice(0, 1).toUpperCase(),
      nwC: compact(ma - ml), included: on,
      itemCountLabel: itemCount + (itemCount === 1 ? " entry" : " entries"),
      cardStyle: `flex:1;min-width:170px;text-align:left;border-radius:14px;padding:14px 16px;cursor:pointer;border:1px solid ${on ? mb.color + "66" : "var(--nw-cardbd)"};background:${on ? tintFor(mb.color) : "transparent"};transition:all .15s ease;`,
      switchTrack: `width:38px;height:22px;border-radius:999px;flex-shrink:0;position:relative;transition:background .15s ease;background:${on ? mb.color : "var(--nw-track)"};`,
      switchKnob: `position:absolute;top:2px;left:${on ? "18px" : "2px"};width:18px;height:18px;border-radius:999px;background:#fff;transition:left .15s ease;box-shadow:0 1px 2px rgba(0,0,0,0.3);`,
      avatarStyle: `width:30px;height:30px;border-radius:999px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#0B0B0B;background:${mb.color};opacity:${on ? "1" : "0.45"};`,
      nameOpacity: on ? "1" : "0.5",
    };
  });
  const includedCount = members.filter((m) => included[m.id] !== false).length;
  const householdLabel = includedCount === members.length ? "Whole household" : includedCount + " of " + members.length + " included";

  // liquid vs locked
  const liquidTotal = visA.filter((i) => LIQUIDITY[i.cat] === "liquid").reduce((s, i) => s + i.value, 0);
  const lockedTotal = totalAssets - liquidTotal;
  const liqPct = totalAssets ? Math.round((liquidTotal / totalAssets) * 100) : 0;
  const emergencyLabel =
    totalLiab > 0
      ? liquidTotal >= totalLiab
        ? "Covers all your debts if needed."
        : "Covers " + (totalLiab ? Math.round((liquidTotal / totalLiab) * 100) : 0) + "% of your debts."
      : "Reachable without selling property or breaking locked savings.";
  const liqBreakdown = [
    { label: "Liquid — reachable now", color: "#8BF1A7", val: liquidTotal, valC: compact(liquidTotal), pct: liqPct + "%", w: (totalAssets ? Math.max(2, (liquidTotal / totalAssets) * 100) : 0) + "%" },
    { label: "Locked — tied up", color: "#A964F7", val: lockedTotal, valC: compact(lockedTotal), pct: 100 - liqPct + "%", w: (totalAssets ? Math.max(2, (lockedTotal / totalAssets) * 100) : 0) + "%" },
  ];

  // onboarding checklist
  const nonSelfMembers = members.filter((m) => m.id !== "self").length;
  const hasNote = assets.concat(liab).some((i) => i.note);
  const obSteps = [
    { key: "asset", label: "Add your first asset", done: assets.length > 0 },
    { key: "liab", label: "Add a liability you owe", done: liab.length > 0 },
    { key: "family", label: "Add a family member", done: nonSelfMembers > 0 },
    { key: "note", label: "Add a note to any entry", done: hasNote },
  ];
  const obDone = obSteps.filter((s) => s.done).length;
  const showOnboard = loaded && !state.onboardDismissed && obDone < obSteps.length;
  const onboardCards = obSteps.map((st, i) => ({
    key: st.key, label: st.label, done: st.done, pending: !st.done, num: i + 1,
    rowStyle: `display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:transparent;border:none;border-top:${i === 0 ? "none" : "1px solid var(--nw-hair,#202020)"};padding:14px 2px;cursor:${st.done ? "default" : "pointer"};color:var(--nw-text,#fff);`,
    markStyle: `width:26px;height:26px;border-radius:999px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;${st.done ? "background:#19AA4D;color:#fff;" : "background:transparent;border:1.5px solid var(--nw-chipbd,#2A2A2A);color:var(--nw-text3,#8A8A8A);"}`,
    textStyle: `flex:1;font-size:14.5px;font-weight:500;${st.done ? "color:var(--nw-text3,#8A8A8A);text-decoration:line-through;" : "color:var(--nw-text,#fff);"}`,
  }));
  const obProgressLabel = obDone + " of " + obSteps.length + " done";
  const obPct = Math.round((obDone / obSteps.length) * 100) + "%";

  const view = state.view;
  const catSel = state.catSel;

  // category drilldown
  interface SelItem {
    id: string; kind: Kind; name: string; valFull: string; barW: string;
    hasNote: boolean; note: string; hasRef: boolean; ref: string;
    hasWeight: boolean; weightLabel: string; hidden: boolean; visible: boolean; contentOp: string;
    ownerInitial: string; ownerName: string; ownerStyle: string;
    excludedTag: boolean; excludedLabel: string; barColor: string;
    toggleColor: string; toggleTitle: string;
  }
  let selVals: {
    selLabel: string; selColor: string; selTint: string; selIconPath: string; selKindLabel: string;
    selCount: number; selTotalFull: string; selPctLabel: string; selHasHidden: boolean; selHiddenNote: string;
    selEmpty: boolean; selItems: SelItem[];
  } | null = null;
  if (view === "category" && catSel) {
    const cats = catSel.kind === "asset" ? A : L;
    const meta = catMetaOf(cats, catSel.key);
    const src = catSel.kind === "asset" ? assets : liab;
    const isExcluded = (i: Item) => included[i.owner || "self"] === false;
    const items = src
      .filter((i) => i.cat === catSel.key)
      .sort((a, b) => (((a.hidden || isExcluded(a)) ? 1 : 0) - ((b.hidden || isExcluded(b)) ? 1 : 0)) || b.value - a.value);
    const visItems = items.filter((i) => !i.hidden && !isExcluded(i));
    const total = visItems.reduce((s, i) => s + i.value, 0);
    const hiddenN = items.length - visItems.length;
    const grand = catSel.kind === "asset" ? totalAssets : totalLiab;
    const maxItem = Math.max(...items.map((i) => i.value), 1);
    selVals = {
      selLabel: meta.label, selColor: meta.color, selTint: tintFor(meta.color), selIconPath: meta.iconPath,
      selKindLabel: catSel.kind === "asset" ? "assets" : "liabilities",
      selCount: visItems.length, selTotalFull: inr(total),
      selPctLabel: (grand ? Math.round((total / grand) * 100) : 0) + "%",
      selHasHidden: hiddenN > 0, selHiddenNote: hiddenN > 0 ? hiddenN + " item" + (hiddenN > 1 ? "s" : "") + " excluded from totals" : "",
      selEmpty: items.length === 0,
      selItems: items.map((it) => {
        const om = memberMeta(it.owner || "self");
        const excl = isExcluded(it);
        const dimmed = it.hidden || excl;
        return {
          id: it.id, kind: catSel.kind,
          name: it.name, valFull: inr(it.value), barW: Math.max(6, (it.value / maxItem) * 100) + "%",
          hasNote: !!it.note, note: it.note || "",
          hasRef: !!it.ref, ref: it.ref || "",
          hasWeight: !!it.grams,
          weightLabel: it.grams ? it.grams + " g " + (it.metal === "silver" ? "silver" : "gold") + " · ₹" + rates[it.metal || "gold"].toLocaleString("en-IN") + "/g" : "",
          hidden: !!it.hidden, visible: !it.hidden, contentOp: dimmed ? "0.4" : "1",
          ownerInitial: om.name.slice(0, 1).toUpperCase(), ownerName: om.name,
          ownerStyle: `width:22px;height:22px;border-radius:999px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:600;color:#0B0B0B;background:${om.color};`,
          excludedTag: excl, excludedLabel: om.name + " excluded",
          barColor: dimmed ? "var(--nw-icongrey)" : meta.color,
          toggleColor: it.hidden ? "var(--nw-gold)" : "var(--nw-text2)",
          toggleTitle: it.hidden ? "Show in totals" : "Hide from totals",
        };
      }),
    };
  }

  // add/edit modal
  const m = state.modal;
  let modalVals: Record<string, unknown> = { modalOpen: false, isEdit: false };
  if (m) {
    const isAsset = m.kind === "asset";
    const cats = isAsset ? A : L;
    const isGold = isAsset && m.cat === "gold";
    const byWeight = isGold && m.entryMode === "weight";
    const grams = parseFloat(m.grams || "0") || 0;
    const metalRate = rates[m.metal || "gold"] || 0;
    const weightVal = Math.round(grams * metalRate);
    const val = byWeight ? weightVal : parseInt(m.valueStr || "0", 10) || 0;
    const chipBase = "display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 13px;border-radius:999px;font-size:12.5px;font-weight:500;cursor:pointer;";
    const quick: [string, number][] = isAsset
      ? [["10K", 10000], ["1L", 100000], ["5L", 500000], ["10L", 1000000]]
      : [["10K", 10000], ["50K", 50000], ["1L", 100000], ["5L", 500000]];
    modalVals = {
      modalOpen: true, isEdit: !!m.id,
      modalTitle: m.id ? "Edit " + (isAsset ? "asset" : "liability") : isAsset ? "Add asset" : "Add liability",
      modalSubtitle: isAsset ? "Something you own that has value." : "Money you owe to someone else.",
      modalPreviewLabel: isAsset ? "Asset value" : "Amount owed",
      modalPreviewColor: isAsset ? "var(--nw-green)" : "var(--nw-red)",
      modalPreviewBg: isAsset ? "rgba(25,170,77,0.12)" : "rgba(216,100,93,0.12)",
      draftPreview: val > 0 ? inr(val) : "₹0",
      draftName: m.name, draftValueStr: m.valueStr ? parseInt(m.valueStr, 10).toLocaleString("en-IN") : "",
      namePlaceholder: isAsset ? "e.g. Zerodha equity" : "e.g. HDFC home loan",
      catOptions: cats.map((c) => ({
        key: c.key, label: c.label, color: c.color,
        chipStyle: chipBase + (c.key === m.cat
          ? `background:${tintFor(c.color)};border:1px solid ${c.color};color:var(--nw-text);`
          : "background:transparent;border:1px solid var(--nw-chipbd);color:var(--nw-text2);"),
      })),
      quickAmounts: quick.map((q) => ({ label: q[0], amt: q[1] })),
      ownerOptions: members.map((mb) => ({
        id: mb.id, label: mb.name, relation: mb.relation, color: mb.color,
        initial: mb.name.slice(0, 1).toUpperCase(),
        chipStyle: "display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 14px 0 8px;border-radius:999px;font-size:13px;font-weight:500;cursor:pointer;" + (mb.id === m.owner
          ? `background:${tintFor(mb.color)};border:1px solid ${mb.color};color:var(--nw-text);`
          : "background:transparent;border:1px solid var(--nw-chipbd);color:var(--nw-text2);"),
        avatarStyle: `width:26px;height:26px;border-radius:999px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#0B0B0B;background:${mb.color};`,
      })),
      saveLabel: m.id ? "Save changes" : isAsset ? "Add asset" : "Add liability",
      saveBtnStyle: `flex:1;height:52px;border:none;border-radius:999px;font-size:15px;font-weight:600;cursor:pointer;${val > 0 ? "background:var(--nw-cta-bg);color:var(--nw-cta-tx);" : "background:#3a3a3a55;color:#8A8A8A;cursor:not-allowed;"}`,
      canSave: val > 0,
      draftNote: m.note || "", draftRef: m.ref || "",
      isGold, byWeight, notByWeight: !byWeight,
      modeValueStyle: "flex:1;height:38px;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;" + (!byWeight ? "background:var(--nw-cta-bg);color:var(--nw-cta-tx);" : "background:transparent;color:var(--nw-text2);"),
      modeWeightStyle: "flex:1;height:38px;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;" + (byWeight ? "background:var(--nw-cta-bg);color:var(--nw-cta-tx);" : "background:transparent;color:var(--nw-text2);"),
      metalOptions: METALS.map((mt) => ({
        key: mt.key, label: mt.label,
        chipStyle: "flex:1;height:38px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;" + (mt.key === (m.metal || "gold") ? "background:var(--nw-inputbg);border:1px solid var(--nw-gold);color:var(--nw-text);" : "background:transparent;border:1px solid var(--nw-chipbd);color:var(--nw-text2);"),
      })),
      draftGrams: m.grams || "", metalRateStr: String(metalRate),
      weightPreview: grams > 0 ? grams + " g × ₹" + metalRate.toLocaleString("en-IN") + " = " + inr(weightVal) : "Enter weight to price it live",
      metalUnitLabel: (m.metal === "silver" ? "Silver" : "Gold 24K") + " rate ₹/g",
    };
  }

  // member management modal
  const mm = state.memberModal;
  let memberModalVals: Record<string, unknown> = { memberModalOpen: false, mmList: false, mmForm: false };
  if (mm) {
    const chipBase = "display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 13px;border-radius:999px;font-size:12.5px;font-weight:500;cursor:pointer;";
    memberModalVals = {
      memberModalOpen: true,
      mmList: mm.mode === "list",
      mmForm: mm.mode === "add" || mm.mode === "edit",
      mmTitle: mm.mode === "list" ? "Manage household" : mm.mode === "add" ? "Add family member" : "Edit member",
      mmSubtitle: mm.mode === "list" ? "Add, edit, or remove people whose money you track together." : "Give them a name and a colour.",
      mmMembers: members.map((x) => {
        const cnt = assets.concat(liab).filter((i) => (i.owner || "self") === x.id).length;
        return {
          id: x.id, name: x.name, relation: x.relation, color: x.color, initial: x.name.slice(0, 1).toUpperCase(),
          isSelf: x.id === "self", notSelf: x.id !== "self",
          countLabel: cnt + (cnt === 1 ? " entry" : " entries"),
          avatarStyle: `width:38px;height:38px;border-radius:999px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600;color:#0B0B0B;background:${x.color};`,
        };
      }),
      mmDraftName: mm.name || "",
      mmIsSelf: mm.id === "self", mmNotSelf: mm.id !== "self",
      mmRelations: RELATIONS.map((r) => ({
        label: r,
        chipStyle: chipBase + (r === mm.relation ? "background:var(--nw-inputbg);border:1px solid var(--nw-gold);color:var(--nw-text);" : "background:transparent;border:1px solid var(--nw-chipbd);color:var(--nw-text2);"),
      })),
      mmColors: MEMBER_COLORS.map((c) => ({
        color: c,
        swatchStyle: `width:34px;height:34px;border-radius:999px;cursor:pointer;background:${c};border:2px solid ${c === mm.color ? "var(--nw-text)" : "transparent"};box-shadow:${c === mm.color ? "0 0 0 2px var(--nw-bg) inset" : "none"};`,
      })),
      mmPreviewAvatar: `width:44px;height:44px;border-radius:999px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;color:#0B0B0B;background:${mm.color};`,
      mmPreviewInitial: (mm.name || "?").slice(0, 1).toUpperCase(),
      mmSaveStyle: `flex:1;height:50px;border:none;border-radius:999px;font-size:15px;font-weight:600;cursor:pointer;${(mm.name || "").trim() ? "background:var(--nw-cta-bg);color:var(--nw-cta-tx);" : "background:#3a3a3a55;color:#8A8A8A;cursor:not-allowed;"}`,
      mmSaveLabel: mm.mode === "add" ? "Add member" : "Save",
    };
  }

  const tabActive = "height:34px;padding:0 18px;border:none;border-radius:999px;background:var(--nw-cta-bg);color:var(--nw-cta-tx);font-size:13px;font-weight:600;cursor:pointer;";
  const tabIdle = "height:34px;padding:0 18px;border:none;border-radius:999px;background:transparent;color:var(--nw-text2);font-size:13px;font-weight:500;cursor:pointer;";
  const segBase = "width:36px;height:30px;border:none;border-radius:999px;display:flex;align-items:center;justify-content:center;cursor:pointer;";
  const darkBtnStyle = segBase + (dark ? "background:var(--nw-inputbg);color:var(--nw-gold);" : "background:transparent;color:var(--nw-text3);");
  const lightBtnStyle = segBase + (!dark ? "background:var(--nw-inputbg);color:var(--nw-gold);" : "background:transparent;color:var(--nw-text3);");

  return {
    dark,
    darkBtnStyle, lightBtnStyle,
    loaded, isEmpty, showApp,
    viewDashboard: view === "dashboard", viewCategory: view === "category", viewHistory: view === "history",
    tabDashStyle: view === "history" ? tabIdle : tabActive,
    tabHistStyle: view === "history" ? tabActive : tabIdle,
    nwFull: inr(nw), nwCompact: compact(nw), totalNwC: compact(nw), nwColor, heroNwColor,
    assetsFull: inr(totalAssets), liabFull: inr(totalLiab),
    totalAssetsC: compact(totalAssets), totalLiabC: compact(totalLiab),
    assetCount: visA.length, liabCount: visL.length,
    memberCards, householdLabel, includedCount,
    liqPctLabel: liqPct + "%", emergencyLabel, liqBreakdown,
    showOnboard, onboardCards, obProgressLabel, obPct,
    hasLiab: liab.length > 0, noLiab: liab.length === 0,
    deltaLabel, deltaColor, deltaBg, deltaArrow,
    donutSegs, donutLegend,
    assetCatRows, liabCatRows,
    avlAssetH, avlLiabH, leverageLabel,
    linePath: g1.path, lineArea: g1.area, lineDots: g1.dots,
    linePathTall: g2.path, lineAreaTall: g2.area, lineDotsTall: g2.dots,
    lineLabels: hist.map((h) => h.label),
    trendGrowthLabel, histRows,
    selVals, modalVals, memberModalVals,
  };
}

export type Derived = ReturnType<typeof derive>;
