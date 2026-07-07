import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "신정개발 급여 대시보드",
  description: "㈜신정개발 직원 급여 정산 대시보드 (샘플·가상데이터)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
