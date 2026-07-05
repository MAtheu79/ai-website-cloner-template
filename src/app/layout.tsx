import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "fishaudio/fish-speech: SOTA Open Source TTS",
  description:
    "SOTA Open Source TTS. Contribute to fishaudio/fish-speech development by creating an account on GitHub.",
  icons: {
    icon: "/seo/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-gh-canvas text-foreground">
        {children}
      </body>
    </html>
  );
}
