import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mooscles — Dashboard',
  description: 'Track your workouts, progress, and weekly goals.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
