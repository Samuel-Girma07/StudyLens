import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { BackgroundEffects } from "@/components/shared/background-effects";
import { Providers } from "@/components/shared/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyLens - AI-Powered Learning Resource Recommendations",
  description: "Discover personalized study resources with AI-powered recommendations. Find the perfect books, articles, and videos for your learning journey.",
  keywords: ["learning", "education", "study resources", "AI recommendations", "books", "courses", "tutorials"],
  authors: [{ name: "StudyLens Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "StudyLens - AI-Powered Learning",
    description: "Personalized learning resource recommendations powered by AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>
          <BackgroundEffects />
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
