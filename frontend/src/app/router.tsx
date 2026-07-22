import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  // Scroll handling is driven by Lenis + a route-change effect in __root.tsx,
  // so the router's own restoration is disabled to avoid the two fighting.
  scrollRestoration: false,
});
