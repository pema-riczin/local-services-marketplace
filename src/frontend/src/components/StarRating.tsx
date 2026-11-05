import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  /** Average rating from 0 to 5. */
  rating: number;
  /** Number of reviews, shown beside the stars when provided. */
  reviewCount?: bigint;
  size?: "sm" | "md";
  className?: string;
}

/** Warm clay star row used across provider cards and detail pages. */
export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  className,
}: StarRatingProps) {
  const rounded = Math.round(rating);
  const starSize = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      data-ocid="rating.stars"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((position) => (
          <Star
            key={position}
            className={cn(
              starSize,
              position <= rounded
                ? "fill-accent text-accent"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      <span className="font-mono text-xs text-muted-foreground">
        {rating > 0 ? rating.toFixed(1) : "New"}
        {reviewCount !== undefined
          ? ` (${reviewCount.toString()} ${reviewCount === 1n ? "review" : "reviews"})`
          : ""}
      </span>
    </div>
  );
}
