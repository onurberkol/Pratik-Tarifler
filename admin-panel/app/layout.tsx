import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pratik Tarifler — Admin Panel",
  description: "İçerik, kullanıcı, abonelik ve bildirim yönetimi paneli",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
