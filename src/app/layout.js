import "./globals.css";

export const metadata = {
  title: "Fomi — AI Image & Video Generation",
  description:
    "Create, edit, transform, enhance and upscale images and videos with Fomi's AI-powered creative studio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
