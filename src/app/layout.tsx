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

export const metadata: Metadata = {
  title: "AuraCaption AI | Next-Gen AI Caption Generator",
  description: "Transform your photos into engaging social media content with Google Gemini and GPT-4o Vision. Factual, Creative, and Accessibility captions in seconds.",
  keywords: ["AI", "Caption Generator", "Social Media", "Instagram", "Accessibility", "Vision AI"],
};

import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-row bg-background text-foreground selection:bg-primary/10">
        <Sidebar divider />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-8 pt-6">
            <div className="max-w-6xl mx-auto min-h-full">
              {children}
            </div>
          </main>
        </div>
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  );
}
