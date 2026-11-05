import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";
import { registerCaller } from "./test-utils";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

const alice = createIdentity("alice");
const bob = createIdentity("bob");

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("seeds example providers and reviews on first use", async () => {
  const providers = await actor.listProviders({
    categoryId: [],
    search: [],
    location: [],
  });
  expect(providers.length).toBeGreaterThan(0);
  expect(providers.map((p) => p.name)).toContain("Alice Johnson");

  const categories = await actor.listCategories();
  expect(categories.map((c) => c.name)).toContain("Tutoring");

  const aliceProvider = providers.find((p) => p.name === "Alice Johnson");
  expect(aliceProvider).toBeDefined();
  const reviews = await actor.listReviewsForProvider(aliceProvider!.id);
  expect(reviews.length).toBeGreaterThan(0);
  expect(aliceProvider!.averageRating).toBeGreaterThan(0);
});

it("filters providers by search, category and location", async () => {
  const byName = await actor.listProviders({
    categoryId: [],
    search: ["Carla"],
    location: [],
  });
  expect(byName.map((p) => p.name)).toEqual(["Carla Mendes"]);

  const categories = await actor.listCategories();
  const cleaning = categories.find((c) => c.name === "Cleaning");
  expect(cleaning).toBeDefined();
  const byCategory = await actor.listProviders({
    categoryId: [cleaning!.id],
    search: [],
    location: [],
  });
  expect(byCategory.length).toBeGreaterThan(0);
  expect(byCategory.every((p) => p.categoryId === cleaning!.id)).toBe(true);

  const byLocation = await actor.listProviders({
    categoryId: [],
    search: [],
    location: ["Riverside"],
  });
  expect(byLocation.length).toBeGreaterThan(0);
  expect(
    byLocation.every((p) => p.location.toLowerCase().includes("riverside")),
  ).toBe(true);
});

it("round-trips a provider created by an admin", async () => {
  const admin = await registerCaller(
    pic!.createActor<_SERVICE>(idlFactory, canisterId),
    alice,
  );
  const categories = await admin.listCategories();
  const created = await admin.createProvider({
    name: "Test Provider",
    categoryId: categories[0].id,
    description: "A provider created in the lane.",
    hourlyRate: 99n,
    location: "Testville",
    photo: [],
  });
  expect(created.name).toBe("Test Provider");

  const fetched = await admin.getProvider(created.id);
  expect(fetched).not.toBeNull();
  expect(fetched![0].name).toBe("Test Provider");

  const updated = await admin.updateProvider(created.id, {
    name: "Test Provider Renamed",
    categoryId: categories[0].id,
    description: "Updated in the lane.",
    hourlyRate: 100n,
    location: "Testville",
    photo: [],
  });
  expect(updated![0].name).toBe("Test Provider Renamed");

  await expect(admin.deleteProvider(created.id)).resolves.toBe(true);
  await expect(admin.getProvider(created.id)).resolves.toEqual([]);
});

it("lets a signed-in customer review a provider and rejects a duplicate", async () => {
  const providers = await actor.listProviders({
    categoryId: [],
    search: [],
    location: [],
  });
  const target = providers[0];

  const customer = await registerCaller(
    pic!.createActor<_SERVICE>(idlFactory, canisterId),
    bob,
  );
  const review = await customer.addReview({
    providerId: target.id,
    rating: 5n,
    text: "Excellent service.",
  });
  expect(review.rating).toBe(5n);

  const reviews = await customer.listReviewsForProvider(target.id);
  expect(reviews.some((r) => r.id === review.id)).toBe(true);

  await expect(
    customer.addReview({
      providerId: target.id,
      rating: 4n,
      text: "Second review.",
    }),
  ).rejects.toThrow();
});

it("round-trips a booking and lets the provider accept it", async () => {
  const admin = await registerCaller(
    pic!.createActor<_SERVICE>(idlFactory, canisterId),
    alice,
  );
  const categories = await admin.listCategories();
  const provider = await admin.createProvider({
    name: "Booking Target",
    categoryId: categories[0].id,
    description: "Accepts bookings.",
    hourlyRate: 50n,
    location: "Booktown",
    photo: [],
  });

  const customer = await registerCaller(
    pic!.createActor<_SERVICE>(idlFactory, canisterId),
    bob,
  );
  const booking = await customer.createBooking({
    providerId: provider.id,
    requestedDate: "2030-01-01",
    requestedTime: "10:00",
    message: "Please help with my request.",
  });
  expect(booking.status).toEqual({ pending: null });

  const mine = await customer.listMyBookings();
  expect(mine.some((b) => b.id === booking.id)).toBe(true);

  const accepted = await admin.acceptBooking(booking.id);
  expect(accepted![0].status).toEqual({ accepted: null });

  const after = await customer.listMyBookings();
  expect(after.find((b) => b.id === booking.id)?.status).toEqual({
    accepted: null,
  });
});

it("rejects an anonymous caller from writing", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(
    guest.createBooking({
      providerId: 0n,
      requestedDate: "2030-01-01",
      requestedTime: "10:00",
      message: "not allowed",
    }),
  ).rejects.toThrow();
});
