import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ToastHost } from "@/components/ToastHost";
import { STORAGE_KEY } from "@/lib/storage";
import { StoreProvider } from "@/store/StoreProvider";

import "./globals.css";

/** Applies the stored theme during parsing, so an explicit choice never flashes. */
const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)});if(!s)return;var t=JSON.parse(s).theme;if(t==="dark"||t==="high-contrast"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})()`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const displaySerif = Instrument_Serif({
  variable: "--font-display-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kotoba — a small blog about words",
  description:
    "A blog you can read, write, and edit. Posts are seeded from a public API; anything you add or change stays in your browser.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${displaySerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <StoreProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
            {children}
          </main>
          <SiteFooter />
          <ToastHost />
        </StoreProvider>
      </body>
    </html>
  );
}
