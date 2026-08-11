import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Life Helper | 하루결",
  description:
    "오늘의 할 일과 습관을 한곳에서 관리하는 근거 기반 생활 루틴 도우미",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
