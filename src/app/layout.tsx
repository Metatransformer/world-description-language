/** @jsxImportSource react */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Generative World Studio",
  description: "Compose and inspect portable JSX game worlds",
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
