"use client";

import { Home, Image as ImageIcon, Video, PenLine, FolderOpen, Moon } from "lucide-react";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "video", label: "Video", icon: Video },
  { key: "edit", label: "Edit", icon: PenLine },
  { key: "assets", label: "Assets", icon: FolderOpen },
];

export default function Header({ active = "image", onNavigate, credits = 68 }) {
  return (
    <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur px-4 pt-4 pb-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 sm:gap-6">
        <span
          className="font-display text-2xl font-extrabold text-ink shrink-0"
          aria-label="Fomi"
        >
          F
        </span>

        <div
          className="flex-1 h-2 rounded-full bg-[var(--color-accent-track)] overflow-hidden max-w-3xl mx-auto"
          role="progressbar"
          aria-valuenow={credits}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Monthly generation credits used"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)]"
            style={{ width: `${credits}%` }}
          />
        </div>

        <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-ink-soft shrink-0">
          <button className="hover:text-ink transition-colors" type="button">
            Gallery
          </button>
          <button className="hover:text-ink transition-colors" type="button">
            Support
          </button>
        </div>

        <button
          type="button"
          aria-label="Toggle theme"
          className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-card transition-colors shrink-0"
        >
          <Moon size={18} />
        </button>

        <span className="h-9 w-9 rounded-full bg-accent-soft border border-border shrink-0 overflow-hidden">
          <img
            src="https://picsum.photos/seed/fomi-avatar/64/64"
            alt="Your account avatar"
            className="h-full w-full object-cover"
            width={36}
            height={36}
          />
        </span>
      </div>

      <nav
        aria-label="Primary"
        className="mt-4 flex items-center justify-between sm:justify-center sm:gap-14 max-w-3xl mx-auto"
      >
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate?.(key)}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              className={`flex items-center justify-center h-10 w-10 rounded-full transition-colors ${
                isActive ? "bg-ink text-cream" : "text-ink hover:bg-card"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} />
            </button>
          );
        })}
      </nav>
    </header>
  );
}
