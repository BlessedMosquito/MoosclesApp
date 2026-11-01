'use client';

import Button from '@/components/ui/buttons/Button';

type ErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <main className="page-center p-6">
      <div className="error-card">
        <h2 className="error-card-title">Something went wrong</h2>
        <p className="error-card-text">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
