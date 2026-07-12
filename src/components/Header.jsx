"use client";

import { useEffect, useRef, useState } from "react";
import {
  Home,
  Image as ImageIcon,
  Video,
  PenLine,
  FolderOpen,
  Moon,
  Sun,
  Mail,
  Pencil,
  Users,
  UserCircle,
  Wand2,
  Tv,
  Megaphone,
  ArrowUpCircle,
  Camera,
  Briefcase,
  Zap,
  LayoutGrid,
  Folder,
  Mic,
  Music2,
  Sparkles,
  Layers,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "video", label: "Video", icon: Video },
  { key: "edit", label: "Edit", icon: PenLine },
  { key: "assets", label: "Assets", icon: FolderOpen },
];

// Mega-menu content per nav item. `img` is now just a fallback used before
// the real generated image arrives (or if the request fails). "home" is
// handled separately below (HOME_MENU) — it's a plain icon/label list, not
// the image-card layout the other nav items use.
const MENUS = {
  image: [
    { title: "Text to Image" },
    { title: "Image Generation" },
    { title: "Consistent Characters" },
    { title: "Enhance" },
  ],
  video: [
    { title: "Text to Video" },
    { title: "Image to Video" },
    { title: "Motion Brush" },
  ],
  edit: [
    { title: "Inpaint" },
    { title: "Outpaint" },
    { title: "Remove Background" },
    { title: "Product Placement" },
  ],
  assets: [
    { title: "My Uploads" },
    { title: "Generations" },
    { title: "Favorites" },
  ],
};

// Tailwind's scanner needs full literal class strings — a template literal
// like `bg-chip-${chip}` wouldn't get picked up and generated.
const CHIP_CLASSES = {
  slate: "bg-chip-slate text-chip-slate-fg",
  peach: "bg-chip-peach text-chip-peach-fg",
  rose: "bg-chip-rose text-chip-rose-fg",
  gold: "bg-chip-gold text-chip-gold-fg",
};

// Home's hover panel: four labeled columns of icon + text rows, styled as
// pastel chip icons rather than photo cards.
const HOME_MENU = [
  {
    heading: "Image",
    items: [
      { label: "Image Generation", icon: ImageIcon, chip: "slate" },
      { label: "Edit Image", icon: Pencil, chip: "rose" },
      { label: "Consistent Characters", icon: Users, chip: "gold" },
      { label: "AI Influencer Studio", icon: UserCircle, chip: "peach" },
      { label: "Supercomputer", icon: Sparkles, chip: "peach" },
      { label: "Enhance Image", icon: Wand2, chip: "rose" },
    ],
  },
  {
    heading: "Video",
    items: [
      { label: "Lipsync", icon: UserCircle, chip: "peach" },
      { label: "Video Studio", icon: Tv, chip: "slate" },
      { label: "Marketing Studio", icon: Megaphone, chip: "peach" },
      { label: "Upscale Video", icon: ArrowUpCircle, chip: "slate" },
      { label: "Motion Transfer", icon: Wand2, chip: "slate" },
    ],
  },
  {
    heading: "Templates",
    items: [
      { label: "Alternate Realities", icon: Sparkles, chip: "slate" },
      { label: "Apps", icon: Layers, chip: "gold" },
      { label: "Camera Templates", icon: Camera, chip: "slate" },
      { label: "Careers", icon: Briefcase, chip: "slate" },
      { label: "Character Consistency", icon: Users, chip: "slate" },
      { label: "Effects", icon: Zap, chip: "rose" },
      { label: "Grid", icon: LayoutGrid, chip: "gold" },
      { label: "Instadump", icon: Folder, chip: "slate" },
    ],
  },
  {
    heading: "Audio",
    items: [
      { label: "Text to Speech", icon: Mic, chip: "slate" },
      { label: "Music Generation", icon: Music2, chip: "rose" },
    ],
  },
];

// Small helper for the little hover popovers (Gallery / Support / Account).
// Same open-now-close-with-a-delay pattern as the nav mega-menu, just
// reusable since we need it three times over.
function useHoverIntent(closeDelay = 120) {
  const timer = useRef(null);
  const [open, setOpen] = useState(false);

  function show() {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }
  function hide() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  }

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  return { open, show, hide };
}

export default function Header({ active: activeProp, onNavigate }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  // Uncontrolled by default (page.js currently renders <Header /> with no
  // props), so the active item — and the thumb above it — needs to live
  // here rather than only ever deriving from a prop nobody updates. If a
  // parent *does* pass `active`, we defer to it (controlled mode) so
  // nothing changes for a future wiring.
  const isControlled = activeProp !== undefined;
  const [internalActive, setInternalActive] = useState("home");
  const active = isControlled ? activeProp : internalActive;

  function handleNavigate(key) {
    if (!isControlled) setInternalActive(key);
    onNavigate?.(key);
  }

  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) => item.key === active)
  );

  const wrapperRef = useRef(null);
  const itemRefs = useRef([]);
  const closeTimer = useRef(null);
  const fetchedRef = useRef(new Set()); // categories already requested

  const [track, setTrack] = useState({ width: 0 });
  const [thumb, setThumb] = useState({ left: 0, width: 0 });
  const [hovered, setHovered] = useState(null);

  // Cache of generated images per category: { home: [{url,...}], ... }
  const [imagesByKey, setImagesByKey] = useState({});
  const [loadingKey, setLoadingKey] = useState(null);

  // Gallery / Support / Account hover popovers on the right side.
  const galleryHover = useHoverIntent();
  const supportHover = useHoverIntent();
  const accountHover = useHoverIntent();
  const galleryFetchedRef = useRef(false);
  const [galleryImages, setGalleryImages] = useState(null);

  useEffect(() => {
    function measure() {
      const wrapper = wrapperRef.current;
      const first = itemRefs.current[0];
      const last = itemRefs.current[NAV_ITEMS.length - 1];
      const activeEl = itemRefs.current[activeIndex];
      if (!wrapper || !first || !last || !activeEl) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const firstRect = first.getBoundingClientRect();
      const lastRect = last.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      const trackLeft = firstRect.left - wrapperRect.left;
      const trackRight = lastRect.right - wrapperRect.left;

      setTrack({ width: trackRight - trackLeft });
      setThumb({
        left: activeRect.left - firstRect.left,
        width: activeRect.width,
      });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex]);

  // Fetch images for a category the first time it's opened, then cache.
  useEffect(() => {
    if (!hovered) return;
    if (fetchedRef.current.has(hovered)) return;

    const items = MENUS[hovered] || [];
    if (items.length === 0) return;

    fetchedRef.current.add(hovered);
    setLoadingKey(hovered);

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: hovered, // deterministic seed per category
        mode: "image",
        count: items.length,
        ratio: "7:5", // close to the 112x80 thumb, cropped via object-cover
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.images) {
          setImagesByKey((prev) => ({ ...prev, [hovered]: data.images }));
        }
      })
      .catch(() => {
        fetchedRef.current.delete(hovered); // allow a retry on next hover
      })
      .finally(() => {
        setLoadingKey((k) => (k === hovered ? null : k));
      });
  }, [hovered]);

  // Fetch a small batch of preview images the first time the Gallery
  // popover opens, then keep them cached for the rest of the session.
  useEffect(() => {
    if (!galleryHover.open || galleryFetchedRef.current) return;
    galleryFetchedRef.current = true;

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "gallery-preview",
        mode: "image",
        count: 9,
        ratio: "1:1",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.images) setGalleryImages(data.images);
      })
      .catch(() => {
        galleryFetchedRef.current = false; // allow a retry on next hover
      });
  }, [galleryHover.open]);

  function openMenu(key) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHovered(key);
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHovered(null), 120);
  }

  const isHome = hovered === "home";
  const menu = hovered && !isHome ? MENUS[hovered] ?? [] : [];
  const menuImages = hovered ? imagesByKey[hovered] : null;
  const isMenuLoading = loadingKey === hovered;
  const showPanel = isHome || menu.length > 0;

  return (
    <header
      className="sticky top-0 z-30 bg-cream/95 backdrop-blur px-3 py-3 sm:px-6 lg:px-8"
      onMouseLeave={scheduleClose}
    >
      <div className="grid grid-cols-3 items-center gap-2 sm:gap-3">
        <div className="flex items-center justify-self-start">
          <img src="/logo.png" alt="Fomi" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
        </div>

        <div ref={wrapperRef} className="flex flex-col items-center min-w-0">
          <div
            className="relative h-2 rounded-full bg-[var(--color-accent-track)]"
            style={{ width: track.width }}
            role="progressbar"
            aria-valuenow={activeIndex + 1}
            aria-valuemin={1}
            aria-valuemax={NAV_ITEMS.length}
            aria-label={`Current section: ${NAV_ITEMS[activeIndex]?.label}`}
          >
            <div
              className="absolute inset-y-[2px] rounded-full bg-[var(--color-accent)] transition-[left,width] duration-300"
              style={{ left: thumb.left, width: thumb.width }}
            />
          </div>

          <nav
            aria-label="Primary"
            className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-5 lg:gap-7"
          >
            {NAV_ITEMS.map(({ key, label, icon: Icon }, i) => {
              const isActive = key === active;
              return (
                <button
                  key={key}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => handleNavigate(key)}
                  onMouseEnter={() => openMenu(key)}
                  onFocus={() => openMenu(key)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={label}
                  className={`relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl transition-colors shrink-0 before:content-[''] before:absolute before:-inset-1.5 sm:before:inset-0 ${
                    isActive
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-ink hover:bg-accent-soft"
                  }`}
                >
                  <Icon size={16} className="sm:hidden" strokeWidth={isActive ? 2.25 : 1.75} />
                  <Icon size={17} className="hidden sm:block" strokeWidth={isActive ? 2.25 : 1.75} />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center justify-self-end gap-2 sm:gap-4 lg:gap-6">
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-ink-soft">
            {/* Gallery — hover reveals a small grid of preview thumbnails,
                pulled from the same generate API, anchored to the right so
                it opens toward the left instead of off-screen. */}
            <div
              className="relative"
              onMouseEnter={galleryHover.show}
              onMouseLeave={galleryHover.hide}
            >
              <button
                onClick={() => {
                  document.getElementById("community-gallery")?.scrollIntoView({ behavior: "smooth" });
                  galleryHover.hide();
                }}
                className="hover:text-ink transition-colors cursor-pointer"
                type="button"
              >
                Gallery
              </button>
              {galleryHover.open && (
                <div
                  className="absolute right-0 top-full mt-3 w-48 rounded-2xl border border-border bg-cream p-3 shadow-xl z-40"
                  onMouseEnter={galleryHover.show}
                  onMouseLeave={galleryHover.hide}
                >
                  <div className="grid grid-cols-3 gap-1.5">
                    {Array.from({ length: 9 }).map((_, i) => {
                      const img = galleryImages?.[i];
                      return img ? (
                        <img
                          key={img.id ?? i}
                          src={img.url}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span
                          key={i}
                          className="h-12 w-12 rounded-lg bg-accent-soft animate-pulse"
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Support — static contact info, nothing to fetch. */}
            <div
              className="relative"
              onMouseEnter={supportHover.show}
              onMouseLeave={supportHover.hide}
            >
              <button className="hover:text-ink transition-colors" type="button">
                Support
              </button>
              {supportHover.open && (
                <div
                  className="absolute right-0 top-full mt-3 w-60 rounded-2xl border border-border bg-cream p-4 shadow-xl z-40 text-left"
                  onMouseEnter={supportHover.show}
                  onMouseLeave={supportHover.hide}
                >
                  <p className="font-display font-semibold text-ink text-sm mb-1">
                    Need a hand?
                  </p>
                  <p className="text-ink-soft text-sm mb-3">
                    We typically reply within a few hours.
                  </p>
                  <div className="flex items-center gap-2 text-ink-soft text-sm">
                    <Mail size={14} className="shrink-0" />
                    <span>support@fomi.app</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-[#D98A63] hover:text-white transition-colors shrink-0"
          >
            {mounted && isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Account — hover reveals static Sign in / Sign up actions. */}
          <div
            className="relative"
            onMouseEnter={accountHover.show}
            onMouseLeave={accountHover.hide}
          >
            <span className="h-9 w-9 rounded-full bg-accent-soft border border-border shrink-0 overflow-hidden block">
              <img
                src="https://picsum.photos/seed/fomi-avatar/64/64"
                alt="Your account avatar"
                className="h-full w-full object-cover"
                width={36}
                height={36}
              />
            </span>
            {accountHover.open && (
              <div
                className="absolute right-0 top-full mt-3 w-48 rounded-2xl border border-border bg-cream p-3 shadow-xl z-40"
                onMouseEnter={accountHover.show}
                onMouseLeave={accountHover.hide}
              >
                <p className="text-ink-soft text-sm mb-3">
                  You're browsing as a guest.
                </p>
                <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    className="sm:hidden w-full flex items-center justify-between rounded-full border border-border text-ink text-sm font-medium py-2 px-4 hover:bg-cream-deep transition-colors"
                  >
                    <span>{isDark ? "Light mode" : "Dark mode"}</span>
                    {mounted && isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white text-sm font-semibold py-2 transition-colors"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-full border border-border text-ink text-sm font-semibold py-2 hover:bg-card transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPanel && (
        <div
          className="absolute inset-x-0 top-full px-3 sm:px-6 lg:px-8"
          onMouseEnter={() => openMenu(hovered)}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-border bg-cream p-5 shadow-xl">
            {isHome ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
                {HOME_MENU.map((section) => (
                  <div key={section.heading} className="min-w-0">
                    <p className="text-sm text-ink-soft mb-2 px-2">{section.heading}</p>
                    <div className="flex flex-col gap-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            className="group flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-cream-deep"
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${CHIP_CLASSES[item.chip]}`}
                            >
                              <Icon size={16} strokeWidth={1.75} />
                            </span>
                            <span className="text-sm text-ink truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {menu.map((card, i) => {
                  const generated = menuImages?.[i];
                  const imgSrc = generated?.url || card.img;
                  const showSkeleton = isMenuLoading && !generated;

                  return (
                    <button
                      key={card.title}
                      type="button"
                      className="group flex items-end justify-between gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 text-left shadow-[0_1px_2px_rgba(43,36,29,0.04),0_8px_20px_-6px_rgba(43,36,29,0.10)] transition-shadow hover:shadow-[0_1px_2px_rgba(43,36,29,0.06),0_14px_28px_-8px_rgba(43,36,29,0.16)]"
                    >
                      <span className="text-base font-normal leading-tight text-ink text-pretty">
                        {card.title}
                      </span>
                      {showSkeleton ? (
                        <span className="h-20 w-28 shrink-0 rounded-xl bg-accent-soft animate-pulse" />
                      ) : (
                        <img
                          src={imgSrc || "/placeholder.svg"}
                          alt=""
                          className="h-20 w-28 shrink-0 rounded-xl object-cover"
                          width={112}
                          height={80}
                          loading="lazy"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}