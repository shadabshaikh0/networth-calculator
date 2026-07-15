import { useStore } from "../store/useStore";

/** Current calendar month as YYYY-MM. */
function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Record a monthly net-worth snapshot on load and whenever the underlying
 * data changes. The current month is upserted with the latest value, so the
 * trend and the "this month" delta are always computed from real data.
 */
export function initHistory() {
  const month = currentMonth();
  useStore.getState().recordSnapshot(month);

  let prev = dataKey(useStore.getState());
  useStore.subscribe((s) => {
    const key = dataKey(s);
    if (key !== prev) {
      prev = key;
      useStore.getState().recordSnapshot(currentMonth());
    }
  });
}

function dataKey(s: ReturnType<typeof useStore.getState>): string {
  return JSON.stringify([s.assets, s.liab, s.included, s.rates]);
}
