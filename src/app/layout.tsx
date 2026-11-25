import type { Metadata } from "next";
import "./globals.css";

const description =
  "AI-driven design generation that's fast, brand-compliant, and built for creativity.";

export const metadata: Metadata = {
  title: "Linen - Design fabric for the AI era",
  description,
  icons: {
    icon: { url: "/landing/assets/linen-brand-icon.svg", type: "image/svg+xml" },
    apple: "/landing/assets/linen-apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Linen",
    title: "Linen - Design fabric for the AI era",
    description,
    images: [{ url: "/landing/assets/linen-social.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linen - Design fabric for the AI era",
    description,
    images: ["/landing/assets/linen-social.jpg"],
  },
};

/* Mirrors landing-theme.js: stored choice wins, otherwise the OS preference. Runs before paint.
   data-theme is mirrored too: diffui-button falls back to <html data-theme> outside a shadow host. */
const themeBootstrap = `(() => {
  let t = "";
  try { t = localStorage.getItem("diffui-landing-theme") || ""; } catch {}
  if (t !== "light" && t !== "dark") t = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.dataset.landingTheme = t;
  document.documentElement.dataset.theme = t;
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-landing-theme="" data-theme="" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Loaded by family name: the vendored shadow-DOM engines reference "Geist Mono" literally. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
