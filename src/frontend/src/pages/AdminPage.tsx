import type { ProviderView } from "@/backend";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { ProviderFormDialog } from "@/components/admin/ProviderFormDialog";
import { ReviewModeration } from "@/components/admin/ReviewModeration";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCategories,
  useDeleteProvider,
  useIsAdmin,
  useProviders,
} from "@/hooks/useQueries";
import { formatHourlyRate, formatRating } from "@/lib/format";
import { Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function AdminGateMessage() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6"
      data-ocid="admin.page"
    >
      <div
        className="mx-auto max-w-lg rounded-xl border border-border bg-card p-10 text-center shadow-subtle"
        data-ocid="admin.denied_state"
      >
        <ShieldAlert className="mx-auto h-10 w-10 text-accent" />
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">
          Administrator access required
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You are signed in, but this management panel is limited to
          administrators. Ask an existing admin to grant your account access.
        </p>
      </div>
    </div>
  );
}

function ProvidersPanel() {
  const providersQuery = useProviders({});
  const categoriesQuery = useCategories();
  const deleteProvider = useDeleteProvider();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProviderView | undefined>(undefined);

  const providers = providersQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const categoryName = (id: bigint) =>
    categories.find((category) => category.id === id)?.name ?? "Uncategorized";

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (provider: ProviderView) => {
    setEditing(provider);
    setDialogOpen(true);
  };

  const handleDelete = (provider: ProviderView) => {
    deleteProvider.mutate(provider.id, {
      onSuccess: () => toast.success("Provider removed"),
      onError: () =>
        toast.error("Could not remove provider. Please try again."),
    });
  };

  return (
    <div className="grid gap-6" data-ocid="admin.providers.panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {providers.length} provider{providers.length === 1 ? "" : "s"} in the
          directory
        </p>
        <Button
          type="button"
          onClick={openCreate}
          disabled={categories.length === 0}
          data-ocid="admin.providers.add_button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add provider
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add a service category before creating providers.
        </p>
      ) : null}

      {providersQuery.isLoading ? (
        <div className="grid gap-3" data-ocid="admin.providers.loading_state">
          {Array.from({ length: 4 }, (_, i) => `provider-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-14 w-full rounded-lg" />
            ),
          )}
        </div>
      ) : providersQuery.isError ? (
        <p
          className="text-sm text-destructive"
          data-ocid="admin.providers.error_state"
        >
          Could not load providers. Please try again.
        </p>
      ) : providers.length === 0 ? (
        <div
          className="rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center"
          data-ocid="admin.providers.empty_state"
        >
          <p className="font-display text-lg font-semibold text-foreground">
            No providers yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the first provider to start building the directory.
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-xl border border-border bg-card shadow-subtle"
          data-ocid="admin.providers.table"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider, index) => (
                <TableRow
                  key={provider.id.toString()}
                  data-ocid={`admin.providers.row.${index + 1}`}
                >
                  <TableCell className="max-w-[16rem] truncate font-medium text-foreground">
                    {provider.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {categoryName(provider.categoryId)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {provider.location}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatHourlyRate(provider.hourlyRate)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatRating(provider.averageRating)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${provider.name}`}
                        onClick={() => openEdit(provider)}
                        data-ocid={`admin.providers.edit_button.${index + 1}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove ${provider.name}`}
                        onClick={() => handleDelete(provider)}
                        disabled={deleteProvider.isPending}
                        className="text-destructive hover:text-destructive"
                        data-ocid={`admin.providers.delete_button.${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProviderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        provider={editing}
      />
    </div>
  );
}

export default function AdminPage() {
  const isAdminQuery = useIsAdmin();

  if (isAdminQuery.isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6"
        data-ocid="admin.page"
      >
        <div className="grid gap-4" data-ocid="admin.loading_state">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-12 w-full max-w-md rounded-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isAdminQuery.data) {
    return <AdminGateMessage />;
  }

  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16"
      data-ocid="admin.page"
    >
      <header className="motion-safe:animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Management
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">
          Admin panel
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Curate the marketplace: manage providers, organize service categories,
          and moderate reviews.
        </p>
      </header>

      <Tabs defaultValue="providers" className="mt-8">
        <TabsList data-ocid="admin.tabs">
          <TabsTrigger value="providers" data-ocid="admin.providers.tab">
            Providers
          </TabsTrigger>
          <TabsTrigger value="categories" data-ocid="admin.categories.tab">
            Categories
          </TabsTrigger>
          <TabsTrigger value="reviews" data-ocid="admin.reviews.tab">
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="mt-6">
          <ProvidersPanel />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesPanel />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <ReviewsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategoriesPanel() {
  const categoriesQuery = useCategories();

  if (categoriesQuery.isLoading) {
    return (
      <div className="grid gap-3" data-ocid="admin.categories.loading_state">
        {Array.from({ length: 3 }, (_, i) => `category-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-16 w-full rounded-xl" />
          ),
        )}
      </div>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <p
        className="text-sm text-destructive"
        data-ocid="admin.categories.error_state"
      >
        Could not load categories. Please try again.
      </p>
    );
  }

  return <CategoryManager categories={categoriesQuery.data ?? []} />;
}

function ReviewsPanel() {
  const providersQuery = useProviders({});

  if (providersQuery.isLoading) {
    return (
      <div className="grid gap-3" data-ocid="admin.reviews.loading_state">
        {Array.from({ length: 3 }, (_, i) => `review-panel-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-16 w-full rounded-xl" />
          ),
        )}
      </div>
    );
  }

  if (providersQuery.isError) {
    return (
      <p
        className="text-sm text-destructive"
        data-ocid="admin.reviews.error_state"
      >
        Could not load providers. Please try again.
      </p>
    );
  }

  return <ReviewModeration providers={providersQuery.data ?? []} />;
}
