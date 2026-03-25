import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const displayFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Pointers Picks",
  description: "Pointers Picks is a premium NBA analytics workspace built for clear market context, readable stats, and trustworthy game coverage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
