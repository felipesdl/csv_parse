import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";

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
      <body className="antialiased">
        <QueryProvider>
          <ToastProvider />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
