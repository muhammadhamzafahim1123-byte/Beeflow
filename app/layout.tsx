import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeeFlow",
  description: "Internal workflow OS for Beenco"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-solid-rounded/css/uicons-solid-rounded.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
