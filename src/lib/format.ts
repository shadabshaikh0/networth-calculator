export function inr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function compact(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e7) return (n < 0 ? "-" : "") + "₹" + (a / 1e7).toFixed(2).replace(/\.?0+$/, "") + " Cr";
  if (a >= 1e5) return (n < 0 ? "-" : "") + "₹" + (a / 1e5).toFixed(2).replace(/\.?0+$/, "") + " L";
  return (n < 0 ? "-" : "") + "₹" + Math.round(a).toLocaleString("en-IN");
}

/** rgba tint from a hex color, matching the prototype's tintFor(). */
export function tintFor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},0.14)`;
}
