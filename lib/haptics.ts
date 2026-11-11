export function haptic(pattern: number | number[] = 10) {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  navigator.vibrate(pattern);
}
