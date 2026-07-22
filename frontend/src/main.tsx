import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { Agentation } from "agentation";
import { Analytics } from "@vercel/analytics/react";

import { router } from "@/app/router";
import { setupDevtoolsGuard } from "@/lib/devtools-guard";
import { setupPwaAutoReload } from "@/lib/pwa";

import "@/index.css";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Analytics />
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
);

// Auto-reload installed PWAs / open tabs when a new version is deployed.
setupPwaAutoReload();

// Block DevTools shortcuts and redirect if DevTools is opened (production only).
setupDevtoolsGuard();

