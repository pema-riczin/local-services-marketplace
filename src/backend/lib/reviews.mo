import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/reviews";
import Common "../types/common";

module {
  public func listReviewsForProvider(
    reviews : Map.Map<Common.ReviewId, Types.Review>,
    providerId : Common.ProviderId,
  ) : [Types.Review] {
    reviews.values().filter(func(review) = review.providerId == providerId).toArray();
  };

  public func addReview(
    reviews : Map.Map<Common.ReviewId, Types.Review>,
    state : { var nextReviewId : Nat },
    author : Principal,
    input : Types.ReviewInput,
  ) : Types.Review {
    if (input.rating < 1 or input.rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    let alreadyReviewed = reviews.values().any(func(review) =
      review.providerId == input.providerId and review.author == author
    );
    if (alreadyReviewed) {
      Runtime.trap("You have already reviewed this provider");
    };
    let id = state.nextReviewId;
    state.nextReviewId := id + 1;
    let review : Types.Review = {
      id;
      providerId = input.providerId;
      author;
      rating = input.rating;
      text = input.text;
      createdAt = Time.now();
    };
    reviews.add(id, review);
    review;
  };

  public func updateReview(
    reviews : Map.Map<Common.ReviewId, Types.Review>,
    id : Common.ReviewId,
    rating : Nat,
    text : Text,
  ) : ?Types.Review {
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    switch (reviews.get(id)) {
      case (?review) {
        let updated : Types.Review = {
          id = review.id;
          providerId = review.providerId;
          author = review.author;
          rating;
          text;
          createdAt = review.createdAt;
        };
        reviews.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  public func deleteReview(
    reviews : Map.Map<Common.ReviewId, Types.Review>,
    id : Common.ReviewId,
  ) : Bool {
    switch (reviews.get(id)) {
      case (?_) {
        reviews.remove(id);
        true;
      };
      case null { false };
    };
  };

  public func averageRating(
    reviews : Map.Map<Common.ReviewId, Types.Review>,
    providerId : Common.ProviderId,
  ) : Float {
    var total = 0;
    var count = 0;
    for (review in reviews.values()) {
      if (review.providerId == providerId) {
        total += review.rating;
        count += 1;
      };
    };
    if (count == 0) { 0.0 } else { total.toFloat() / count.toFloat() };
  };

  public func reviewCount(
    reviews : Map.Map<Common.ReviewId, Types.Review>,
    providerId : Common.ProviderId,
  ) : Nat {
    var count = 0;
    for (review in reviews.values()) {
      if (review.providerId == providerId) {
        count += 1;
      };
    };
    count;
  };
};
