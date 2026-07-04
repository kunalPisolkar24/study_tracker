import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const robotoSlab = Roboto_Slab({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Study Tracker",
  description: "Track your study progress across topics",
  icons: "/radar.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={robotoSlab.variable}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background antialiased">
        <ThemeProvider>
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
