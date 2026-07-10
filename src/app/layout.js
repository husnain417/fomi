import "./globals.css";
import { Poppins } from "next/font/google";
import { themeInitScript } from "@/lib/theme";

// weight 400 only, per the requested "Family Poppins" setup. next/font
// generates the metric-matched "Poppins Fallback" automatically and folds
// it into this variable, so var(--font-poppins) alone gets you both.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Fomi — AI Image & Video Generation",
  description:
    "Create, edit, transform, enhance and upscale images and videos with Fomi's AI-powered creative studio.",
};

// Keeps the browser chrome (address bar on mobile, etc.) matching the
// active theme. Two values so it flips instantly with the class swap
// instead of lagging behind a single static color.
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#211d18" },
  ],
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: the inline script below sets the `dark`
    // class synchronously before React hydrates, based on localStorage /
    // system preference. That intentionally makes the server-rendered
    // markup (always class-less) differ from the first client paint —
    // this flag tells React that's expected, instead of it being a real
    // mismatch.
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}