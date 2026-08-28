import type { Metadata } from "next";
import "./globals.css";
import GridOverlay from "@/components/GridOverlay";

import { client } from "@/sanity/client";

export const metadata: Metadata = {
  title: "Studio Tenev",
  description: "Studio Tenev - Arkitekt Bergen",
};

export const revalidate = 60;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await client.fetch('*[_type == "siteSettings"][0]{showGridOverlay}').catch(() => null);
  const showGridOverlay = settings?.showGridOverlay === true;

  return (
    <html lang="en" className="h-full antialiased">
      <body className="font-sans text-base antialiased bg-white text-black min-h-full flex flex-col">
        {children}
        {showGridOverlay && <GridOverlay />}
      </body>
    </html>
  );
}
