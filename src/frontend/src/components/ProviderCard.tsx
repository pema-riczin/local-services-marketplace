import { StarRating } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatHourlyRate } from "@/lib/format";
import type { ProviderCardData } from "@/types";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

interface ProviderCardProps {
  data: ProviderCardData;
  index: number;
}

/** Editorial provider card: photo, name, category badge, rate and rating. */
export function ProviderCard({ data, index }: ProviderCardProps) {
  const { provider, categoryName } = data;
  const photoUrl = provider.photo?.getDirectURL();

  return (
    <Card
      className="group overflow-hidden rounded-xl border-border bg-card shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
      data-ocid={`provider.card.${index + 1}`}
    >
      <Link
        to="/providers/$providerId"
        params={{ providerId: provider.id.toString() }}
        className="block focus-visible:outline-none"
        data-ocid={`provider.link.${index + 1}`}
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={provider.name}
              className="h-full w-full object-cover transition-smooth group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-subtle">
              <span className="font-display text-4xl text-primary/40">
                {provider.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 truncate font-display text-lg font-semibold text-foreground">
              {provider.name}
            </h3>
            <Badge
              variant="secondary"
              className="shrink-0 rounded-full bg-secondary text-secondary-foreground"
            >
              {categoryName}
            </Badge>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{provider.location}</span>
          </p>
          <p className="font-mono text-base font-medium text-foreground">
            {formatHourlyRate(provider.hourlyRate)}
          </p>
          <StarRating
            rating={provider.averageRating}
            reviewCount={provider.reviewCount}
          />
        </div>
      </Link>
    </Card>
  );
}
