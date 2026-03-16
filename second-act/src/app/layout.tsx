import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Second Act Chicago — Bid on Vacant Lots & Abandoned Buildings",
  description:
    "Discover, bid on, and reimagine vacant lots and abandoned buildings in Chicago. Local residents get priority. Powered by City of Chicago Open Data, Google Maps, and AI visualization.",
  keywords: "Chicago, vacant lots, abandoned buildings, real estate, bid, community development, neighborhood revitalization",
  openGraph: {
    title: "Second Act Chicago",
    description: "Transform Chicago's neighborhoods — bid on vacant lots and abandoned buildings",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#060914] text-white">
        <Header />
        {children}
      </body>
    </html>
  );
}
