import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// CSP + security headers are served as real HTTP response headers by the host
// (see public/_headers for Cloudflare Pages) rather than a <meta> tag.
export default defineConfig({
  plugins: [react()],
  server: { port: 8743 },
});
