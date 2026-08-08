import Big from 'big.js';

export function formatDuration(minutes: number | null) {
  if (minutes === null) {
    return { h: 0, m: 0 };
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return { h, m };
}

export function formatDistance(meters: number | null) {
  if (meters == null) {
    return { km: 0, m: 0 };
  }

  const metersBig = new Big(meters);

  const km = metersBig.div(1000);
  const remainder = metersBig.mod(1000);

  return {
    km: km.toNumber(),
    m: remainder.toNumber(),
  };
}

export function formatPace(
  durationMinutes: number | null,
  distanceMeters: number | null
) {
  if (
    durationMinutes == null ||
    distanceMeters == null ||
    durationMinutes <= 0 ||
    distanceMeters <= 0
  ) {
    return 0;
  }

  return new Big(distanceMeters)
    .div(durationMinutes)
    .times(0.06)
    .round(2)
    .toNumber();
}
