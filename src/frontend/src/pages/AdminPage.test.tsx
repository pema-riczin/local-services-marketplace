import { setIdentityForTest } from "@/__tests__/setup";
import { renderWithActor } from "@/__tests__/test-utils";
import type { Category, ProviderView } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AdminPage from "./AdminPage";

const OWNER = "aaaaa-aa";

function principal(value: string) {
  return { toString: () => value } as unknown as ProviderView["owner"];
}

function signedInIdentity(value: string) {
  return {
    getPrincipal: () => ({ toString: () => value, isAnonymous: () => false }),
  } as never;
}

const CATEGORIES: Category[] = [
  { id: 0n, name: "Tutoring" },
  { id: 1n, name: "Cleaning" },
];

const PROVIDERS: ProviderView[] = [
  {
    id: 0n,
    categoryId: 0n,
    owner: principal(OWNER),
    name: "Alice Johnson",
    createdAt: 0n,
    hourlyRate: 45n,
    description: "Experienced math and science tutor.",
    averageRating: 4.5,
    reviewCount: 2n,
    location: "Downtown",
  },
];

function makeActor(overrides: Record<string, unknown> = {}) {
  return {
    isCallerAdmin: vi.fn(async () => true),
    listProviders: vi.fn(async () => PROVIDERS.map((p) => ({ ...p }))),
    listCategories: vi.fn(async () => CATEGORIES.map((c) => ({ ...c }))),
    createProvider: vi.fn(async () => ({ ...PROVIDERS[0] })),
    updateProvider: vi.fn(async () => ({ ...PROVIDERS[0] })),
    deleteProvider: vi.fn(async () => true),
    createCategory: vi.fn(async (name: string) => ({ id: 2n, name })),
    updateCategory: vi.fn(async (id: bigint, name: string) => ({ id, name })),
    deleteCategory: vi.fn(async () => true),
    listReviewsForProvider: vi.fn(async () => []),
    deleteReview: vi.fn(async () => true),
    ...overrides,
  };
}

describe("AdminPage", () => {
  it("denies the management panel to a signed-in non-admin", async () => {
    setIdentityForTest({ identity: signedInIdentity("ccccc-cc") });
    const actor = makeActor({ isCallerAdmin: vi.fn(async () => false) });
    renderWithActor(<AdminPage />, actor);

    expect(
      await screen.findByText("Administrator access required"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Admin panel")).not.toBeInTheDocument();
  });

  it("shows the management panel to an admin", async () => {
    setIdentityForTest({ identity: signedInIdentity(OWNER) });
    const actor = makeActor();
    renderWithActor(<AdminPage />, actor);

    expect(await screen.findByText("Admin panel")).toBeInTheDocument();
    expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
  });

  it("lets an admin add a provider through the dialog", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity(OWNER) });
    const actor = makeActor();
    renderWithActor(<AdminPage />, actor);

    await screen.findByText("Alice Johnson");
    await user.click(screen.getByRole("button", { name: /Add provider/ }));

    await user.type(
      await screen.findByLabelText("Name"),
      "Bright Nest Cleaning",
    );
    await user.click(screen.getByLabelText("Category"));
    await user.click(await screen.findByRole("option", { name: "Cleaning" }));
    await user.type(screen.getByLabelText("Hourly rate (USD)"), "30");
    await user.type(screen.getByLabelText("Location"), "Riverside");
    await user.type(
      screen.getByLabelText("Description"),
      "Reliable home and office cleaning.",
    );
    await user.click(screen.getByRole("button", { name: "Add provider" }));

    await waitFor(() => {
      expect(actor.createProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Bright Nest Cleaning",
          categoryId: 1n,
          hourlyRate: 30n,
          location: "Riverside",
        }),
      );
    });
  });

  it("lets an admin remove a provider", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity(OWNER) });
    const actor = makeActor();
    renderWithActor(<AdminPage />, actor);

    await screen.findByText("Alice Johnson");
    await user.click(
      screen.getByRole("button", { name: "Remove Alice Johnson" }),
    );

    await waitFor(() => {
      expect(actor.deleteProvider).toHaveBeenCalledWith(0n);
    });
  });

  it("lets an admin add and remove a category", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity(OWNER) });
    const actor = makeActor();
    renderWithActor(<AdminPage />, actor);

    await screen.findByText("Alice Johnson");
    await user.click(screen.getByRole("tab", { name: "Categories" }));

    await user.type(await screen.findByLabelText("New category"), "Gardening");
    await user.click(screen.getByRole("button", { name: /Add category/ }));

    await waitFor(() => {
      expect(actor.createCategory).toHaveBeenCalledWith("Gardening");
    });

    await user.click(screen.getByRole("button", { name: "Remove Tutoring" }));
    await waitFor(() => {
      expect(actor.deleteCategory).toHaveBeenCalledWith(0n);
    });
  });
});
