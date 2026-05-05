import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YourCourt",
  description: "Find basketball courts near you on a live map.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
