import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeeFlow",
  description: "Internal workflow OS for Beenco"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
