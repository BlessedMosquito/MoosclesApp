import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mooscles — Add Workout Data',
  description: 'Add time, distance, or exercises to your workout.',
};

export default function AddWorkoutDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
