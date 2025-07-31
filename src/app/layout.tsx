import { Toaster } from "@/components/ui/sonner";
import { ActiveThemeProvider } from "@/providers/ActiveThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { PageErrorBoundary } from "@/components/ui/error-boundary";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Poppins } from "next/font/google";
import { PageTracker } from "react-page-tracker";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Kick Back",
    absolute: "Kick Back",
  },
  description:
    "Kick Back is a platform where you can organise and join events with friends and family.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kick Back",
    startupImage: [
      {
        url: "/apple-touch-icon.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-touch-icon.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-touch-icon.png",
        media:
          "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-touch-icon.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-touch-icon.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-touch-icon.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Kick Back",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
  openGraph: {
    type: "website",
    siteName: "Kick Back",
    title: {
      default: "Kick Back",
      template: "%s | Kick Back",
    },
    description: "Organize and manage your events with friends and family.",
  },
  twitter: {
    card: "summary",
    title: {
      default: "Kick Back",
      template: "%s | Kick Back",
    },
    description: "Organize and manage your events with friends and family.",
  },
};

export function generateViewport() {
  return {
    themeColor: "#000000",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS Safari specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kick Back" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="format-detection"
          content="telephone=no,email=no,address=no"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* PWA icons for iOS */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/apple-touch-icon.png"
        />

        {/* Prevent iOS Safari from showing error boundary */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // iOS Safari error handling
              if (typeof window !== 'undefined') {
                // Detect iOS Safari
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
                
                // Create debug panel for mobile
                if (isIOS && isSafari) {
                  // Create debug panel
                  const debugPanel = document.createElement('div');
                  debugPanel.id = 'debug-panel';
                  debugPanel.style.cssText = \`
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.9);
                    color: white;
                    font-family: monospace;
                    font-size: 12px;
                    padding: 10px;
                    z-index: 9999;
                    max-height: 200px;
                    overflow-y: auto;
                    display: none;
                  \`;
                  document.body.appendChild(debugPanel);
                  
                  // Add debug toggle button
                  const debugButton = document.createElement('button');
                  debugButton.textContent = '🐛';
                  debugButton.style.cssText = \`
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #007AFF;
                    color: white;
                    border: none;
                    font-size: 20px;
                    z-index: 10000;
                    cursor: pointer;
                  \`;
                  debugButton.onclick = () => {
                    debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
                  };
                  document.body.appendChild(debugButton);
                  
                  // Add test error button
                  const testErrorButton = document.createElement('button');
                  testErrorButton.textContent = 'Test Error';
                  testErrorButton.style.cssText = \`
                    position: fixed;
                    top: 60px;
                    right: 10px;
                    padding: 5px 10px;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 12px;
                    z-index: 10000;
                    cursor: pointer;
                  \`;
                  testErrorButton.onclick = () => {
                    console.log('Testing error boundary...');
                    // This should trigger the error boundary
                    throw new Error('Test error to check error boundary');
                  };
                  document.body.appendChild(testErrorButton);
                  
                  // Override console.log to show in debug panel
                  const originalLog = console.log;
                  const originalError = console.error;
                  
                  function addToDebugPanel(message, type = 'log') {
                    const debugPanel = document.getElementById('debug-panel');
                    if (debugPanel) {
                      const timestamp = new Date().toLocaleTimeString();
                      const logEntry = document.createElement('div');
                      logEntry.style.color = type === 'error' ? '#ff6b6b' : '#4ecdc4';
                      logEntry.textContent = \`[\${timestamp}] \${message}\`;
                      debugPanel.appendChild(logEntry);
                      debugPanel.scrollTop = debugPanel.scrollHeight;
                    }
                  }
                  
                  console.log = function(...args) {
                    originalLog.apply(console, args);
                    addToDebugPanel(args.join(' '), 'log');
                  };
                  
                  console.error = function(...args) {
                    originalError.apply(console, args);
                    addToDebugPanel(args.join(' '), 'error');
                  };
                  
                  // Add initial debug info
                  addToDebugPanel('iOS Safari PWA Debug Mode Enabled');
                  addToDebugPanel('User Agent: ' + navigator.userAgent);
                  addToDebugPanel('Standalone: ' + navigator.standalone);
                }
                
                // Global error handler
                window.addEventListener('error', function(e) {
                  console.error('Global error caught:', e.error);
                  
                  // Prevent error boundary from showing for known iOS Safari issues
                  if (e.error && e.error.message && (
                    e.error.message.includes('Prisma') ||
                    e.error.message.includes('service worker') ||
                    e.error.message.includes('push notification') ||
                    e.error.message.includes('subscription') ||
                    e.error.message.includes('permission') ||
                    e.error.message.includes('navigator') ||
                    e.error.message.includes('standalone') ||
                    e.error.message.includes('Notification') ||
                    e.error.message.includes('PushManager') ||
                    e.error.message.includes('ServiceWorker') ||
                    e.error.message.includes('registration') ||
                    e.error.message.includes('subscription') ||
                    e.error.message.includes('VAPID') ||
                    e.error.message.includes('applicationServerKey')
                  )) {
                    e.preventDefault();
                    console.log('Suppressed iOS Safari error:', e.error.message);
                    return false;
                  }
                });
                
                // Handle unhandled promise rejections
                window.addEventListener('unhandledrejection', function(e) {
                  console.error('Unhandled promise rejection:', e.reason);
                  
                  // Prevent error boundary for promise rejections
                  if (e.reason && e.reason.message && (
                    e.reason.message.includes('Prisma') ||
                    e.reason.message.includes('service worker') ||
                    e.reason.message.includes('push notification') ||
                    e.reason.message.includes('subscription') ||
                    e.reason.message.includes('permission') ||
                    e.reason.message.includes('navigator') ||
                    e.reason.message.includes('standalone') ||
                    e.reason.message.includes('Notification') ||
                    e.reason.message.includes('PushManager') ||
                    e.reason.message.includes('ServiceWorker') ||
                    e.reason.message.includes('registration') ||
                    e.reason.message.includes('subscription') ||
                    e.reason.message.includes('VAPID') ||
                    e.reason.message.includes('applicationServerKey')
                  )) {
                    e.preventDefault();
                    console.log('Suppressed iOS Safari promise rejection:', e.reason.message);
                    return false;
                  }
                });
                
                // iOS Safari specific error handling
                if (isIOS && isSafari) {
                  console.log('iOS Safari detected - applying enhanced error handling');
                  
                  // Override console.error to catch more errors
                  const originalConsoleError = console.error;
                  console.error = function(...args) {
                    const errorMessage = args.join(' ');
                    
                    // Don't show error boundary for known iOS Safari issues
                    if (errorMessage.includes('Prisma') ||
                        errorMessage.includes('service worker') ||
                        errorMessage.includes('push notification') ||
                        errorMessage.includes('subscription') ||
                        errorMessage.includes('permission') ||
                        errorMessage.includes('navigator') ||
                        errorMessage.includes('standalone') ||
                        errorMessage.includes('Notification') ||
                        errorMessage.includes('PushManager') ||
                        errorMessage.includes('ServiceWorker') ||
                        errorMessage.includes('registration') ||
                        errorMessage.includes('subscription') ||
                        errorMessage.includes('VAPID') ||
                        errorMessage.includes('applicationServerKey')) {
                      console.log('Suppressed iOS Safari console error:', errorMessage);
                      return;
                    }
                    
                    originalConsoleError.apply(console, args);
                  };
                }
                
                // iOS Safari PWA detection
                if (navigator.standalone) {
                  document.documentElement.classList.add('pwa-mode');
                  console.log('iOS Safari PWA mode detected');
                }
              }
            `,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} antialiased bg-background`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <QueryProvider>
            <ActiveThemeProvider>
              <PageTracker />
              <PageErrorBoundary>
                <div className="min-h-screen flex flex-col">{children}</div>
              </PageErrorBoundary>
              <Toaster richColors closeButton theme="light" />
              <PWAInstallPrompt />
            </ActiveThemeProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
