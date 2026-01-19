import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Badminton Tournament Manager",
  description: "Manage your team-based badminton tournament",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}




