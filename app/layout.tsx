import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sioux Badminton Tournament",
  description: "Manage your team-based badminton tournament",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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




