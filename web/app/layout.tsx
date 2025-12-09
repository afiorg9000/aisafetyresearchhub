import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/auth-provider";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Knowledge Base for AI Safety Research",
  description: "A comprehensive directory of AI safety research organizations, projects, and publications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSans.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
