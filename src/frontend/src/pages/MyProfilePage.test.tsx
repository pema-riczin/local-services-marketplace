import { setIdentityForTest } from "@/__tests__/setup";
import { renderWithActor } from "@/__tests__/test-utils";
import type { Category, ProviderView } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MyProfilePage from "./MyProfilePage";

// The profile view renders a router Link; replace it with a plain anchor so the
// page can render without a RouterProvider.
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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

const PROVIDER: ProviderView = {
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
};

function makeActor(overrides: Record<string, unknown> = {}) {
  return {
    getMyProvider: vi.fn(async () => null as ProviderView | null),
    listCategories: vi.fn(async () => CATEGORIES.map((c) => ({ ...c }))),
    createMyProvider: vi.fn(async () => ({ ...PROVIDER })),
    updateMyProvider: vi.fn(async () => ({ ...PROVIDER })),
    deleteMyProvider: vi.fn(async () => true),
    ...overrides,
  };
}

describe("MyProfilePage", () => {
  it("lets a signed-in provider create their profile", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity(OWNER) });
    const actor = makeActor();
    renderWithActor(<MyProfilePage />, actor);

    await screen.findByText("Create your profile");

    await user.type(screen.getByLabelText("Name"), "Alice Johnson");
    await user.click(screen.getByLabelText("Service category"));
    await user.click(await screen.findByRole("option", { name: "Tutoring" }));
    await user.type(screen.getByLabelText("Hourly rate (USD)"), "45");
    await user.type(screen.getByLabelText("Location"), "Downtown");
    await user.type(
      screen.getByLabelText("Description"),
      "Experienced math and science tutor.",
    );
    await user.click(screen.getByRole("button", { name: "Publish profile" }));

    await waitFor(() => {
      expect(actor.createMyProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Alice Johnson",
          categoryId: 0n,
          hourlyRate: 45n,
          location: "Downtown",
        }),
      );
    });
  });

  it("shows the existing profile and lets the owner edit it", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity(OWNER) });
    const actor = makeActor({
      getMyProvider: vi.fn(async () => ({ ...PROVIDER })),
    });
    renderWithActor(<MyProfilePage />, actor);

    expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("$45/hour")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Edit profile/ }));
    const nameInput = await screen.findByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Alice J. Johnson");
    await user.click(screen.getByLabelText("Service category"));
    await user.click(await screen.findByRole("option", { name: "Tutoring" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(actor.updateMyProvider).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Alice J. Johnson" }),
      );
    });
  });

  it("lets the owner remove their profile after confirming", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity(OWNER) });
    const actor = makeActor({
      getMyProvider: vi.fn(async () => ({ ...PROVIDER })),
    });
    renderWithActor(<MyProfilePage />, actor);

    await screen.findByText("Alice Johnson");
    await user.click(screen.getByRole("button", { name: /Remove profile/ }));
    await user.click(
      await screen.findByRole("button", { name: "Remove profile" }),
    );

    await waitFor(() => {
      expect(actor.deleteMyProvider).toHaveBeenCalled();
    });
  });
});
