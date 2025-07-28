import { Toaster } from "@/components/ui/sonner";
import { ActiveThemeProvider } from "@/providers/ActiveThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
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
  },
  formatDetection: {
    telephone: false,
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
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <QueryProvider>
            <ActiveThemeProvider>
              <PageTracker />
              <div className="min-h-screen flex flex-col">{children}</div>
              <Toaster richColors closeButton theme="light" />
              <PWAInstallPrompt />
            </ActiveThemeProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
