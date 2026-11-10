import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/lib/convex";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CircleCursor } from "@/components/ui/CircleCursor";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://circlee.app"),
  title: "Circlee — The CIRCLEE. Connecting to People.",
  description:
    "Discover people, share your moments and build meaningful connections in one place. Real-time conversations, rich media posts, and your genuine circle.",
  keywords: [
    "Circlee",
    "Social Network",
    "Real-time Chat",
    "Convex",
    "Private Circles",
    "Community",
  ],
  authors: [{ name: "Circlee Team" }],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/assets/circlee-symbol.png",
  },
  openGraph: {
    title: "Circlee — The CIRCLEE. Connecting to People.",
    description:
      "Discover people, share your moments and build meaningful connections in one place.",
    url: "https://circlee.app",
    siteName: "Circlee",
    images: [
      {
        url: "/assets/circlee-logo.png",
        width: 1024,
        height: 1024,
        alt: "Circlee Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Circlee — The CIRCLEE. Connecting to People.",
    description:
      "Discover people, share your moments and build meaningful connections in one place.",
    images: ["/assets/circlee-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_cHJvdWQtaW1wYWxhLTI3LmNsZXJrLmFjY291bnRzLmRldiQ"}
      appearance={{
        variables: {
          colorPrimary: "#8B5CF6",
          colorBackground: "#0D0D12",
          colorInputBackground: "#14141C",
          colorInputText: "#FFFFFF",
          colorText: "#FFFFFF",
          colorTextSecondary: "#A5A0B2",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-[#0D0D12] border border-[#272733] shadow-2xl",
        },
      }}
    >
      <html lang="en" className="dark scroll-smooth">
        <body className="min-h-screen bg-black text-white flex flex-col antialiased selection:bg-[#8B5CF6]/30 font-sans">
          <SmoothScroll />
          <CircleCursor />
          <ConvexClientProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
