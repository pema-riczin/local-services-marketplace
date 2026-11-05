import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export type BookingId = bigint;
export interface BookingInput {
    message: string;
    requestedDate: string;
    requestedTime: string;
    providerId: ProviderId;
}
export interface BookingRequest {
    id: BookingId;
    status: BookingStatus;
    customer: Principal;
    createdAt: Timestamp;
    message: string;
    requestedDate: string;
    requestedTime: string;
    providerId: ProviderId;
}
export interface Category {
    id: CategoryId;
    name: string;
}
export type CategoryId = bigint;
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface ProviderFilter {
    categoryId?: CategoryId;
    search?: string;
    location?: string;
}
export type ProviderId = bigint;
export interface ProviderInput {
    categoryId: CategoryId;
    name: string;
    hourlyRate: bigint;
    description: string;
    photo?: ExternalBlob;
    location: string;
}
export interface ProviderView {
    id: ProviderId;
    categoryId: CategoryId;
    owner: Principal;
    name: string;
    createdAt: Timestamp;
    hourlyRate: bigint;
    description: string;
    averageRating: number;
    photo?: ExternalBlob;
    reviewCount: bigint;
    location: string;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Review {
    id: ReviewId;
    createdAt: Timestamp;
    text: string;
    author: Principal;
    rating: bigint;
    providerId: ProviderId;
}
export type ReviewId = bigint;
export interface ReviewInput {
    text: string;
    rating: bigint;
    providerId: ProviderId;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum BookingStatus {
    pending = "pending",
    accepted = "accepted",
    declined = "declined"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptBooking(id: BookingId): Promise<BookingRequest | null>;
    addReview(input: ReviewInput): Promise<Review>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBooking(input: BookingInput): Promise<BookingRequest>;
    createCategory(name: string): Promise<Category>;
    createMyProvider(input: ProviderInput): Promise<ProviderView>;
    createProvider(input: ProviderInput): Promise<ProviderView>;
    declineBooking(id: BookingId): Promise<BookingRequest | null>;
    deleteCategory(id: CategoryId): Promise<boolean>;
    deleteMyProvider(): Promise<boolean>;
    deleteProvider(id: ProviderId): Promise<boolean>;
    deleteReview(id: ReviewId): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getMyProvider(): Promise<ProviderView | null>;
    getProvider(id: ProviderId): Promise<ProviderView | null>;
    isCallerAdmin(): Promise<boolean>;
    listCategories(): Promise<Array<Category>>;
    listMyBookings(): Promise<Array<BookingRequest>>;
    listProviderBookings(providerId: ProviderId): Promise<Array<BookingRequest>>;
    listProviders(filter: ProviderFilter): Promise<Array<ProviderView>>;
    listReviewsForProvider(providerId: ProviderId): Promise<Array<Review>>;
    schema(): Promise<string>;
    seedSampleData(): Promise<void>;
    updateCategory(id: CategoryId, name: string): Promise<Category | null>;
    updateMyProvider(input: ProviderInput): Promise<ProviderView | null>;
    updateProvider(id: ProviderId, input: ProviderInput): Promise<ProviderView | null>;
    updateReview(id: ReviewId, rating: bigint, text: string): Promise<Review | null>;
}
