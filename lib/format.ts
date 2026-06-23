import Big from 'big.js';

export function formatDuration(seconds: number | null) {
  if (seconds == null) {
    return { h: 0, m: 0, s: 0 };
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return { h, m, s };
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
  durationSeconds: number | null,
  distanceMeters: number | null
) {
  if (
    durationSeconds == null ||
    distanceMeters == null ||
    durationSeconds <= 0 ||
    distanceMeters <= 0
  ) {
    return 0;
  }

  return new Big(distanceMeters)
    .div(durationSeconds)
    .times(3.6)
    .round(2)
    .toNumber();
}
