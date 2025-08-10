import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { AuthenticatedLayout } from "./authenticated-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "POS System",
  description: "Point of Sale System built with Next.js",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
