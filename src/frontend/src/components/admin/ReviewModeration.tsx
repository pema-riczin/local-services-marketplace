import type { ProviderView } from "@/backend";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteReview, useReviewsForProvider } from "@/hooks/useQueries";
import { formatRating, formatTimestamp } from "@/lib/format";
import { Loader2, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ReviewModeration({ providers }: { providers: ProviderView[] }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const providerId = selectedId ? BigInt(selectedId) : undefined;
  const reviewsQuery = useReviewsForProvider(providerId);
  const deleteReview = useDeleteReview();

  const handleDelete = (id: bigint) => {
    deleteReview.mutate(id, {
      onSuccess: () => toast.success("Review removed"),
      onError: () => toast.error("Could not remove review. Please try again."),
    });
  };

  return (
    <div className="grid gap-6" data-ocid="admin.reviews.panel">
      <div className="grid max-w-md gap-2">
        <Label htmlFor="review-provider">Provider</Label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger
            id="review-provider"
            className="w-full"
            data-ocid="admin.reviews.provider_select"
          >
            <SelectValue placeholder="Choose a provider to moderate" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem
                key={provider.id.toString()}
                value={provider.id.toString()}
              >
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {providerId === undefined ? (
        <div
          className="rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center"
          data-ocid="admin.reviews.empty_state"
        >
          <p className="font-display text-lg font-semibold text-foreground">
            Select a provider
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a provider above to review and remove its reviews.
          </p>
        </div>
      ) : reviewsQuery.isLoading ? (
        <div className="grid gap-3" data-ocid="admin.reviews.loading_state">
          {Array.from({ length: 3 }, (_, i) => `review-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-24 w-full rounded-xl" />
            ),
          )}
        </div>
      ) : reviewsQuery.isError ? (
        <p
          className="text-sm text-destructive"
          data-ocid="admin.reviews.error_state"
        >
          Could not load reviews. Please try again.
        </p>
      ) : (reviewsQuery.data ?? []).length === 0 ? (
        <div
          className="rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center"
          data-ocid="admin.reviews.empty_state"
        >
          <p className="font-display text-lg font-semibold text-foreground">
            No reviews yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This provider has not received any reviews.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3" data-ocid="admin.reviews.list">
          {(reviewsQuery.data ?? []).map((review, index) => (
            <li
              key={review.id.toString()}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-subtle"
              data-ocid={`admin.reviews.item.${index + 1}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-accent">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {formatRating(Number(review.rating))}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(review.createdAt)}
                  </span>
                </div>
                <p className="mt-2 break-words text-sm text-foreground">
                  {review.text}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Remove review"
                onClick={() => handleDelete(review.id)}
                disabled={deleteReview.isPending}
                className="text-destructive hover:text-destructive"
                data-ocid={`admin.reviews.delete_button.${index + 1}`}
              >
                {deleteReview.isPending ? (
                  <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
