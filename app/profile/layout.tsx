import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mooscles — Profile',
  description: 'Manage your profile and weekly goals.',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
