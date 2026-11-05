import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import BlobValue "mo:caffeineai-oql/BlobValue";
import ProviderTypes "types/providers";
import CategoryTypes "types/categories";
import ReviewTypes "types/reviews";
import BookingTypes "types/bookings";
import Common "types/common";
import ProvidersApi "mixins/providers-api";
import CategoriesApi "mixins/categories-api";
import ReviewsApi "mixins/reviews-api";
import BookingsApi "mixins/bookings-api";
import SeedApi "mixins/seed-api";
import SeedLib "lib/seed";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();

  let providers : Map.Map<Common.ProviderId, ProviderTypes.Provider>;
  let categories : Map.Map<Common.CategoryId, CategoryTypes.Category>;
  let reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>;
  let bookings : Map.Map<Common.BookingId, BookingTypes.BookingRequest>;
  let state : {
    var nextProviderId : Nat;
    var nextCategoryId : Nat;
    var nextReviewId : Nat;
    var nextBookingId : Nat;
    var seeded : Bool;
  };

  include ProvidersApi(accessControlState, providers, reviews, state);
  include CategoriesApi(accessControlState, categories, state);
  include ReviewsApi(accessControlState, reviews, state);
  include BookingsApi(accessControlState, bookings, providers, state);
  include SeedApi(accessControlState, providers, categories, reviews, state);

  transient let anyPrincipal = Principal.fromText("aaaaa-aa");

  // Populate sample content automatically on first use. The `seeded` flag is
  // stable, so this runs once and is skipped on subsequent upgrades.
  SeedLib.seed(providers, categories, reviews, state, anyPrincipal);

  include Expose({
    entities = [
      providers.toEntity("provider", "Provider", "id")
        .sample({
          id = 0;
          owner = anyPrincipal;
          name = "";
          categoryId = 0;
          description = "";
          hourlyRate = 0;
          location = "";
          photo = null;
          createdAt = 0;
        })
        .edge("categoryId", "category")
        .public_()
        .build(),
      categories.toEntity("category", "Category", "id")
        .sample({ id = 0; name = "" })
        .public_()
        .build(),
      reviews.toEntity("review", "Review", "id")
        .sample({
          id = 0;
          providerId = 0;
          author = anyPrincipal;
          rating = 0;
          text = "";
          createdAt = 0;
        })
        .edge("providerId", "provider")
        .public_()
        .build(),
      bookings.toEntityManual("booking", "BookingRequest", "id")
        .sample({
          id = 0;
          providerId = 0;
          customer = anyPrincipal;
          requestedDate = "";
          requestedTime = "";
          message = "";
          status = #pending;
          createdAt = 0;
        })
        .payload("id", func b = b.id)
        .payload("providerId", func b = b.providerId)
        .edge("providerId", "provider")
        .payload("customer", func b = b.customer)
        .payload("requestedDate", func b = b.requestedDate)
        .payload("requestedTime", func b = b.requestedTime)
        .payload("message", func b = b.message)
        .payload("status", func b = switch (b.status) {
          case (#pending) "pending";
          case (#accepted) "accepted";
          case (#declined) "declined";
        })
        .payload("createdAt", func b = b.createdAt)
        .ownedBy("customer")
        .controllerOrScoped()
        .build(),
    ];
  });

  include ApiDocMixin();
};
