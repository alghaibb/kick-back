import { Toaster } from "@/components/ui/sonner";
import { ActiveThemeProvider } from "@/providers/ActiveThemeProvider";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeTheme = cookieStore.get("active_theme")?.value || "default";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <ActiveThemeProvider initialTheme={activeTheme}>
            <PageTracker />
            <main className="min-h-screen flex flex-col">{children}</main>
            <Toaster richColors closeButton theme="light" />
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
