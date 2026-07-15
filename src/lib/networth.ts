import { DEFAULT_RATES } from "../constants";
import type { Included, Item, Rates } from "../types";

/** An item's live value — precious metals priced by weight × current rate. */
export function resolveValue(i: Item, rates: Rates): number {
  return i.grams && i.metal && rates[i.metal] ? Math.round(i.grams * rates[i.metal]) : i.value;
}

/** Net worth = visible, included assets − visible, included liabilities. */
export function netWorthOf(assets: Item[], liab: Item[], included: Included, rawRates: Rates): number {
  const rates = { ...DEFAULT_RATES, ...(rawRates || {}) };
  const inc = (i: Item) => included[i.owner || "self"] !== false && !i.hidden;
  const totalA = assets.filter(inc).reduce((s, i) => s + resolveValue(i, rates), 0);
  const totalL = liab.filter(inc).reduce((s, i) => s + resolveValue(i, rates), 0);
  return totalA - totalL;
}

/** Short label for a YYYY-MM month key, e.g. "Jul" or "Jul '26" across years. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function monthLabel(month: string, withYear = false): string {
  const [y, m] = month.split("-");
  const name = MONTHS[(Number(m) || 1) - 1] || month;
  return withYear ? `${name} '${y.slice(2)}` : name;
}
