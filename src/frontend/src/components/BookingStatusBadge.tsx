import type { BookingStatus } from "@/backend";
import { bookingStatusClasses, bookingStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Pill badge that renders a booking's status with semantic coloring. */
export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        bookingStatusClasses(status),
        className,
      )}
      data-ocid="booking.status_badge"
    >
      {bookingStatusLabel(status)}
    </span>
  );
}
