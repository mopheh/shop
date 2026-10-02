import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopNG — Premium Online Store",
  description:
    "Discover premium tech and lifestyle products. Fast delivery across Nigeria.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {/* Providers wraps everything so both auth and cart context are available */}
        <Providers>
          <CartProvider>
            <Navbar />
            {children}
            <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-400">
              © {new Date().getFullYear()} ShopNG. All rights reserved.
            </footer>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
