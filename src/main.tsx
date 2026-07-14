import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { useStore } from "./store/useStore";
import "./index.css";

// Dev-only: expose the store for debugging in the console. Never bundled in prod.
if (import.meta.env.DEV) (window as unknown as { __store: typeof useStore }).__store = useStore;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
