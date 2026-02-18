import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { FAB } from "@/components/FAB";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recipes — Share Your Cooking",
  description: "A photo-first recipe sharing app. Browse, create, and share step-by-step recipes with photos.",
  openGraph: {
    title: "Recipes — Share Your Cooking",
    description: "A photo-first recipe sharing app.",
    url: "https://recipes.impulsestudios.cc",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-57px)]">{children}</main>
          <FAB />
        </AuthProvider>
      </body>
    </html>
  );
}
