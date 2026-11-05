import { BookingForm } from "@/components/BookingForm";
import { ReviewList } from "@/components/ReviewList";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useProvider, useReviewsForProvider } from "@/hooks/useQueries";
import { formatHourlyRate } from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ImageOff, MapPin } from "lucide-react";

function DetailSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6"
      data-ocid="provider.loading_state"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function ProviderDetailPage() {
  const { providerId } = useParams({ from: "/providers/$providerId" });
  const id = BigInt(providerId);

  const providerQuery = useProvider(id);
  const reviewsQuery = useReviewsForProvider(id);

  const provider = providerQuery.data ?? null;

  if (providerQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (providerQuery.isError) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6"
        data-ocid="provider.error_state"
      >
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
          <p className="font-display text-xl font-semibold text-foreground">
            We couldn't load this provider
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while fetching the profile.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => void providerQuery.refetch()}
            data-ocid="provider.retry_button"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6"
        data-ocid="provider.not_found_state"
      >
        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold text-foreground">
            Provider not found
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This profile may have been removed or the link is incorrect.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/" data-ocid="provider.back_link">
              Back to directory
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const reviews = reviewsQuery.data ?? [];

  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
      data-ocid="provider.page"
    >
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 mb-6 text-muted-foreground"
      >
        <Link to="/" data-ocid="provider.back_link">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to directory
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {provider.photo ? (
              <img
                src={provider.photo.getDirectURL()}
                alt={`${provider.name}, ${provider.location}`}
                className="h-72 w-full object-cover sm:h-96"
                data-ocid="provider.photo"
              />
            ) : (
              <div
                className="flex h-72 w-full items-center justify-center bg-gradient-subtle sm:h-96"
                data-ocid="provider.photo_placeholder"
              >
                <ImageOff className="h-10 w-10 text-muted-foreground/50" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1
                  className="font-display text-4xl font-semibold tracking-tight text-foreground"
                  data-ocid="provider.name"
                >
                  {provider.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {provider.location}
                  </span>
                  <StarRating
                    rating={provider.averageRating}
                    reviewCount={provider.reviewCount}
                    size="md"
                  />
                </div>
              </div>
              <div className="text-right">
                <p
                  className="font-display text-2xl font-semibold text-primary"
                  data-ocid="provider.hourly_rate"
                >
                  {formatHourlyRate(provider.hourlyRate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Typical hourly rate
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                About
              </h2>
              <p
                className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground"
                data-ocid="provider.description"
              >
                {provider.description}
              </p>
            </div>
          </div>

          <Separator />

          <ReviewList
            providerId={provider.id}
            reviews={reviews}
            isLoading={reviewsQuery.isLoading}
          />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingForm providerId={provider.id} providerName={provider.name} />
        </aside>
      </div>
    </div>
  );
}
