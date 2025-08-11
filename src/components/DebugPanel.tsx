"use client";

import { useEffect, useState } from "react";

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isSafariBrowser =
      /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsSafari(isSafariBrowser);

    if (isIOSDevice && isSafariBrowser) {
      // Override console methods to capture logs
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      function addLog(message: string, type: "log" | "error" | "warn" = "log") {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        setLogs((prev) => [...prev.slice(-50), logEntry]); // Keep last 50 logs
      }

      console.log = (...args) => {
        originalLog.apply(console, args);
        addLog(args.join(" "), "log");
      };

      console.error = (...args) => {
        originalError.apply(console, args);
        addLog(args.join(" "), "error");
      };

      console.warn = (...args) => {
        originalWarn.apply(console, args);
        addLog(args.join(" "), "warn");
      };

      // Add initial log
      addLog("Debug panel initialized");
      addLog(`User Agent: ${userAgent}`);
      addLog(
        `Standalone: ${(navigator as Navigator & { standalone?: boolean }).standalone}`
      );
      addLog(`Service Worker: ${"serviceWorker" in navigator}`);
      addLog(`Push Manager: ${"PushManager" in window}`);
      addLog(`Notification: ${"Notification" in window}`);

      // Test for common errors
      try {
        // Test service worker
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker
            .getRegistration()
            .then((reg) => {
              addLog(
                `Service Worker Registration: ${reg ? "Found" : "Not found"}`
              );
            })
            .catch((err) => {
              addLog(`Service Worker Error: ${err.message}`, "error");
            });
        }

        // Test push notifications
        if ("PushManager" in window) {
          addLog("Push Manager available");
        } else {
          addLog("Push Manager not available", "warn");
        }

        // Test notifications
        if ("Notification" in window) {
          try {
            addLog(`Notification Permission: ${Notification.permission}`);
          } catch (error) {
            addLog(`Notification API error: ${error}`, "error");
          }
        } else {
          addLog("Notifications not available", "warn");
        }
      } catch (error) {
        addLog(`Error during initialization: ${error}`, "error");
      }
    }
  }, []);

  // Only show on iOS Safari
  if (!isIOS || !isSafari) {
    return null;
  }

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 left-4 z-50 bg-red-500 text-white px-3 py-2 rounded-md text-sm font-bold shadow-lg"
      >
        🐛 DEBUG
      </button>

      {/* Test Error Button */}
      <button
        onClick={() => {
          throw new Error("Test error to check error boundary");
        }}
        className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-3 py-2 rounded-md text-sm font-bold shadow-lg"
      >
        Test Error
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-90 text-white p-4 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">iOS Safari Debug Panel</h2>
              <button
                onClick={() => setIsVisible(false)}
                className="bg-gray-600 px-3 py-1 rounded"
              >
                Close
              </button>
            </div>

            <div className="bg-gray-800 p-4 rounded mb-4">
              <h3 className="font-bold mb-2">Device Info:</h3>
              <div className="text-sm space-y-1">
                <div>User Agent: {navigator.userAgent}</div>
                <div>
                  Standalone:{" "}
                  {(navigator as Navigator & { standalone?: boolean })
                    .standalone
                    ? "Yes"
                    : "No"}
                </div>
                <div>
                  Service Worker:{" "}
                  {"serviceWorker" in navigator ? "Available" : "Not Available"}
                </div>
                <div>
                  Push Manager:{" "}
                  {"PushManager" in window ? "Available" : "Not Available"}
                </div>
                <div>
                  Notification:{" "}
                  {"Notification" in window ? "Available" : "Not Available"}
                </div>
                <div>
                  Notification Permission:{" "}
                  {"Notification" in window
                    ? (() => {
                        try {
                          return Notification.permission;
                        } catch (error) {
                          console.error(
                            "Error accessing Notification API:",
                            error
                          );
                          return "Error accessing";
                        }
                      })()
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <h3 className="font-bold mb-2">Console Logs:</h3>
              <div className="text-xs font-mono max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 space-x-2">
              <button
                onClick={() => setLogs([])}
                className="bg-gray-600 px-3 py-1 rounded text-sm"
              >
                Clear Logs
              </button>
              <button
                onClick={() => {
                  console.error("Manual test error");
                }}
                className="bg-blue-600 px-3 py-1 rounded text-sm"
              >
                Test Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
