import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mooscles — Register',
  description: 'Create your Mooscles account.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
