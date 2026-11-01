import { Children, ReactNode } from 'react';
import ErrorPopUp from '../ui/feedback/ErrorPopUp';

type AuthLayoutProps = {
  children: ReactNode;
  error?: string | null;
  onDismissError?: () => void;
};

export default function AuthLayout({
  children,
  error,
  onDismissError,
}: AuthLayoutProps) {
  const [title, ...content] = Children.toArray(children);

  return (
    <main className="auth-page">
      <div className="auth-card">
        {title}
        {error && (
          <ErrorPopUp onClose={() => onDismissError?.()}>{error}</ErrorPopUp>
        )}
        {content}
      </div>
    </main>
  );
}
