import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mooscles — Confirm Email',
  description: 'Confirm your email address.',
};

export default function ConfirmEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
