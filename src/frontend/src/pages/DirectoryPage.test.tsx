import { renderWithActor } from "@/__tests__/test-utils";
import type { Category, ProviderFilter, ProviderView } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DirectoryPage from "./DirectoryPage";

// The directory renders provider cards that link to the detail route. Replace
// the router Link with a plain anchor so the page can render without a router.
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  Link: ({
    children,
    ...rest
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <a {...rest}>{children}</a>,
}));

const OWNER = "aaaaa-aa";

function makeProvider(overrides: Partial<ProviderView> = {}): ProviderView {
  return {
    id: 0n,
    categoryId: 0n,
    owner: { toString: () => OWNER } as unknown as ProviderView["owner"],
    name: "Alice Johnson",
    createdAt: 0n,
    hourlyRate: 45n,
    description: "Experienced math and science tutor.",
    averageRating: 4.5,
    reviewCount: 2n,
    location: "Downtown",
    ...overrides,
  };
}

const CATEGORIES: Category[] = [
  { id: 0n, name: "Tutoring" },
  { id: 1n, name: "Cleaning" },
];

const PROVIDERS: ProviderView[] = [
  makeProvider({
    id: 0n,
    categoryId: 0n,
    name: "Alice Johnson",
    description: "Experienced math and science tutor.",
    hourlyRate: 45n,
    location: "Downtown",
    averageRating: 4.5,
    reviewCount: 2n,
  }),
  makeProvider({
    id: 1n,
    categoryId: 1n,
    name: "Carla Mendes",
    description: "Reliable home and office cleaning.",
    hourlyRate: 30n,
    location: "Riverside",
    averageRating: 4,
    reviewCount: 1n,
  }),
];

/** Apply the same filter semantics the backend uses, so the mock is realistic. */
function applyFilter(filter: ProviderFilter): ProviderView[] {
  return PROVIDERS.filter((provider) => {
    if (
      filter.categoryId !== undefined &&
      provider.categoryId !== filter.categoryId
    ) {
      return false;
    }
    if (
      filter.location !== undefined &&
      filter.location.length > 0 &&
      !provider.location.toLowerCase().includes(filter.location.toLowerCase())
    ) {
      return false;
    }
    if (filter.search !== undefined && filter.search.length > 0) {
      const term = filter.search.toLowerCase();
      if (
        !provider.name.toLowerCase().includes(term) &&
        !provider.description.toLowerCase().includes(term)
      ) {
        return false;
      }
    }
    return true;
  });
}

function makeActor() {
  return {
    listProviders: vi.fn(async (filter: ProviderFilter) =>
      applyFilter(filter).map((provider) => ({ ...provider })),
    ),
    listCategories: vi.fn(async () =>
      CATEGORIES.map((category) => ({ ...category })),
    ),
  };
}

describe("DirectoryPage", () => {
  beforeEach(() => {
    // The page syncs filters into the URL; reset it so state cannot leak
    // between tests.
    window.history.replaceState(null, "", "/");
  });

  it("renders seeded providers with name, category, rate, location and photo", async () => {
    const actor = makeActor();
    renderWithActor(<DirectoryPage />, actor);

    expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Carla Mendes")).toBeInTheDocument();
    expect(screen.getByText("Tutoring")).toBeInTheDocument();
    expect(screen.getByText("Cleaning")).toBeInTheDocument();
    expect(screen.getByText("$45/hour")).toBeInTheDocument();
    expect(screen.getByText("$30/hour")).toBeInTheDocument();
    expect(screen.getByText("Downtown")).toBeInTheDocument();
    expect(screen.getByText("Riverside")).toBeInTheDocument();
    // Photo placeholder initial is rendered when a provider has no photo.
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("narrows the directory when searching by a provider name", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderWithActor(<DirectoryPage />, actor);

    await screen.findByText("Alice Johnson");
    await user.type(screen.getByLabelText("Search"), "Carla");

    await waitFor(() => {
      expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Carla Mendes")).toBeInTheDocument();
    expect(actor.listProviders).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: "Carla" }),
    );
  });

  it("narrows the directory when filtering by location", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderWithActor(<DirectoryPage />, actor);

    await screen.findByText("Alice Johnson");

    await user.type(screen.getByLabelText("Location"), "Riverside");
    await waitFor(() => {
      expect(actor.listProviders).toHaveBeenLastCalledWith(
        expect.objectContaining({ location: "Riverside" }),
      );
    });
    expect(screen.getByText("Carla Mendes")).toBeInTheDocument();
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
  });

  it("narrows the directory when filtering by category", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderWithActor(<DirectoryPage />, actor);

    await screen.findByText("Alice Johnson");

    await user.click(screen.getByLabelText("Category"));
    await user.click(await screen.findByRole("option", { name: "Cleaning" }));

    await waitFor(() => {
      expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Carla Mendes")).toBeInTheDocument();
    expect(actor.listProviders).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoryId: 1n }),
    );
  });

  it("shows an empty state when no provider matches the filters", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderWithActor(<DirectoryPage />, actor);

    await screen.findByText("Alice Johnson");
    await user.type(screen.getByLabelText("Search"), "zzz-no-match");

    expect(
      await screen.findByText("No providers match your search"),
    ).toBeInTheDocument();
  });
});
