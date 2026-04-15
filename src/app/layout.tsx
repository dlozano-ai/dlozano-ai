import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KindWorks.AI · Org Usage Dashboard",
  description:
    "Monitor Claude API usage, costs, and spend limits across your KindWorks organization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Load Jeko stand-in (Inter), body (DM Sans), serif emphasis (Source Serif 4) via CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:ital,wght@1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
