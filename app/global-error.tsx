'use client';

import './globals.css';
import Button from '@/components/ui/buttons/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="page-center p-6">
        <div className="error-card">
          <h2 className="error-card-title">Something went wrong</h2>
          <p className="error-card-text">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <Button onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
