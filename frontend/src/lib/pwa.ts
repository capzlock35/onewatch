/**
 * Make installed PWAs (and long-open tabs) pick up new deploys automatically.
 *
 * The service worker is built with skipWaiting + clientsClaim (vite-plugin-pwa
 * `registerType: "autoUpdate"`), so a new SW activates and claims clients as
 * soon as it's found. The auto-injected `registerSW.js` only *registers* the
 * worker though — it never reloads the page, so an already-open app keeps
 * running the old cached bundle until the user manually refreshes. This wires:
 *
 *  1. a one-time page reload when an UPDATED worker takes control, and
 *  2. periodic + on-focus update checks so the new worker is actually found
 *     (otherwise an app left open for hours never notices a deploy).
 *
 * The reload is guarded so it does NOT fire on the very first install (when the
 * page goes from "no controller" to "controlled") — only on real updates.
 */
export function setupPwaAutoReload(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  const hadControllerAtLoad = !!navigator.serviceWorker.controller;
  let refreshing = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    // First install: page started uncontrolled, clientsClaim fires this once —
    // don't reload. Only reload when a new worker replaces an existing one.
    if (!hadControllerAtLoad) return;
    refreshing = true;
    window.location.reload();
  });

  void navigator.serviceWorker.ready.then((registration) => {
    const check = () => {
      void registration.update().catch(() => void 0);
    };
    // Re-check when the user brings the PWA back to the foreground...
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
    window.addEventListener("focus", check);
    // ...and on a slow heartbeat for apps that stay open.
    window.setInterval(check, 30 * 60 * 1000);
  });
}
