/**
 * Returns a short relative time string like "3m ago" or "2h ago". For more
 * sophisticated needs the dashboard can wrap this in Intl.RelativeTimeFormat,
 * but most order timestamps are within hours so this is sufficient.
 */
export function formatRelative(input: string | Date, now: Date = new Date()): string {
  const target = typeof input === "string" ? new Date(input) : input;
  const diffMs = now.getTime() - target.getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return target.toLocaleDateString();
}

export function formatTimeOfDay(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
