import { setIdentityForTest } from "@/__tests__/setup";
import { renderWithActor } from "@/__tests__/test-utils";
import type { ProviderView, Review } from "@/backend";
import { BookingStatus } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ProviderDetailPage from "./ProviderDetailPage";

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useParams: () => ({ providerId: "0" }),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const OWNER = "aaaaa-aa";
const CUSTOMER = "bbbbb-bb";

function principal(value: string) {
  return { toString: () => value } as unknown as ProviderView["owner"];
}

/** A minimal identity whose principal reports as non-anonymous. */
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

const REVIEWS: Review[] = [
  {
    id: 0n,
    providerId: 0n,
    author: principal(OWNER),
    rating: 5n,
    text: "Alice explained calculus clearly.",
    createdAt: 0n,
  },
  {
    id: 1n,
    providerId: 0n,
    author: principal(OWNER),
    rating: 4n,
    text: "Very knowledgeable.",
    createdAt: 0n,
  },
];

function makeActor(overrides: Record<string, unknown> = {}) {
  return {
    getProvider: vi.fn(async () => ({ ...PROVIDER })),
    listReviewsForProvider: vi.fn(async () =>
      REVIEWS.map((review) => ({ ...review })),
    ),
    addReview: vi.fn(async (input: { rating: bigint; text: string }) => ({
      id: 2n,
      providerId: 0n,
      author: principal(CUSTOMER),
      rating: input.rating,
      text: input.text,
      createdAt: 0n,
    })),
    createBooking: vi.fn(async () => ({
      id: 0n,
      providerId: 0n,
      customer: principal(CUSTOMER),
      requestedDate: "2030-01-01",
      requestedTime: "10:00",
      message: "Please help",
      status: BookingStatus.pending,
      createdAt: 0n,
    })),
    ...overrides,
  };
}

describe("ProviderDetailPage", () => {
  it("shows the full profile and its reviews with an average rating", async () => {
    setIdentityForTest();
    const actor = makeActor();
    renderWithActor(<ProviderDetailPage />, actor);

    expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("$45/hour")).toBeInTheDocument();
    expect(screen.getByText("Downtown")).toBeInTheDocument();
    expect(
      screen.getByText("Experienced math and science tutor."),
    ).toBeInTheDocument();
    // Average rating is surfaced on the profile.
    expect(screen.getByLabelText("Rated 4.5 out of 5")).toBeInTheDocument();
    expect(
      screen.getByText("Alice explained calculus clearly."),
    ).toBeInTheDocument();
    expect(screen.getByText("Very knowledgeable.")).toBeInTheDocument();
  });

  it("lets a signed-in customer post a star rating and written review", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity(CUSTOMER) });
    const actor = makeActor();
    renderWithActor(<ProviderDetailPage />, actor);

    await screen.findByText("Alice Johnson");

    await user.click(screen.getByLabelText("5 stars"));
    await user.type(
      screen.getByLabelText("Your review"),
      "Great tutor, highly recommend.",
    );
    await user.click(screen.getByRole("button", { name: "Post review" }));

    await waitFor(() => {
      expect(actor.addReview).toHaveBeenCalledWith({
        providerId: 0n,
        rating: 5n,
        text: "Great tutor, highly recommend.",
      });
    });
  });

  it("lets a signed-in customer request a booking with date, time and message", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity(CUSTOMER) });
    const actor = makeActor();
    renderWithActor(<ProviderDetailPage />, actor);

    await screen.findByText("Alice Johnson");

    await user.type(screen.getByLabelText("Preferred date"), "2030-01-01");
    await user.type(screen.getByLabelText("Preferred time"), "10:00");
    await user.type(screen.getByLabelText("Message"), "Please help");
    await user.click(screen.getByRole("button", { name: "Send request" }));

    await waitFor(() => {
      expect(actor.createBooking).toHaveBeenCalledWith({
        providerId: 0n,
        requestedDate: "2030-01-01",
        requestedTime: "10:00",
        message: "Please help",
      });
    });
    expect(await screen.findByText("Request sent")).toBeInTheDocument();
  });

  it("shows the sign-in hint to anonymous visitors", async () => {
    setIdentityForTest();
    const actor = makeActor();
    renderWithActor(<ProviderDetailPage />, actor);

    await screen.findByText("Alice Johnson");
    expect(
      screen.getByText(
        "Sign in to leave a rating and review for this provider.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Sign in to send Alice Johnson a booking request/),
    ).toBeInTheDocument();
  });
});
