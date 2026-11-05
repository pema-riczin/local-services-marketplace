import type { ProviderId, Review } from "@/backend";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddReview,
  useDeleteReview,
  useUpdateReview,
} from "@/hooks/useQueries";
import { formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Loader2, Pencil, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewListProps {
  providerId: ProviderId;
  reviews: Review[];
  isLoading: boolean;
}

/** Interactive 1-5 star picker used by the review form. */
function StarPicker({
  name,
  value,
  onChange,
  disabled,
}: {
  name: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset
      className="flex items-center gap-1"
      aria-label="Your rating"
      disabled={disabled}
    >
      {[1, 2, 3, 4, 5].map((position) => (
        <label
          key={position}
          className="cursor-pointer rounded-md p-1 transition-smooth hover:scale-110 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
          data-ocid={`review.rating_${position}`}
        >
          <input
            type="radio"
            name={name}
            value={position}
            checked={value === position}
            onChange={() => onChange(position)}
            disabled={disabled}
            className="sr-only"
            aria-label={`${position} star${position === 1 ? "" : "s"}`}
          />
          <Star
            className={cn(
              "h-6 w-6",
              position <= value
                ? "fill-accent text-accent"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        </label>
      ))}
    </fieldset>
  );
}

/** A single review row with author, stars, text and optional owner actions. */
function ReviewItem({
  review,
  isOwner,
  onEdit,
  onDelete,
  isDeleting,
}: {
  review: Review;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <Card
      className="rounded-lg border-border shadow-none"
      data-ocid="review.item"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <StarRating rating={Number(review.rating)} size="md" />
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {formatTimestamp(review.createdAt)}
            </p>
          </div>
          {isOwner ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Edit your review"
                onClick={onEdit}
                data-ocid="review.edit_button"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Delete your review"
                onClick={onDelete}
                disabled={isDeleting}
                data-ocid="review.delete_button"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          ) : null}
        </div>
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
          {review.text}
        </p>
      </CardContent>
    </Card>
  );
}

/** Reviews section: list, plus add / edit / delete for the signed-in author. */
export function ReviewList({
  providerId,
  reviews,
  isLoading,
}: ReviewListProps) {
  const { identity, isAuthenticated } = useInternetIdentity();
  const addReview = useAddReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");

  const callerPrincipal = identity?.getPrincipal().toString();
  const myReview = callerPrincipal
    ? reviews.find((review) => review.author.toString() === callerPrincipal)
    : undefined;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (rating < 1 || text.trim().length === 0) return;
    const payload = { providerId, rating: BigInt(rating), text: text.trim() };
    setRating(0);
    setText("");
    addReview.mutate(payload, {
      onSuccess: () => toast.success("Your review was posted."),
      onError: () => {
        setRating(Number(payload.rating));
        setText(payload.text);
        toast.error("Could not post your review. Please try again.");
      },
    });
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(Number(review.rating));
    setEditText(review.text);
  };

  const handleUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    if (editingId === null || editRating < 1 || editText.trim().length === 0) {
      return;
    }
    updateReview.mutate(
      { id: editingId, rating: BigInt(editRating), text: editText.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          toast.success("Your review was updated.");
        },
        onError: () => toast.error("Could not update your review."),
      },
    );
  };

  const handleDelete = (id: bigint) => {
    deleteReview.mutate(id, {
      onSuccess: () => toast.success("Your review was deleted."),
      onError: () => toast.error("Could not delete your review."),
    });
  };

  return (
    <section
      className="flex flex-col gap-5"
      aria-labelledby="reviews-heading"
      data-ocid="review.section"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="reviews-heading"
          className="font-display text-2xl font-semibold tracking-tight text-foreground"
        >
          Reviews
        </h2>
        <span className="font-mono text-sm text-muted-foreground">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </span>
      </div>

      {isAuthenticated && !myReview ? (
        <Card className="rounded-lg border-border shadow-none">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium leading-none">
                  Your rating
                </span>
                <StarPicker
                  name="review-rating"
                  value={rating}
                  onChange={setRating}
                  disabled={addReview.isPending}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="review-text">Your review</Label>
                <Textarea
                  id="review-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Share what it was like working with this provider."
                  rows={4}
                  maxLength={1000}
                  disabled={addReview.isPending}
                  data-ocid="review.textarea"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  {rating < 1 || text.trim().length === 0
                    ? "Add a star rating and a few words to post."
                    : "Ready to post."}
                </p>
                <Button
                  type="submit"
                  disabled={
                    addReview.isPending ||
                    rating < 1 ||
                    text.trim().length === 0
                  }
                  data-ocid="review.submit_button"
                >
                  {addReview.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />
                  ) : null}
                  {addReview.isPending ? "Posting…" : "Post review"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {isAuthenticated && myReview && editingId === myReview.id ? (
        <Card className="rounded-lg border-border shadow-none">
          <CardContent className="p-5">
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium leading-none">
                  Your rating
                </span>
                <StarPicker
                  name="review-edit-rating"
                  value={editRating}
                  onChange={setEditRating}
                  disabled={updateReview.isPending}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="review-edit-text">Your review</Label>
                <Textarea
                  id="review-edit-text"
                  value={editText}
                  onChange={(event) => setEditText(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  disabled={updateReview.isPending}
                  data-ocid="review.edit_textarea"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingId(null)}
                  disabled={updateReview.isPending}
                  data-ocid="review.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    updateReview.isPending ||
                    editRating < 1 ||
                    editText.trim().length === 0
                  }
                  data-ocid="review.save_button"
                >
                  {updateReview.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />
                  ) : null}
                  {updateReview.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          data-ocid="review.loading_state"
        >
          <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
          Loading reviews…
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center"
          data-ocid="review.empty_state"
        >
          <p className="font-display text-lg font-semibold text-foreground">
            No reviews yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to share your experience with this provider.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id.toString()}
              review={review}
              isOwner={
                callerPrincipal !== undefined &&
                review.author.toString() === callerPrincipal
              }
              onEdit={() => startEdit(review)}
              onDelete={() => handleDelete(review.id)}
              isDeleting={
                deleteReview.isPending && deleteReview.variables === review.id
              }
            />
          ))}
        </div>
      )}

      {!isAuthenticated ? (
        <>
          <Separator />
          <p
            className="text-sm text-muted-foreground"
            data-ocid="review.signin_hint"
          >
            Sign in to leave a rating and review for this provider.
          </p>
        </>
      ) : null}
    </section>
  );
}
