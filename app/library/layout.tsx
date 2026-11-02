import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mooscles — Library',
  description: 'Browse workouts, exercise progress and templates.',
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
