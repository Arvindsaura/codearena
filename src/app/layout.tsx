import type { Metadata } from "next";
import { Inter, VT323 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });
const vt323 = VT323({ weight: "400", subsets: ["latin"], variable: "--font-pixel" });

export const metadata: Metadata = {
  title: "CodeArena | Sync LeetCode, Analyze Code, Compete",
  description: "A competitive platform to sync LeetCode activity, analyze code via AI, and compete in private rooms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${vt323.variable} min-h-screen bg-background text-foreground antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
