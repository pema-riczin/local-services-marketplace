import { setIdentityForTest } from "@/__tests__/setup";
import { renderWithActor } from "@/__tests__/test-utils";
import type { BookingRequest, ProviderView } from "@/backend";
import { BookingStatus } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BookingsPage from "./BookingsPage";

const CUSTOMER = "bbbbb-bb";
const OWNER = "aaaaa-aa";

function principal(value: string) {
  return { toString: () => value } as unknown as ProviderView["owner"];
}

function signedInIdentity(value: string) {
  return {
    getPrincipal: () => ({ toString: () => value, isAnonymous: () => false }),
  } as never;
}

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

function makeBooking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    id: 0n,
    providerId: 0n,
    customer: principal(CUSTOMER),
    requestedDate: "2030-01-01",
    requestedTime: "10:00",
    message: "Please help with my request.",
    status: BookingStatus.pending,
    createdAt: 0n,
    ...overrides,
  };
}

function makeActor(overrides: Record<string, unknown> = {}) {
  return {
    listProviders: vi.fn(async () => [{ ...PROVIDER }]),
    listMyBookings: vi.fn(async () => [makeBooking()]),
    listProviderBookings: vi.fn(async () => [makeBooking()]),
    isCallerAdmin: vi.fn(async () => false),
    getMyProvider: vi.fn(async () => ({ ...PROVIDER })),
    acceptBooking: vi.fn(async (id: bigint) =>
      makeBooking({ id, status: BookingStatus.accepted }),
    ),
    declineBooking: vi.fn(async (id: bigint) =>
      makeBooking({ id, status: BookingStatus.declined }),
    ),
    ...overrides,
  };
}

describe("BookingsPage", () => {
  it("shows the customer's own requests with their status", async () => {
    setIdentityForTest({ identity: signedInIdentity(CUSTOMER) });
    const actor = makeActor();
    renderWithActor(<BookingsPage />, actor);

    expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
    expect(
      screen.getByText("Please help with my request."),
    ).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("lets the provider accept an incoming request and shows the updated status", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity(OWNER) });
    const actor = makeActor();
    renderWithActor(<BookingsPage />, actor);

    await screen.findByText("Alice Johnson");
    await user.click(screen.getByRole("tab", { name: /Incoming requests/ }));

    await user.click(screen.getByLabelText("Provider profile"));
    await user.click(
      await screen.findByRole("option", { name: "Alice Johnson" }),
    );

    await user.click(await screen.findByRole("button", { name: "Accept" }));

    await waitFor(() => {
      expect(actor.acceptBooking).toHaveBeenCalledWith(0n);
    });
  });

  it("lets the provider decline an incoming request", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity(OWNER) });
    const actor = makeActor();
    renderWithActor(<BookingsPage />, actor);

    await screen.findByText("Alice Johnson");
    await user.click(screen.getByRole("tab", { name: /Incoming requests/ }));

    await user.click(screen.getByLabelText("Provider profile"));
    await user.click(
      await screen.findByRole("option", { name: "Alice Johnson" }),
    );

    await user.click(await screen.findByRole("button", { name: "Decline" }));

    await waitFor(() => {
      expect(actor.declineBooking).toHaveBeenCalledWith(0n);
    });
  });

  it("shows an empty state when the customer has no requests", async () => {
    setIdentityForTest({ identity: signedInIdentity(CUSTOMER) });
    const actor = makeActor({ listMyBookings: vi.fn(async () => []) });
    renderWithActor(<BookingsPage />, actor);

    expect(await screen.findByText("No requests yet")).toBeInTheDocument();
  });
});
