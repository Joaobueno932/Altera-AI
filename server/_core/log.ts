// Lightweight logging helpers that avoid spamming the console in dev
// and allow one-time messages for known, non-fatal conditions.

const seen = new Set<string>();

export function infoOnce(message: string) {
  if (seen.has(message)) return;
  seen.add(message);
  console.info(message);
}

export function warnOnce(message: string) {
  if (seen.has(message)) return;
  seen.add(message);
  console.warn(message);
}
