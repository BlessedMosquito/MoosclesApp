import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mooscles — Calendar',
  description: 'View and manage your workout calendar.',
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
