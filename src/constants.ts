import type { CategoryDef, Item, Member, Metal } from "./types";

export const ASSET_CATS: CategoryDef[] = [
  { key: "bonds",      label: "Bonds & fixed income",  color: "#D5B475", iconPath: "M5 4h13v16l-3-2-3 2-3-2-1 1zM8 8h7M8 12h5" },
  { key: "stocks",     label: "Stocks & mutual funds", color: "#417CF1", iconPath: "M4 16l4-5 3 3 5-8 4 5M4 20h16" },
  { key: "cash",       label: "Cash & bank",           color: "#19AA4D", iconPath: "M3 8h18v10H3zM3 8l2-3h14l2 3M15 13h3" },
  { key: "epf",        label: "EPF / PPF / retirement", color: "#6FCAFF", iconPath: "M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z" },
  { key: "vehicles",   label: "Vehicles",              color: "#FC823A", iconPath: "M4 13l2-5h12l2 5M3 13h18v4H3zM7 17v2M17 17v2" },
  { key: "gold",       label: "Gold",                  color: "#FBC450", iconPath: "M4 14h6v5H4zM14 14h6v5h-6zM9 8h6v5H9z" },
  { key: "realestate", label: "Real estate",           color: "#A964F7", iconPath: "M4 11l8-6 8 6M6 10v9h12v-9M10 19v-5h4v5" },
  { key: "other_a",    label: "Other assets",          color: "#B1B1B1", iconPath: "M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" },
];

export const LIAB_CATS: CategoryDef[] = [
  { key: "home",       label: "Home loan",         color: "#D8645D", iconPath: "M4 11l8-6 8 6M6 10v9h12v-9M10 19v-5h4v5" },
  { key: "carloan",    label: "Car / vehicle loan", color: "#FE817B", iconPath: "M4 13l2-5h12l2 5M3 13h18v4H3zM7 17v2M17 17v2" },
  { key: "personal",   label: "Personal loan",     color: "#F877D2", iconPath: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 20c0-4 3-6 7-6s7 2 7 6" },
  { key: "creditcard", label: "Credit card debt",  color: "#E142BC", iconPath: "M3 6h18v12H3zM3 10h18M7 15h4" },
  { key: "education",  label: "Education loan",     color: "#FFB48C", iconPath: "M3 9l9-4 9 4-9 4zM7 11v5c0 2 10 2 10 0v-5" },
  { key: "other_l",    label: "Other liabilities", color: "#979797", iconPath: "M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" },
];

export const DEFAULT_MEMBERS: Member[] = [
  { id: "self",   name: "You",   relation: "Self",   color: "#D5B475" },
  { id: "spouse", name: "Priya", relation: "Spouse", color: "#6FCAFF" },
  { id: "parent", name: "Dad",   relation: "Father", color: "#A964F7" },
];

export const MEMBER_COLORS = ["#D5B475", "#6FCAFF", "#A964F7", "#FC823A", "#8BF1A7", "#F877D2", "#FBC450", "#5EE0C0"];
export const RELATIONS = ["Spouse", "Father", "Mother", "Son", "Daughter", "Sibling", "Partner", "HUF", "Other"];

/** which asset categories can be reached quickly in an emergency */
export const LIQUIDITY: Record<string, "liquid" | "locked"> = {
  cash: "liquid", stocks: "liquid", gold: "liquid", bonds: "liquid",
  epf: "locked", realestate: "locked", vehicles: "locked", other_a: "locked",
};

export const DEFAULT_RATES: Record<string, number> = { gold: 7250, silver: 92 }; // ₹ per gram (indicative)
export const METALS: { key: Metal; label: string; unit: string }[] = [
  { key: "gold", label: "Gold", unit: "24K /g" },
  { key: "silver", label: "Silver", unit: "/g" },
];

export const SEED_ASSETS: Item[] = [
  { id: "a1",  name: "Bond fund SIP",       cat: "bonds",      value: 250000,  owner: "self" },
  { id: "a2",  name: "Zerodha equity",      cat: "stocks",     value: 680000,  owner: "self" },
  { id: "a3",  name: "Parag Parikh Flexi",  cat: "stocks",     value: 320000,  owner: "self" },
  { id: "a4",  name: "HDFC savings",        cat: "cash",       value: 145000,  owner: "self" },
  { id: "a5",  name: "EPF balance",         cat: "epf",        value: 410000,  owner: "self" },
  { id: "a6",  name: "Honda City",          cat: "vehicles",   value: 550000,  owner: "self" },
  { id: "a7",  name: "Sovereign Gold Bond", cat: "gold",       value: 180000,  owner: "spouse" },
  { id: "a8",  name: "2BHK, Pune",          cat: "realestate", value: 8500000, owner: "self" },
  { id: "a9",  name: "SBI mutual funds",    cat: "stocks",     value: 540000,  owner: "spouse" },
  { id: "a10", name: "PPF account",         cat: "epf",        value: 820000,  owner: "spouse" },
  { id: "a11", name: "Ancestral land",      cat: "realestate", value: 6200000, owner: "parent" },
  { id: "a12", name: "Gold jewellery",      cat: "gold",       value: 950000,  owner: "parent" },
];

export const SEED_LIAB: Item[] = [
  { id: "l1", name: "HDFC home loan", cat: "home",       value: 5200000, owner: "self" },
  { id: "l2", name: "Car loan",       cat: "carloan",    value: 320000,  owner: "self" },
  { id: "l3", name: "HDFC Regalia",   cat: "creditcard", value: 45000,   owner: "self" },
  { id: "l4", name: "Personal loan",  cat: "personal",   value: 180000,  owner: "spouse" },
];

export const SEED_HISTORY: { label: string; value: number }[] = [
  { label: "Jan", value: 4100000 }, { label: "Feb", value: 4350000 },
  { label: "Mar", value: 4500000 }, { label: "Apr", value: 4720000 },
  { label: "May", value: 4950000 }, { label: "Jun", value: 5180000 },
  { label: "Jul", value: 5350000 },
];

export const DARK_VARS =
  "--nw-bg:#0B0B0B;--nw-card:#141414;--nw-cardbd:#242424;--nw-hair:#202020;--nw-text:#FFFFFF;--nw-text2:#B1B1B1;--nw-text3:#8A8A8A;--nw-muted:#6E6E6E;--nw-inputbg:#0E0E0E;--nw-inputbd:#2E2E2E;--nw-chipbd:#2A2A2A;--nw-btnbd:#2A2A2A;--nw-track:#202020;--nw-grid:#1E1E1E;--nw-cta-bg:#FFFFFF;--nw-cta-tx:#000000;--nw-topbar:rgba(11,11,11,0.86);--nw-topbd:#1C1C1C;--nw-gold:#D5B475;--nw-green:#8BF1A7;--nw-red:#FE817B;--nw-dash:#333333;--nw-icongrey:#5E5E5E;--nw-legend:#CFCFCF;--nw-cardsh:none;";

export const LIGHT_VARS =
  "--nw-bg:#F1F1EE;--nw-card:#FFFFFF;--nw-cardbd:#E8E8E4;--nw-hair:#EDEDEA;--nw-text:#101010;--nw-text2:#4B4B4B;--nw-text3:#7E7E7E;--nw-muted:#9A9A9A;--nw-inputbg:#F7F7F5;--nw-inputbd:#DCDCD8;--nw-chipbd:#DCDCD8;--nw-btnbd:#DCDCD8;--nw-track:#E8E8E4;--nw-grid:#EAEAE6;--nw-cta-bg:#101010;--nw-cta-tx:#FFFFFF;--nw-topbar:rgba(241,241,238,0.9);--nw-topbd:#E5E5E1;--nw-gold:#8A6A2E;--nw-green:#178A3E;--nw-red:#C0392B;--nw-dash:#CFCFCB;--nw-icongrey:#A0A0A0;--nw-legend:#3A3A3A;--nw-cardsh:0 1px 3px rgba(0,0,0,0.06);";

export const STORE_KEY = "networth_v3";
export const THEME_KEY = "networth_theme_v1";
export const MEMBER_KEY = "networth_members_v1";
export const MEMBERLIST_KEY = "networth_memberlist_v1";
export const RATE_KEY = "networth_rates_v1";
export const ONBOARD_KEY = "networth_onboard_v1";
export const HISTORY_KEY = "networth_history_v1";
