import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ReviewTypes "../types/reviews";
import Common "../types/common";
import ReviewsLib "../lib/reviews";

mixin (
  accessControlState : AccessControl.AccessControlState,
  reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>,
  state : { var nextReviewId : Nat },
) {
  public query func listReviewsForProvider(providerId : Common.ProviderId) : async [ReviewTypes.Review] {
    ReviewsLib.listReviewsForProvider(reviews, providerId);
  };

  public shared ({ caller }) func addReview(input : ReviewTypes.ReviewInput) : async ReviewTypes.Review {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can add a review");
    };
    ReviewsLib.addReview(reviews, state, caller, input);
  };

  public shared ({ caller }) func updateReview(id : Common.ReviewId, rating : Nat, text : Text) : async ?ReviewTypes.Review {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can edit a review");
    };
    let review = reviews.get(id) ?? Runtime.trap("Review not found");
    if (review.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only edit your own review");
    };
    ReviewsLib.updateReview(reviews, id, rating, text);
  };

  public shared ({ caller }) func deleteReview(id : Common.ReviewId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can delete a review");
    };
    let review = reviews.get(id) ?? Runtime.trap("Review not found");
    if (review.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only delete your own review");
    };
    ReviewsLib.deleteReview(reviews, id);
  };
};
