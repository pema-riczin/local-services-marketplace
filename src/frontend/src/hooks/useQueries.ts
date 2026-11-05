import { createActor } from "@/backend";
import type {
  BookingId,
  BookingInput,
  CategoryId,
  ProviderFilter,
  ProviderId,
  ProviderInput,
  ReviewId,
  ReviewInput,
  UserRole,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const queryKeys = {
  providers: (filter: ProviderFilter) => ["providers", filter] as const,
  provider: (id: ProviderId) => ["provider", id.toString()] as const,
  categories: ["categories"] as const,
  reviews: (providerId: ProviderId) =>
    ["reviews", providerId.toString()] as const,
  myBookings: ["bookings", "mine"] as const,
  providerBookings: (providerId: ProviderId) =>
    ["bookings", "provider", providerId.toString()] as const,
  callerRole: ["callerRole"] as const,
  isAdmin: ["isAdmin"] as const,
  myProvider: ["provider", "mine"] as const,
};

/* ------------------------------------------------------------------ */
/* Providers                                                           */
/* ------------------------------------------------------------------ */

export function useProviders(filter: ProviderFilter) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.providers(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProviders(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProvider(id: ProviderId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.provider(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getProvider(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useCreateProvider() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProviderInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createProvider(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useUpdateProvider() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: ProviderId;
      input: ProviderInput;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateProvider(id, input);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["providers"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.provider(variables.id),
      });
    },
  });
}

export function useDeleteProvider() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ProviderId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteProvider(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* My provider profile (owner-scoped)                                  */
/* ------------------------------------------------------------------ */

export function useMyProvider() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.myProvider,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProvider();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMyProvider() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProviderInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createMyProvider(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myProvider });
      void queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useUpdateMyProvider() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProviderInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateMyProvider(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myProvider });
      void queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useDeleteMyProvider() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteMyProvider();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myProvider });
      void queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export function useCategories() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCategory() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createCategory(name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: CategoryId; name: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateCategory(id, name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: CategoryId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteCategory(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export function useReviewsForProvider(providerId: ProviderId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.reviews(providerId ?? 0n),
    queryFn: async () => {
      if (!actor || providerId === undefined) return [];
      return actor.listReviewsForProvider(providerId);
    },
    enabled: !!actor && !isFetching && providerId !== undefined,
  });
}

export function useAddReview() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReviewInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addReview(input);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews(variables.providerId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.provider(variables.providerId),
      });
      void queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useUpdateReview() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      rating,
      text,
    }: {
      id: ReviewId;
      rating: bigint;
      text: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateReview(id, rating, text);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["providers"] });
      void queryClient.invalidateQueries({ queryKey: ["provider"] });
    },
  });
}

export function useDeleteReview() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ReviewId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteReview(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["providers"] });
      void queryClient.invalidateQueries({ queryKey: ["provider"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

export function useCreateBooking() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BookingInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createBooking(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBookings });
    },
  });
}

export function useMyBookings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.myBookings,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProviderBookings(providerId: ProviderId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.providerBookings(providerId ?? 0n),
    queryFn: async () => {
      if (!actor || providerId === undefined) return [];
      return actor.listProviderBookings(providerId);
    },
    enabled: !!actor && !isFetching && providerId !== undefined,
  });
}

export function useAcceptBooking() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: BookingId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.acceptBooking(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useDeclineBooking() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: BookingId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.declineBooking(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Admin / roles                                                       */
/* ------------------------------------------------------------------ */

export function useCallerRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.callerRole,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.isAdmin,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: {
      user: Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.callerRole });
    },
  });
}

export function useSeedSampleData() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.seedSampleData();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["providers"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
