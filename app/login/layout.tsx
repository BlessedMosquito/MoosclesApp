import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mooscles — Login',
  description: 'Sign in to your Mooscles account.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
