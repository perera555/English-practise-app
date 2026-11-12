import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Sinhala } from "next/font/google";
import { Nav } from "@/components/Nav";
import { CameraBubble } from "@/components/SelfCam";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
  weight: ["400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const COPYRIGHT_YEAR = "2026";
const OWNER = "Porage Thamara Dhanushka Perera";

export const metadata: Metadata = {
  title: "SpeakUp English · Practise English",
  authors: [{ name: OWNER }],
  creator: OWNER,
  publisher: OWNER,
  other: { copyright: `© ${COPYRIGHT_YEAR} ${OWNER}. All rights reserved.` },
  description: "30 chapters of English practice: travel, hotel, airport and sports commentary with karaoke subtitles, listening, speaking, robot chat, music and PTE practice.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "SpeakUp", statusBarStyle: "black-translucent" },
};

/** Full-screen, app-like viewport (handles the notch and home bar on phones). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${sinhala.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <CameraBubble />
        <main className="app-main mx-auto w-full max-w-6xl px-4 py-5 md:py-6 flex-1">{children}</main>
        <footer className="text-center text-xs opacity-70 px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6 flex flex-col gap-1">
          <p>
            SpeakUp English · Practise a little every day 🌱 ·{" "}
            <a href="/privacy" className="underline">
              Privacy
            </a>
          </p>
          <p className="font-semibold">© {COPYRIGHT_YEAR} Porage Thamara Dhanushka Perera. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
