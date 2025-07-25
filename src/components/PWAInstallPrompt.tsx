"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Download, Share, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWA_DISMISSED_KEY = "pwa-install-dismissed";
const PWA_DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dontRemindAgain, setDontRemindAgain] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed (running in standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Don't show prompt if already installed
    if (standalone) return;

    // Check if user has dismissed the prompt
    const dismissedData = localStorage.getItem(PWA_DISMISSED_KEY);
    if (dismissedData) {
      const { timestamp, permanent } = JSON.parse(dismissedData);
      const now = Date.now();

      // If permanently dismissed or within dismiss duration, don't show
      if (permanent || now - timestamp < PWA_DISMISS_DURATION) {
        return;
      }
    }

    // Handle beforeinstallprompt for Android Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS or browsers that don't support beforeinstallprompt
    // Show prompt after a delay if no native prompt appeared
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && (iOS || !showInstallPrompt)) {
        setShowInstallPrompt(true);
      }
    }, 3000); // Show after 3 seconds

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt, showInstallPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android Chrome with native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } else {
      // iOS or browsers without native prompt - just dismiss
      // User will need to manually add to home screen
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = (permanent = false) => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);

    // Store dismissal in localStorage
    const dismissData = {
      timestamp: Date.now(),
      permanent: permanent || dontRemindAgain,
    };
    localStorage.setItem(PWA_DISMISSED_KEY, JSON.stringify(dismissData));
  };

  const handleCloseClick = () => handleDismiss(false);
  const handleNotNowClick = () => handleDismiss(false);
  const handleGotItClick = () => handleDismiss(false);

  if (!showInstallPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Download className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Install Kick Back</h3>
              <p className="text-xs text-muted-foreground">
                {isIOS
                  ? "Tap the share button and select 'Add to Home Screen'"
                  : "Get quick access from your home screen"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={handleCloseClick}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isIOS ? (
          // iOS-specific instructions
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>1. Tap</span>
              <Share className="h-4 w-4" />
              <span>in your browser</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>2. Select</span>
              <Plus className="h-4 w-4" />
              <span>"Add to Home Screen"</span>
            </div>
            <Button
              size="sm"
              className="w-full mt-2"
              onClick={handleGotItClick}
            >
              Got it!
            </Button>
          </div>
        ) : (
          // Android/other browsers
          <div className="mt-3 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dont-remind"
                checked={dontRemindAgain}
                onCheckedChange={(checked) =>
                  setDontRemindAgain(checked === true)
                }
              />
              <label
                htmlFor="dont-remind"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Don&apos;t remind me again
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleNotNowClick}
              >
                Not now
              </Button>
              <Button size="sm" className="flex-1" onClick={handleInstallClick}>
                {deferredPrompt ? "Install" : "Show me how"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
