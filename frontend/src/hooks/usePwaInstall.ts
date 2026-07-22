import { useEffect, useState } from "react";

// The beforeinstallprompt event is not in the standard lib DOM types yet.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  // iPadOS 13+ defaults to "Request Desktop Website" and reports as a Mac.
  // maxTouchPoints is the reliable way to tell a touch iPad from a real Mac.
  return /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
}

/**
 * Tracks PWA installability. Returns whether an install prompt is available
 * (Android/Chrome/Edge), whether the app is already installed, and a function
 * that triggers the native install prompt.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return {
    /** True when the browser fired beforeinstallprompt and the app isn't installed. */
    canInstall: !installed && deferredPrompt !== null,
    /**
     * True on iOS, where there is no programmatic install prompt — the user must
     * manually use Share → "Add to Home Screen". Show instructions instead.
     */
    iosInstall: !installed && deferredPrompt === null && isIOS(),
    installed,
    promptInstall,
  };
}
