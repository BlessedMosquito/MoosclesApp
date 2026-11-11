import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSafeInternalPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || /^\/[/\\]/.test(value)) return null;
  if (/[\u0000-\u001f\\]/.test(value)) return null;
  try {
    const url = new URL(value, 'https://mooscles.local');
    if (url.origin !== 'https://mooscles.local') return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
