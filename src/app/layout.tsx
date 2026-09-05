import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavigationLoader } from "@/components/layout/navigation-loader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PeoplePay360",
  description: "Personnel and payroll.",
  icons: {
    icon: "/logoHR360.png",
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
