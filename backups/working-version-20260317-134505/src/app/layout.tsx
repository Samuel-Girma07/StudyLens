import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/shared/providers";

// Inter - Primary display font (used for most UI)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Fraunces - Serif font for headlines (italic, dramatic)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

// JetBrains Mono - Monospace for labels and code
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
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
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* Material Symbols Outlined font */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background-dark text-slate-100 selection:bg-accent-cyan selection:text-black min-h-screen`}
      >
        <Providers>
          {/* Background decorations */}
          <div className="fixed top-0 right-0 -z-10 w-[50vw] h-[50vh] bg-accent-cyan/[0.02] blur-[120px] rounded-full pointer-events-none" />
          <div className="fixed bottom-0 left-0 -z-10 w-[40vw] h-[40vh] bg-accent-lime/[0.02] blur-[120px] rounded-full pointer-events-none" />
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
