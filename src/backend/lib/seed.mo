import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import ProviderTypes "../types/providers";
import CategoryTypes "../types/categories";
import ReviewTypes "../types/reviews";
import Common "../types/common";

module {
  public func seed(
    providers : Map.Map<Common.ProviderId, ProviderTypes.Provider>,
    categories : Map.Map<Common.CategoryId, CategoryTypes.Category>,
    reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>,
    state : {
      var nextProviderId : Nat;
      var nextCategoryId : Nat;
      var nextReviewId : Nat;
      var seeded : Bool;
    },
    admin : Principal,
  ) : () {
    if (state.seeded) {
      return;
    };
    state.seeded := true;

    let now = Time.now();

    let categoryNames = ["Tutoring", "Cleaning", "Handyman", "Gardening"];
    var categoryIds : [Common.CategoryId] = [];
    for (name in categoryNames.values()) {
      let id = state.nextCategoryId;
      state.nextCategoryId := id + 1;
      categories.add(id, { id; name });
      categoryIds := categoryIds.concat([id]);
    };

    let tutoring = categoryIds[0];
    let cleaning = categoryIds[1];
    let handyman = categoryIds[2];
    let gardening = categoryIds[3];

    let providerSeeds : [(Text, Common.CategoryId, Text, Nat, Text)] = [
      ("Alice Johnson", tutoring, "Experienced math and science tutor for high school and university students.", 45, "Downtown"),
      ("Brian Lee", tutoring, "Patient English and writing tutor, specializing in essay coaching.", 40, "Riverside"),
      ("Carla Mendes", cleaning, "Reliable home and office cleaning with eco-friendly products.", 30, "Downtown"),
      ("David Okafor", handyman, "General repairs, furniture assembly, and small plumbing jobs.", 55, "Northside"),
      ("Emma Rossi", gardening, "Garden maintenance, lawn care, and seasonal planting.", 35, "Riverside"),
    ];

    var providerIds : [Common.ProviderId] = [];
    for ((name, categoryId, description, hourlyRate, location) in providerSeeds.values()) {
      let id = state.nextProviderId;
      state.nextProviderId := id + 1;
      providers.add(id, {
        id;
        owner = admin;
        name;
        categoryId;
        description;
        hourlyRate;
        location;
        photo = null;
        createdAt = now;
      });
      providerIds := providerIds.concat([id]);
    };

    let reviewSeeds : [(Common.ProviderId, Nat, Text)] = [
      (providerIds[0], 5, "Alice explained calculus clearly and my grades improved."),
      (providerIds[0], 4, "Very knowledgeable, occasionally runs a few minutes late."),
      (providerIds[1], 5, "Brian helped me structure my thesis and gave great feedback."),
      (providerIds[2], 4, "Carla left the apartment spotless and was very friendly."),
      (providerIds[3], 5, "David fixed my leaking sink quickly and charged fairly."),
      (providerIds[4], 4, "Emma transformed my overgrown garden in one afternoon."),
    ];

    for ((providerId, rating, text) in reviewSeeds.values()) {
      let id = state.nextReviewId;
      state.nextReviewId := id + 1;
      reviews.add(id, {
        id;
        providerId;
        author = admin;
        rating;
        text;
        createdAt = now;
      });
    };
  };
};
