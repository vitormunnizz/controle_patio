import "./globals.css";

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
        className="bg-slate-50 font-sans antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
