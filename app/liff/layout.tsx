import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '返信管理',
  description: 'スクール返信管理システム',
};

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

