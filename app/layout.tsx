import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
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
  title: "SpeakUp English · Practise English",
  description: "30 chapters of English practice: travel, hotel, airport and sports commentary with karaoke subtitles, listening, speaking, robot chat, music and PTE practice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 flex-1">{children}</main>
        <footer className="text-center text-xs opacity-60 py-6">
          SpeakUp English · Practise a little every day 🌱 · Works best in Google Chrome or Microsoft Edge
        </footer>
      </body>
    </html>
  );
}
