import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "JC Pneus - Gestão de Veículos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* 
        CORREÇÃO: Adicionamos o suppressHydrationWarning no <body> também.
        Isso ignora atributos injetados por extensões como ColorZilla (cz-shortcut-listen).
      */}
      <body 
        className={`${inter.className} bg-slate-50 antialiased`} 
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}