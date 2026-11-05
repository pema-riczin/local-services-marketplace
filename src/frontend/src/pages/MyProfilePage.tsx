import type { ProviderInput } from "@/backend";
import { ProviderForm } from "@/components/ProviderForm";
import { StarRating } from "@/components/StarRating";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategories,
  useCreateMyProvider,
  useDeleteMyProvider,
  useMyProvider,
  useUpdateMyProvider,
} from "@/hooks/useQueries";
import { formatHourlyRate } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, ImageOff, MapPin, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

function ProfileSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6"
      data-ocid="my_profile.loading_state"
    >
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-5 w-96" />
      <Skeleton className="mt-8 h-96 w-full rounded-xl" />
    </div>
  );
}

export default function MyProfilePage() {
  const providerQuery = useMyProvider();
  const categoriesQuery = useCategories();
  const createProvider = useCreateMyProvider();
  const updateProvider = useUpdateMyProvider();
  const deleteProvider = useDeleteMyProvider();

  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const provider = providerQuery.data ?? null;
  const categories = categoriesQuery.data ?? [];

  if (providerQuery.isLoading) {
    return <ProfileSkeleton />;
  }

  if (providerQuery.isError) {
    return (
      <div
        className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6"
        data-ocid="my_profile.error_state"
      >
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
          <p className="font-display text-xl font-semibold text-foreground">
            We couldn't load your profile
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while fetching your provider profile.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => void providerQuery.refetch()}
            data-ocid="my_profile.retry_button"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const handleCreate = (input: ProviderInput) => {
    setActionError(null);
    createProvider.mutate(input, {
      onSuccess: () => {
        setNotice("Your provider profile is live in the directory.");
      },
      onError: () =>
        setActionError("Could not create your profile. Please try again."),
    });
  };

  const handleUpdate = (input: ProviderInput) => {
    setActionError(null);
    updateProvider.mutate(input, {
      onSuccess: () => {
        setEditing(false);
        setNotice("Your profile changes are saved.");
      },
      onError: () =>
        setActionError("Could not save your changes. Please try again."),
    });
  };

  const handleDelete = () => {
    setActionError(null);
    deleteProvider.mutate(undefined, {
      onSuccess: () => {
        setEditing(false);
        setNotice("Your provider profile has been removed.");
      },
      onError: () =>
        setActionError("Could not remove your profile. Please try again."),
    });
  };

  const categoryName =
    provider !== null
      ? (categories.find((c) => c.id === provider.categoryId)?.name ??
        "Uncategorised")
      : "";

  return (
    <div
      className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6"
      data-ocid="my_profile.page"
    >
      <header className="mb-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
          My provider profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {provider
            ? "Keep your public listing accurate so customers know what you offer and how to reach you."
            : "Create a profile to appear in the Homestead directory and start receiving booking requests."}
        </p>
      </header>

      {notice ? (
        <div
          className="mb-6 flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3"
          data-ocid="my_profile.success_state"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-foreground">{notice}</p>
        </div>
      ) : null}

      {actionError ? (
        <div
          className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
          data-ocid="my_profile.action_error_state"
        >
          <p className="text-sm text-destructive">{actionError}</p>
        </div>
      ) : null}

      {provider === null ? (
        <Card className="border-border shadow-subtle">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Create your profile
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Add your details below. You can edit or remove your profile at any
              time.
            </p>
            <ProviderForm
              categories={categories}
              isPending={createProvider.isPending}
              onSubmit={handleCreate}
              submitLabel="Publish profile"
            />
          </CardContent>
        </Card>
      ) : editing ? (
        <Card className="border-border shadow-subtle">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Edit your profile
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Update your details and save to refresh your public listing.
            </p>
            <ProviderForm
              categories={categories}
              provider={provider}
              isPending={updateProvider.isPending}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border shadow-subtle">
          <div className="relative">
            {provider.photo ? (
              <img
                src={provider.photo.getDirectURL()}
                alt={`${provider.name}, ${provider.location}`}
                className="h-56 w-full object-cover sm:h-72"
                data-ocid="my_profile.photo"
              />
            ) : (
              <div
                className="flex h-56 w-full items-center justify-center bg-gradient-subtle sm:h-72"
                data-ocid="my_profile.photo_placeholder"
              >
                <ImageOff className="h-10 w-10 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2
                  className="font-display text-3xl font-semibold tracking-tight text-foreground"
                  data-ocid="my_profile.name"
                >
                  {provider.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {provider.location}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    {categoryName}
                  </span>
                  <StarRating
                    rating={provider.averageRating}
                    reviewCount={provider.reviewCount}
                    size="sm"
                  />
                </div>
              </div>
              <div className="text-right">
                <p
                  className="font-display text-2xl font-semibold text-primary"
                  data-ocid="my_profile.hourly_rate"
                >
                  {formatHourlyRate(provider.hourlyRate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Your hourly rate
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="font-display text-lg font-semibold text-foreground">
              About
            </h3>
            <p
              className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground"
              data-ocid="my_profile.description"
            >
              {provider.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => {
                  setNotice(null);
                  setEditing(true);
                }}
                data-ocid="my_profile.edit_button"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit profile
              </Button>
              <Button asChild variant="outline">
                <Link
                  to="/providers/$providerId"
                  params={{ providerId: provider.id.toString() }}
                  data-ocid="my_profile.view_public_link"
                >
                  View public listing
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    data-ocid="my_profile.delete_button"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove profile
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="my_profile.delete_dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-2xl">
                      Remove your provider profile?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes your listing from the directory. Customers
                      will no longer find you, and this cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="my_profile.delete_cancel_button">
                      Keep profile
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-ocid="my_profile.delete_confirm_button"
                    >
                      Remove profile
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
