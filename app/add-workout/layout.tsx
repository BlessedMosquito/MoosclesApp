import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mooscles — Add Workout',
  description: 'Create a new workout session.',
};

export default function AddWorkoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
