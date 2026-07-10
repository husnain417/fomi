"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-cream/30 border-t border-border/40 py-16 px-4 md:py-20 w-full overflow-hidden">
      {/* Background Watermark Faint Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <span className="text-[18vw] font-display font-black text-border/15 dark:text-border/5 tracking-[0.2em] leading-none">
          FOMI
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto z-10 grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10">
        
        {/* Branding Column */}
        <div className="col-span-2 flex flex-col items-start gap-3">
          <h2 className="font-display text-4xl font-extrabold text-accent-dark tracking-wide">
            FOMI
          </h2>
          <p className="text-sm text-ink-soft font-medium leading-relaxed max-w-[200px]">
            Figment of My Imagination
          </p>
        </div>

        {/* Links Column: FOMI */}
        <div className="flex flex-col gap-4">
          <h3 className="font-display text-xs font-extrabold text-ink uppercase tracking-wider">
            FOMI
          </h3>
          <ul className="flex flex-col gap-2.5 list-none">
            {["About", "Login", "Pricing", "Contact", "Blogs"].map((link) => (
              <li key={link}>
                <Link href="#" className="text-sm text-ink-soft hover:text-accent-dark transition-colors duration-200">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column: Image */}
        <div className="flex flex-col gap-4">
          <h3 className="font-display text-xs font-extrabold text-ink uppercase tracking-wider">
            Image
          </h3>
          <ul className="flex flex-col gap-2.5 list-none">
            {["Text to Image", "Image to Image", "Consistent Characters", "Enhance Image", "Edit Image"].map((link) => (
              <li key={link}>
                <Link href="#" className="text-sm text-ink-soft hover:text-accent-dark transition-colors duration-200">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column: Video */}
        <div className="flex flex-col gap-4">
          <h3 className="font-display text-xs font-extrabold text-ink uppercase tracking-wider">
            Video
          </h3>
          <ul className="flex flex-col gap-2.5 list-none">
            {["Video Studio", "Text to Video", "Image to Video", "Upscale Video", "Motion Transfer"].map((link) => (
              <li key={link}>
                <Link href="#" className="text-sm text-ink-soft hover:text-accent-dark transition-colors duration-200">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column: Apps */}
        <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
          <h3 className="font-display text-xs font-extrabold text-ink uppercase tracking-wider">
            Apps
          </h3>
          <ul className="flex flex-col gap-2.5 list-none">
            {["Music Generation", "Lip Sync", "Insta Dump", "Product Placements", "Templates"].map((link) => (
              <li key={link}>
                <Link href="#" className="text-sm text-ink-soft hover:text-accent-dark transition-colors duration-200">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="relative z-10 border-t border-border/40 mt-12 pt-6 max-w-7xl mx-auto text-center">
        <p className="text-xs text-ink-soft/70">
          &copy; 2025 FOMI
        </p>
      </div>
    </footer>
  );
}
