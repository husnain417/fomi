import Script from "next/script";
import { THEME_KEY } from "@/lib/theme";

export const metadata = {
  title: "Studio — Fomi",
  description: "Thread & Loupe: the professional creative workspace.",
};

// Same idea as the root layout's theme-init script (runs before hydration
// to avoid a flash), scoped to this route: if the person has never made an
// explicit choice, /studio opens dark — professional tools people use for
// hours default dark for eye strain and neutral color judgment — while the
// homepage keeps opening light. If they *have* made an explicit choice
// (toggled it anywhere, on this route or the homepage), that choice wins
// here too, because it's one localStorage key and one `useTheme` system,
// not two competing ones. This only covers a hard navigation/reload; the
// StudioThemeInit client component below handles client-side route
// transitions the same way.
const studioThemeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_KEY)});
    var root = document.documentElement;
    var theme = stored === "light" || stored === "dark" ? stored : "light";
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function StudioLayout({ children }) {
  return (
    <>
      <Script
        id="studio-theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: studioThemeInitScript }}
      />
      {children}
    </>
  );
}
