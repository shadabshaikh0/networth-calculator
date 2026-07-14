import type { CSSProperties } from "react";

const kebabToCamel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/**
 * Parse a CSS declaration string into a React style object.
 * Ported from the dc-runtime cssToObj so we can keep the original
 * inline-style strings verbatim (custom properties preserved as-is).
 */
export function css(input: string | undefined | null): CSSProperties {
  const out: Record<string, string> = {};
  if (!input) return out as CSSProperties;
  for (const decl of input.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    if (!prop) continue;
    const value = decl.slice(i + 1).trim();
    out[prop.startsWith("--") ? prop : kebabToCamel(prop)] = value;
  }
  return out as CSSProperties;
}
