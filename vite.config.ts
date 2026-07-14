import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Baseline Content-Security-Policy, injected only into the production build
 * (dev is skipped so Vite's HMR client, which needs inline/eval, keeps working).
 * Allows: the app's own assets, Google Identity Services + Google APIs (Sheets,
 * Drive, OAuth, userinfo), Google Fonts, and account avatars. Inline styles are
 * allowed because the UI uses React style objects (inline style attributes).
 *
 * NOTE: validate this against the live Google sign-in flow when you deploy —
 * if GIS needs another origin, add it here and rebuild.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://accounts.google.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://*.googleusercontent.com",
  "connect-src 'self' https://sheets.googleapis.com https://www.googleapis.com https://oauth2.googleapis.com https://accounts.google.com",
  "frame-src https://accounts.google.com",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

function cspPlugin(): Plugin {
  return {
    name: "inject-csp",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        "</head>",
        `  <meta http-equiv="Content-Security-Policy" content="${CSP}">\n  </head>`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), cspPlugin()],
  server: { port: 8743 },
});
