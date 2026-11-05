import type {
  BookingRequest,
  BookingStatus,
  Category,
  ProviderView,
  Review,
} from "@/backend";

export type { BookingRequest, BookingStatus, Category, ProviderView, Review };

/** A provider joined with its category name for display. */
export interface ProviderCardData {
  provider: ProviderView;
  categoryName: string;
}

/** Filter state for the provider directory. */
export interface DirectoryFilters {
  categoryId?: bigint;
  location: string;
  search: string;
}

export const EMPTY_FILTERS: DirectoryFilters = {
  location: "",
  search: "",
};
