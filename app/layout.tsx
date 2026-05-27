import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { XpToastHost } from "@/components/XpToast";
import { ClientBoot } from "@/components/ClientBoot";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const pixel = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-pixel", display: "swap" });

export const metadata: Metadata = {
  title: "BM Console — Business Management",
  description: "Studieplatform Business Management 1",
};

// Force dark — no toggle; this design is dark-only by intent
const themeInit = `document.documentElement.classList.add('dark');`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${body.variable} ${mono.variable} ${pixel.variable} dark`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen bg-canvas text-ink">
        <ClientBoot />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="flex-1 px-8 py-8 max-w-[1280px] w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
        <XpToastHost />
      </body>
    </html>
  );
}
