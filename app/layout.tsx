import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NexusAI — AI-Powered Team Workspace",
    template: "%s | NexusAI",
  },
  description:
    "The AI-first workspace for modern teams. Collaborate in real-time, manage projects with Kanban boards, chat with your team, and leverage Claude AI to ship faster.",
  keywords: [
    "SaaS", "AI workspace", "project management", "team collaboration",
    "Kanban", "Claude AI", "productivity", "real-time chat",
  ],
  authors: [{ name: "NexusAI Team" }],
  openGraph: {
    title: "NexusAI — AI-Powered Team Workspace",
    description: "The AI-first workspace for modern teams.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexusAI",
    description: "The AI-first workspace for modern teams.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f23" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
