import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Receipt to Sheet",
  description: "Turn receipt images into a tidy spreadsheet.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
