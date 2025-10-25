import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Café Dashboard - Importador de CSV",
  description: "Dashboard para importação e manipulação de dados bancários em CSV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
