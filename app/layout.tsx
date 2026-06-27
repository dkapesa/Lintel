import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lintel",
  description: "Verify whether AI-assisted pull requests are safe, tested, maintainable and ready to merge.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
