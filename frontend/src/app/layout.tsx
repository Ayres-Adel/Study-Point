import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "StudyPoint — Study. Earn. Recharge.",
  description:
    "The first platform that turns exam prep into real Mobilis credit for Algerian students.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <ClientProviders />
        <div className="relative z-[1] min-h-screen">{children}</div>
      </body>
    </html>
  );
}

