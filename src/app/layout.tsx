import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TemanUang — Atur keuangan dengan lebih mudah",
  description:
    "Catat pemasukan dan pengeluaran, pahami kebiasaan belanjamu, dan jaga anggaran tetap terarah.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
