import type { BookingStatus } from "@/backend";

/** Convert a Motoko nanosecond timestamp into a JS Date, or null when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a nanosecond timestamp as a short readable date. */
export function formatTimestamp(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format an hourly rate stored as whole currency units. */
export function formatHourlyRate(rate: bigint): string {
  return `$${rate.toString()}/hour`;
}

/** Format an average rating to one decimal place. */
export function formatRating(rating: number): string {
  if (!Number.isFinite(rating) || rating <= 0) return "New";
  return rating.toFixed(1);
}

/** Human-readable label for a booking status. */
export function bookingStatusLabel(status: BookingStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    default:
      return "Unknown";
  }
}

/** Tailwind classes for a booking status badge. */
export function bookingStatusClasses(status: BookingStatus): string {
  switch (status) {
    case "accepted":
      return "bg-primary/10 text-primary border-primary/20";
    case "declined":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-accent/15 text-accent-foreground border-accent/30";
  }
}

/** Format a requested date string (YYYY-MM-DD) for display. */
export function formatRequestedDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
