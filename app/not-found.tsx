'use client';

import Button from '@/components/ui/buttons/Button';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  return (
    <main className="page-center">
      <div className="flex flex-col">
        <h1 className="not-found-code">404</h1>
        <Button onClick={() => router.push('/dashboard')}>Go back</Button>
      </div>
    </main>
  );
}
