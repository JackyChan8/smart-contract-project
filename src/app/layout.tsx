import type { Metadata } from "next";

import './globals.scss';

// Providers
import { AppProviders } from "@/providers/providers";

export const metadata: Metadata = {
  title: "AppKit in Next.js + ethers",
  description: "AppKit example dApp",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body>
        <AppProviders>
            {children}
        </AppProviders>
      </body>
    </html>
  );
}
