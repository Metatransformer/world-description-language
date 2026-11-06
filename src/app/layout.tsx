/** @jsxImportSource react */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WDL — Valenreach",
  description: "Local World Description Language workbench",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
