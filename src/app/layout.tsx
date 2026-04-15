import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full flex flex-row bg-background text-foreground selection:bg-primary/30">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto relative gradient-bg">
          <div className="max-w-7xl mx-auto p-8 min-h-full flex flex-col">
            {children}
          </div>
        </main>
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  );
}
