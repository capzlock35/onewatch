/**
 * Best-effort DevTools deterrent.
 *
 * IMPORTANT: this is NOT security. Browser DevTools cannot truly be disabled —
 * any client-side block is trivially bypassable (disable JS, view-source,
 * network tab, etc.). This only blocks the common shortcuts. Anything that
 * actually needs protecting must be enforced on the backend.
 *
 * Only runs in production builds so it never interferes with local development.
 */

function blockShortcuts(): void {
  window.addEventListener(
    "keydown",
    (e) => {
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + Shift + I / J / C  (Inspector, Console, Element picker)
      if (ctrlOrMeta && e.shiftKey && (key === "i" || key === "j" || key === "c")) {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + U  (View source)
      if (ctrlOrMeta && key === "u") {
        e.preventDefault();
      }
    },
    { capture: true },
  );

  // Disable right-click context menu.
  window.addEventListener("contextmenu", (e) => e.preventDefault());
}

export function setupDevtoolsGuard(): void {
  if (!import.meta.env.PROD) return;

  blockShortcuts();
}
