'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

type GreetingProps = {
  name: string | null;
};

function subscribeNoop() {
  return () => {};
}

function greetingForHour(hour: number | null) {
  if (hour === null) return 'Hello';
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Greeting({ name }: GreetingProps) {
  const router = useRouter();
  const hour = useSyncExternalStore(
    subscribeNoop,
    () => new Date().getHours(),
    () => null
  );
  const trimmed = name?.trim() ?? '';
  const initial = trimmed.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      aria-label="Open profile"
      onClick={() => router.push('/profile')}
      className="greeting"
    >
      <span className="greeting-text">
        <span className="greeting-hello">{greetingForHour(hour)}</span>
        {trimmed && <span className="greeting-name">{trimmed}</span>}
      </span>
      <span className="greeting-avatar">{initial || '?'}</span>
    </button>
  );
}
