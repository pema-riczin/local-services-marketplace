import type { ProviderFilter } from "@/backend";
import { ProviderCard } from "@/components/ProviderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProviders } from "@/hooks/useQueries";
import type { ProviderCardData } from "@/types";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const ALL_CATEGORIES = "all";

/**
 * Build the backend filter while keeping it serializable for React Query.
 *
 * `ProviderFilter.categoryId` is a Motoko `Nat`, which arrives in the browser
 * as a `bigint`. React Query hashes query keys with `JSON.stringify`, which
 * throws on a `bigint`, so the filter carries a `toJSON` that emits a plain
 * string id. The actor still reads the real `bigint` from `categoryId`.
 */
function makeProviderFilter(filters: {
  search: string;
  categoryId?: bigint;
  location: string;
}): ProviderFilter {
  const filter: ProviderFilter = {};
  if (filters.search.trim()) filter.search = filters.search.trim();
  if (filters.categoryId !== undefined) filter.categoryId = filters.categoryId;
  if (filters.location.trim()) filter.location = filters.location.trim();
  return Object.assign(filter, {
    toJSON: () => ({
      search: filter.search,
      categoryId: filter.categoryId?.toString(),
      location: filter.location,
    }),
  });
}

/** Read the current directory filters from the browser URL. */
function readFiltersFromUrl(): {
  search: string;
  categoryId?: bigint;
  location: string;
} {
  if (typeof window === "undefined") {
    return { search: "", location: "" };
  }
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get("category");
  const categoryId =
    categoryParam && /^\d+$/.test(categoryParam)
      ? BigInt(categoryParam)
      : undefined;
  return {
    search: params.get("q") ?? "",
    categoryId,
    location: params.get("location") ?? "",
  };
}

/** Write the active filters back into the browser URL without a reload. */
function writeFiltersToUrl(filters: {
  search: string;
  categoryId?: bigint;
  location: string;
}): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.categoryId !== undefined) {
    params.set("category", filters.categoryId.toString());
  }
  if (filters.location.trim()) params.set("location", filters.location.trim());
  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", next);
}

export default function DirectoryPage() {
  const initial = useMemo(readFiltersFromUrl, []);
  const [search, setSearch] = useState(initial.search);
  const [categoryId, setCategoryId] = useState<bigint | undefined>(
    initial.categoryId,
  );
  const [location, setLocation] = useState(initial.location);

  const { data: categories } = useCategories();

  const filter = useMemo<ProviderFilter>(
    () => makeProviderFilter({ search, categoryId, location }),
    [search, categoryId, location],
  );

  const { data: providers, isLoading, isError, refetch } = useProviders(filter);

  // Keep the URL in sync with the active filters.
  useEffect(() => {
    writeFiltersToUrl({ search, categoryId, location });
  }, [search, categoryId, location]);

  // Restore filters when the user navigates with browser back/forward.
  useEffect(() => {
    function onPopState() {
      const restored = readFiltersFromUrl();
      setSearch(restored.search);
      setCategoryId(restored.categoryId);
      setLocation(restored.location);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories ?? []) {
      map.set(category.id.toString(), category.name);
    }
    return map;
  }, [categories]);

  const cards = useMemo<ProviderCardData[]>(() => {
    return (providers ?? []).map((provider) => ({
      provider,
      categoryName:
        categoryNameById.get(provider.categoryId.toString()) ?? "Uncategorized",
    }));
  }, [providers, categoryNameById]);

  const hasActiveFilters =
    search.trim() !== "" || categoryId !== undefined || location.trim() !== "";

  const clearFilters = useCallback(() => {
    setSearch("");
    setCategoryId(undefined);
    setLocation("");
  }, []);

  const resultLabel =
    cards.length === 1 ? "1 provider" : `${cards.length} providers`;

  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
      data-ocid="directory.page"
    >
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Local directory
        </p>
        <h1 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Find someone you can trust, nearby.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Browse vetted local providers for every home and personal need — from
          tutoring to repairs.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside
          className="lg:sticky lg:top-24 lg:self-start"
          aria-label="Filter providers"
          data-ocid="directory.filters_panel"
        >
          <div className="rounded-xl border border-border bg-card p-5 shadow-subtle">
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Refine results
              </h2>
            </div>

            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="directory-search">Search</Label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="directory-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Name or description"
                    className="pl-9"
                    data-ocid="directory.search_input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="directory-category">Category</Label>
                <Select
                  value={categoryId?.toString() ?? ALL_CATEGORIES}
                  onValueChange={(value) =>
                    setCategoryId(
                      value === ALL_CATEGORIES ? undefined : BigInt(value),
                    )
                  }
                >
                  <SelectTrigger
                    id="directory-category"
                    className="w-full"
                    data-ocid="directory.category_select"
                  >
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CATEGORIES}>
                      All categories
                    </SelectItem>
                    {(categories ?? []).map((category) => (
                      <SelectItem
                        key={category.id.toString()}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="directory-location">Location</Label>
                <Input
                  id="directory-location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City or area"
                  data-ocid="directory.location_input"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                data-ocid="directory.clear_button"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Clear filters
              </Button>
            </div>
          </div>
        </aside>

        <section aria-label="Providers" data-ocid="directory.results_section">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Providers
            </h2>
            {!isLoading && !isError ? (
              <p
                className="font-mono text-xs text-muted-foreground"
                data-ocid="directory.result_count"
              >
                {resultLabel}
              </p>
            ) : null}
          </div>

          {isLoading ? (
            <div
              className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              data-ocid="directory.loading_state"
            >
              {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map(
                (id) => (
                  <div
                    key={id}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-subtle"
                  >
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="space-y-3 p-4">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : isError ? (
            <div
              className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
              data-ocid="directory.error_state"
            >
              <h3 className="font-display text-lg font-semibold text-foreground">
                We couldn't load the directory
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Something went wrong while fetching providers. Please try again.
              </p>
              <Button
                type="button"
                className="mt-5"
                onClick={() => void refetch()}
                data-ocid="directory.retry_button"
              >
                Try again
              </Button>
            </div>
          ) : cards.length === 0 ? (
            <div
              className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center"
              data-ocid="directory.empty_state"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Search
                  className="h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                No providers match your search
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Try a different name, category, or location — or clear your
                filters to see everyone.
              </p>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5"
                  onClick={clearFilters}
                  data-ocid="directory.empty_clear_button"
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((card, index) => (
                <ProviderCard
                  key={card.provider.id.toString()}
                  data={card}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
