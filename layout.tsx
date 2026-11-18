import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "M.S Makeovers — Bridal & Beauty Studio in Agra",
    template: "%s | M.S Makeovers",
  },
  description:
    "Bridal makeup and professional beauty artistry by Madhuri Sharma in Anwalkhera, Agra. Explore services, discover bridal inspiration, and enquire about your appointment.",
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = {
  themeColor: "#1b1a18",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
