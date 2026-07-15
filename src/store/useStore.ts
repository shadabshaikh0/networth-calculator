import { create } from "zustand";
import type {
  AuthStatus, CatSel, Included, Item, Kind, Member, MemberModalDraft, Metal, ModalDraft,
  Rates, Snapshot, SnapshotData, SyncStatus, View,
} from "../types";
import {
  DEFAULT_MEMBERS, DEFAULT_RATES, MEMBER_COLORS, SEED_ASSETS, SEED_LIAB,
  ASSET_CATS, LIAB_CATS,
  STORE_KEY, THEME_KEY, MEMBER_KEY, MEMBERLIST_KEY, RATE_KEY, ONBOARD_KEY, HISTORY_KEY,
} from "../constants";
import { netWorthOf } from "../lib/networth";

interface State {
  assets: Item[];
  liab: Item[];
  view: View;
  catSel: CatSel | null;
  modal: ModalDraft | null;
  loaded: boolean;
  theme: "dark" | "light";
  included: Included;
  members: Member[];
  memberModal: MemberModalDraft | null;
  rates: Rates;
  onboardDismissed: boolean;
  liqView: boolean;
  history: Snapshot[];

  // cloud sync status
  authStatus: AuthStatus;
  syncStatus: SyncStatus;
  account: { email?: string; name?: string } | null;
  spreadsheetId: string | null;
  syncError: string | null;

  // lifecycle
  init: () => void;

  // cloud sync
  setSync: (patch: Partial<Pick<State, "authStatus" | "syncStatus" | "account" | "spreadsheetId" | "syncError">>) => void;
  hydrate: (data: SnapshotData) => void;
  snapshot: () => SnapshotData;

  // net-worth history
  recordSnapshot: (month: string) => void;

  // helpers
  memberList: () => Member[];
  memberMeta: (id: string) => Member;

  // theme
  setTheme: (t: "dark" | "light") => void;
  setDark: () => void;
  setLight: () => void;

  // navigation
  gotoDashboard: () => void;
  gotoHistory: () => void;
  openCategory: (kind: Kind, key: string) => void;

  // rates / onboarding / misc
  setRate: (metal: string, val: number) => void;
  dismissOnboard: () => void;
  toggleLiqView: () => void;

  // members
  toggleMember: (id: string) => void;
  openManageMembers: () => void;
  openAddMember: () => void;
  openEditMember: (id: string) => void;
  closeMemberModal: () => void;
  setMemberDraft: (patch: Partial<MemberModalDraft>) => void;
  saveMember: () => void;
  removeMember: (id: string) => void;

  // add/edit item modal
  openModal: (kind: Kind, cat?: string, item?: Item) => void;
  openAddAsset: () => void;
  openAddLiab: () => void;
  addToSelected: () => void;
  closeModal: () => void;
  setDraft: (patch: Partial<ModalDraft>) => void;
  setValue: (raw: string) => void;
  setGrams: (raw: string) => void;
  pickCat: (key: string) => void;
  pickOwner: (id: string) => void;
  pickMetal: (m: Metal) => void;
  setEntryMode: (mode: "value" | "weight") => void;
  addQuick: (amt: number) => void;
  setRateFromModal: (raw: string) => void;
  saveDraft: () => void;
  deleteItem: (kind: Kind, id: string) => void;
  deleteCurrent: () => void;
  editItem: (kind: Kind, item: Item) => void;

  // hidden / sample / reset
  toggleHidden: (kind: Kind, id: string) => void;
  loadSample: () => void;
  clearAll: () => void;

  // export
  exportCSV: () => void;
  exportPDF: () => void;
}

// ---- persistence helpers ----
const persist = (assets: Item[], liab: Item[]) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ assets, liab })); } catch { /* ignore */ }
};
const persistMembers = (included: Included) => {
  try { localStorage.setItem(MEMBER_KEY, JSON.stringify(included)); } catch { /* ignore */ }
};
const persistMemberList = (members: Member[]) => {
  try { localStorage.setItem(MEMBERLIST_KEY, JSON.stringify(members)); } catch { /* ignore */ }
};
const persistRates = (rates: Rates) => {
  try { localStorage.setItem(RATE_KEY, JSON.stringify(rates)); } catch { /* ignore */ }
};
const persistHistory = (history: Snapshot[]) => {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore */ }
};
const applyBodyBg = (theme: "dark" | "light") => {
  try { document.body.style.background = theme === "light" ? "#F1F1EE" : "#0B0B0B"; } catch { /* ignore */ }
};

const catMeta = (list: typeof ASSET_CATS, key: string) =>
  list.find((c) => c.key === key) || list[list.length - 1];

const uid = (prefix: string) => prefix + Date.now() + Math.floor(Math.random() * 999);

export const useStore = create<State>((set, get) => ({
  assets: [],
  liab: [],
  view: "dashboard",
  catSel: null,
  modal: null,
  loaded: false,
  theme: "dark",
  included: {},
  members: [],
  memberModal: null,
  rates: {},
  onboardDismissed: false,
  liqView: false,
  history: [],

  authStatus: "signedout",
  syncStatus: "idle",
  account: null,
  spreadsheetId: null,
  syncError: null,

  setSync: (patch) => set(patch),
  hydrate: (data) => {
    const members = data.members && data.members.length ? data.members.slice() : DEFAULT_MEMBERS.map((x) => ({ ...x }));
    if (!members.some((m) => m.id === "self")) members.unshift({ id: "self", name: "You", relation: "Self", color: "#D5B475" });
    const included: Included = { ...(data.included || {}) };
    members.forEach((m) => { if (included[m.id] === undefined) included[m.id] = true; });
    persist(data.assets, data.liab);
    persistMemberList(members);
    persistMembers(included);
    persistRates(data.rates || {});
    const history = Array.isArray(data.history) ? data.history.slice() : [];
    persistHistory(history);
    try { localStorage.setItem(ONBOARD_KEY, data.onboardDismissed ? "1" : "0"); } catch { /* ignore */ }
    set({
      assets: data.assets, liab: data.liab, members, included,
      rates: data.rates || {}, onboardDismissed: !!data.onboardDismissed, history, loaded: true,
    });
  },
  snapshot: () => {
    const s = get();
    return {
      assets: s.assets, liab: s.liab, members: s.members,
      included: s.included, rates: s.rates, onboardDismissed: s.onboardDismissed, history: s.history,
    };
  },
  recordSnapshot: (month) => set((s) => {
    // Don't record while there's nothing to track (keeps onboarding out of history).
    if (s.assets.length === 0 && s.liab.length === 0) return {};
    const value = netWorthOf(s.assets, s.liab, s.included, s.rates);
    const history = s.history.slice();
    const idx = history.findIndex((h) => h.month === month);
    if (idx >= 0) {
      if (history[idx].value === value) return {}; // no change
      history[idx] = { month, value };
    } else {
      history.push({ month, value });
    }
    history.sort((a, b) => a.month.localeCompare(b.month));
    persistHistory(history);
    return { history };
  }),

  init: () => {
    let assets: Item[] | null = null;
    let liab: Item[] | null = null;
    let theme: "dark" | "light" = "dark";
    let included: Included | null = null;
    let members: Member[] | null = null;
    let rates: Rates = {};
    let onboardDismissed = false;
    let history: Snapshot[] = [];
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) { const d = JSON.parse(raw); assets = d.assets; liab = d.liab; }
      const t = localStorage.getItem(THEME_KEY);
      if (t === "light" || t === "dark") theme = t;
      const mi = localStorage.getItem(MEMBER_KEY);
      if (mi) included = JSON.parse(mi);
      const ml = localStorage.getItem(MEMBERLIST_KEY);
      if (ml) { const arr = JSON.parse(ml); if (Array.isArray(arr) && arr.length) members = arr; }
      const rr = localStorage.getItem(RATE_KEY);
      if (rr) rates = JSON.parse(rr);
      const hh = localStorage.getItem(HISTORY_KEY);
      if (hh) { const arr = JSON.parse(hh); if (Array.isArray(arr)) history = arr; }
      if (localStorage.getItem(ONBOARD_KEY) === "1") onboardDismissed = true;
    } catch { /* ignore */ }

    if (!members) members = DEFAULT_MEMBERS.map((x) => ({ ...x }));
    if (!members.some((m) => m.id === "self")) {
      members.unshift({ id: "self", name: "You", relation: "Self", color: "#D5B475" });
    }
    if (assets == null || liab == null) {
      // default prototype behaviour: start with the sample portfolio
      assets = SEED_ASSETS.map((x) => ({ ...x }));
      liab = SEED_LIAB.map((x) => ({ ...x }));
    }
    if (!included) { included = {}; members.forEach((m) => { included![m.id] = true; }); }
    else { members.forEach((m) => { if (included![m.id] === undefined) included![m.id] = true; }); }

    applyBodyBg(theme);
    set({ assets, liab, theme, included, members, rates, onboardDismissed, history, loaded: true });
  },

  memberList: () => {
    const { members } = get();
    return members && members.length ? members : DEFAULT_MEMBERS;
  },
  memberMeta: (id) => {
    const ms = get().memberList();
    return ms.find((m) => m.id === id) || ms[0];
  },

  setTheme: (theme) => {
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
    applyBodyBg(theme);
    set({ theme });
  },
  setDark: () => get().setTheme("dark"),
  setLight: () => get().setTheme("light"),

  gotoDashboard: () => set({ view: "dashboard", catSel: null }),
  gotoHistory: () => set({ view: "history", catSel: null }),
  openCategory: (kind, key) => set({ view: "category", catSel: { kind, key } }),

  setRate: (metal, val) => set((s) => {
    const rates = { ...s.rates, [metal]: val };
    persistRates(rates);
    return { rates };
  }),
  dismissOnboard: () => {
    try { localStorage.setItem(ONBOARD_KEY, "1"); } catch { /* ignore */ }
    set({ onboardDismissed: true });
  },
  toggleLiqView: () => set((s) => ({ liqView: !s.liqView })),

  toggleMember: (id) => set((s) => {
    const included = { ...s.included, [id]: !s.included[id] };
    persistMembers(included);
    return { included };
  }),
  openManageMembers: () => set({ memberModal: { mode: "list" } }),
  openAddMember: () => {
    const used = new Set(get().memberList().map((m) => m.color));
    const nextColor = MEMBER_COLORS.find((c) => !used.has(c)) || MEMBER_COLORS[get().memberList().length % MEMBER_COLORS.length];
    set({ memberModal: { mode: "add", name: "", relation: "Spouse", color: nextColor } });
  },
  openEditMember: (id) => {
    const m = get().memberMeta(id);
    set({ memberModal: { mode: "edit", id, name: m.name, relation: m.relation, color: m.color } });
  },
  closeMemberModal: () => set({ memberModal: null }),
  setMemberDraft: (patch) => set((s) => ({ memberModal: s.memberModal ? { ...s.memberModal, ...patch } : s.memberModal })),
  saveMember: () => {
    const mm = get().memberModal;
    if (!mm) return;
    const name = (mm.name || "").trim();
    if (!name) return;
    set((s) => {
      let members = s.members.slice();
      const included = { ...s.included };
      if (mm.mode === "add") {
        const id = uid("m");
        members.push({ id, name, relation: mm.relation || "Other", color: mm.color || MEMBER_COLORS[0] });
        included[id] = true;
      } else if (mm.mode === "edit") {
        members = members.map((m) =>
          m.id === mm.id ? { ...m, name, relation: m.id === "self" ? "Self" : (mm.relation || m.relation), color: mm.color || m.color } : m,
        );
      }
      persistMemberList(members);
      persistMembers(included);
      return { members, included, memberModal: { mode: "list" } };
    });
  },
  removeMember: (id) => {
    if (id === "self") return;
    const m = get().memberMeta(id);
    const count = get().assets.concat(get().liab).filter((i) => (i.owner || "self") === id).length;
    const msg = count > 0 ? `Remove ${m.name}? Their ${count} ${count === 1 ? "entry" : "entries"} will move to You.` : `Remove ${m.name}?`;
    if (typeof confirm === "function" && !confirm(msg)) return;
    set((s) => {
      const members = s.members.filter((x) => x.id !== id);
      const assets = s.assets.map((a) => ((a.owner || "self") === id ? { ...a, owner: "self" } : a));
      const liab = s.liab.map((a) => ((a.owner || "self") === id ? { ...a, owner: "self" } : a));
      const included = { ...s.included };
      delete included[id];
      persistMemberList(members);
      persist(assets, liab);
      persistMembers(included);
      return { members, assets, liab, included };
    });
  },

  openModal: (kind, cat, item) => {
    const cats = kind === "asset" ? ASSET_CATS : LIAB_CATS;
    set((s) => ({
      modal: item
        ? { kind, id: item.id, name: item.name, cat: item.cat, valueStr: String(item.value), owner: item.owner || "self", note: item.note || "", ref: item.ref || "", grams: item.grams ? String(item.grams) : "", metal: item.metal || "gold", entryMode: item.grams ? "weight" : "value" }
        : { kind, id: null, name: "", cat: cat || cats[0].key, valueStr: "", owner: s.catSel?.owner || "self", note: "", ref: "", grams: "", metal: "gold", entryMode: "value" },
    }));
  },
  openAddAsset: () => get().openModal("asset"),
  openAddLiab: () => get().openModal("liability"),
  addToSelected: () => {
    const s = get().catSel;
    if (s) get().openModal(s.kind === "asset" ? "asset" : "liability", s.key);
  },
  closeModal: () => set({ modal: null }),
  setDraft: (patch) => set((s) => ({ modal: s.modal ? { ...s.modal, ...patch } : s.modal })),
  setValue: (raw) => get().setDraft({ valueStr: (raw || "").replace(/[^0-9]/g, "") }),
  setGrams: (raw) => get().setDraft({ grams: (raw || "").replace(/[^0-9.]/g, "") }),
  pickCat: (key) => get().setDraft({ cat: key }),
  pickOwner: (id) => get().setDraft({ owner: id }),
  pickMetal: (m) => get().setDraft({ metal: m }),
  setEntryMode: (mode) => get().setDraft({ entryMode: mode }),
  addQuick: (amt) => set((s) => {
    if (!s.modal) return {};
    const cur = parseInt(s.modal.valueStr || "0", 10) || 0;
    return { modal: { ...s.modal, valueStr: String(cur + amt) } };
  }),
  setRateFromModal: (raw) => {
    const m = get().modal;
    if (!m) return;
    const v = parseFloat((raw || "").replace(/[^0-9.]/g, "")) || 0;
    get().setRate(m.metal || "gold", v);
  },

  saveDraft: () => {
    const m = get().modal;
    if (!m) return;
    const rates = { ...DEFAULT_RATES, ...(get().rates || {}) };
    const byWeight = m.kind === "asset" && m.cat === "gold" && m.entryMode === "weight";
    const grams = byWeight ? parseFloat(m.grams || "0") || 0 : 0;
    const val = byWeight ? Math.round(grams * (rates[m.metal || "gold"] || 0)) : parseInt(m.valueStr || "0", 10) || 0;
    if (val <= 0) return;
    const name = (m.name || "").trim() ||
      (byWeight ? `${grams}g ${m.metal === "silver" ? "silver" : "gold"}` : catMeta(m.kind === "asset" ? ASSET_CATS : LIAB_CATS, m.cat).label);
    const listKey = m.kind === "asset" ? "assets" : "liab";
    const extra = { note: (m.note || "").trim(), ref: (m.ref || "").trim() };
    const metalFields = byWeight ? { grams, metal: m.metal || "gold" } : { grams: undefined, metal: undefined };
    set((s) => {
      let arr = s[listKey].slice();
      if (m.id) {
        arr = arr.map((x) => (x.id === m.id ? { ...x, name, cat: m.cat, value: val, owner: m.owner || "self", ...extra, ...metalFields } : x));
      } else {
        arr.push({ id: uid("x"), name, cat: m.cat, value: val, owner: m.owner || "self", ...extra, ...metalFields });
      }
      const next = { [listKey]: arr, modal: null } as Pick<State, "assets" | "liab" | "modal">;
      const assets = m.kind === "asset" ? arr : s.assets;
      const liab = m.kind === "asset" ? s.liab : arr;
      persist(assets, liab);
      return next;
    });
  },
  deleteItem: (kind, id) => set((s) => {
    const listKey = kind === "asset" ? "assets" : "liab";
    const arr = s[listKey].filter((x) => x.id !== id);
    const assets = kind === "asset" ? arr : s.assets;
    const liab = kind === "asset" ? s.liab : arr;
    persist(assets, liab);
    return { [listKey]: arr } as Pick<State, "assets" | "liab">;
  }),
  deleteCurrent: () => {
    const m = get().modal;
    if (m && m.id) { get().deleteItem(m.kind, m.id); set({ modal: null }); }
  },
  editItem: (kind, item) => get().openModal(kind, item.cat, item),

  toggleHidden: (kind, id) => set((s) => {
    const listKey = kind === "asset" ? "assets" : "liab";
    const arr = s[listKey].map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x));
    const assets = kind === "asset" ? arr : s.assets;
    const liab = kind === "asset" ? s.liab : arr;
    persist(assets, liab);
    return { [listKey]: arr } as Pick<State, "assets" | "liab">;
  }),
  loadSample: () => {
    const a = SEED_ASSETS.map((x) => ({ ...x }));
    const l = SEED_LIAB.map((x) => ({ ...x }));
    persist(a, l);
    set({ assets: a, liab: l, view: "dashboard", catSel: null });
  },
  clearAll: () => {
    if (typeof confirm === "function" && !confirm("Clear all assets and liabilities?")) return;
    persist([], []);
    set({ assets: [], liab: [], view: "dashboard", catSel: null });
  },

  exportCSV: () => {
    const st = get();
    const rates = { ...DEFAULT_RATES, ...(st.rates || {}) };
    const itemValue = (i: Item) => (i.grams && i.metal && rates[i.metal] ? Math.round(i.grams * rates[i.metal]) : i.value);
    const csvEscape = (v: unknown) => {
      const s = String(v == null ? "" : v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const rows: (string | number)[][] = [["Type", "Name", "Category", "Owner", "Value (INR)", "Weight (g)", "Metal", "In totals", "Note", "Reference"]];
    const push = (kind: string, arr: Item[], cats: typeof ASSET_CATS) =>
      arr.forEach((i) => {
        const cat = (cats.find((c) => c.key === i.cat) || { label: i.cat }).label;
        const owner = st.memberMeta(i.owner || "self").name;
        const inc = st.included[i.owner || "self"] !== false && !i.hidden;
        rows.push([kind, i.name, cat, owner, itemValue(i), i.grams || "", i.metal || "", inc ? "Yes" : "Excluded", i.note || "", i.ref || ""]);
      });
    push("Asset", st.assets, ASSET_CATS);
    push("Liability", st.liab, LIAB_CATS);
    const csv = rows.map((r) => r.map((c) => csvEscape(c)).join(",")).join("\r\n");
    try {
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "networth-" + new Date().toISOString().slice(0, 10) + ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { /* ignore */ }
  },
  exportPDF: () => {
    try { window.print(); } catch { /* ignore */ }
  },
}));
