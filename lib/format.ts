export function formatDuration(seconds: number | null) {
  if (!seconds) {
    return { h: 0, m: 0, s: 0 };
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h: h, m: m, s: s };
}

export function formatDistance(meters: number | null) {
  if (!meters) {
    return { km: 0, m: 0 };
  }
  const km = meters / 1000;
  const reminderInMeters = meters % 1000;

  return { km: km, m: reminderInMeters };
}

export function formatPace(metersPerSeconds: number | null) {
  if (!metersPerSeconds) {
    return 0;
  }
  const kilometersPerHours = (metersPerSeconds * 1000) / 3600;
  return kilometersPerHours;
}
