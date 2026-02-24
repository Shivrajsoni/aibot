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
  title: "Erite Terminal | AI-Powered Terminal Interface",
  description: "A modern, terminal-styled AI chat interface powered by Gemini. Experience the future of AI interaction with a retro-futuristic design.",
  keywords: ["AI", "terminal", "chat", "Gemini", "opencode"],
  authors: [{ name: "Erite" }],
  openGraph: {
    title: "Erite Terminal",
    description: "AI-Powered Terminal Interface",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
