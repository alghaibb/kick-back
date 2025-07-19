import { Toaster } from "@/components/ui/sonner";
import { ActiveThemeProvider } from "@/providers/ActiveThemeProvider";
import { SessionProvider } from "@/providers/SessionProvider";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <ActiveThemeProvider>
            <SessionProvider>
              <PageTracker />
              <main className="min-h-screen flex flex-col">{children}</main>
              <Toaster richColors closeButton theme="light" />
            </SessionProvider>
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
