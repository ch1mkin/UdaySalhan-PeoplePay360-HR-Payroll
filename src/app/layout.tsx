import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavigationLoader } from "@/components/layout/navigation-loader";
import { PRODUCTION_APP_URL } from "@/lib/env";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_APP_URL),
  title: "PeoplePay360",
  description: "Personnel and payroll.",
  icons: {
    icon: [{ url: "/logoHR360.png", type: "image/png", sizes: "any" }],
    shortcut: "/logoHR360.png",
    apple: "/logoHR360.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-pp-bg font-sans text-pp-text text-[14px]">
        <NavigationLoader />
        {children}
      </body>
    </html>
  );
}
