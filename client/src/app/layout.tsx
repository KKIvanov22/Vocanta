import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vocanta — AI-Powered Job Matching",
  description:
    "Tell us what you can do, and our intelligent AI instantly matches you with the best job opportunities tailored to your unique skills and experience.",
  keywords: ["job matching", "AI jobs", "career", "job search", "vocanta"],
  openGraph: {
    title: "Vocanta — AI-Powered Job Matching",
    description:
      "Find your perfect job with AI precision. Join thousands of professionals who found their dream role with Vocanta.",
    type: "website",
    url: "https://vocanta.com",
    siteName: "Vocanta",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vocanta — AI-Powered Job Matching",
    description:
      "Find your perfect job with AI precision. Join thousands of professionals who found their dream role with Vocanta.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
