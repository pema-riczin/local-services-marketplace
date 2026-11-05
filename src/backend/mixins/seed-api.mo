import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ProviderTypes "../types/providers";
import CategoryTypes "../types/categories";
import ReviewTypes "../types/reviews";
import SeedLib "../lib/seed";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  providers : Map.Map<Common.ProviderId, ProviderTypes.Provider>,
  categories : Map.Map<Common.CategoryId, CategoryTypes.Category>,
  reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>,
  state : {
    var nextProviderId : Nat;
    var nextCategoryId : Nat;
    var nextReviewId : Nat;
    var seeded : Bool;
  },
) {
  public shared ({ caller }) func seedSampleData() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can seed sample data");
    };
    SeedLib.seed(providers, categories, reviews, state, caller);
  };
};
