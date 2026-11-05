import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/providers";
import ReviewTypes "../types/reviews";
import Common "../types/common";

module {
  func toView(
    provider : Types.Provider,
    reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>,
  ) : Types.ProviderView {
    var total = 0;
    var count = 0;
    for (review in reviews.values()) {
      if (review.providerId == provider.id) {
        total += review.rating;
        count += 1;
      };
    };
    let averageRating = if (count == 0) { 0.0 } else { total.toFloat() / count.toFloat() };
    {
      id = provider.id;
      owner = provider.owner;
      name = provider.name;
      categoryId = provider.categoryId;
      description = provider.description;
      hourlyRate = provider.hourlyRate;
      location = provider.location;
      photo = provider.photo;
      createdAt = provider.createdAt;
      averageRating;
      reviewCount = count;
    };
  };

  func matches(provider : Types.Provider, filter : Types.ProviderFilter) : Bool {
    let categoryOk = switch (filter.categoryId) {
      case (?categoryId) { provider.categoryId == categoryId };
      case null { true };
    };
    let locationOk = switch (filter.location) {
      case (?location) {
        location.size() == 0 or provider.location.toLower().contains(#text (location.toLower()));
      };
      case null { true };
    };
    let searchOk = switch (filter.search) {
      case (?search) {
        if (search.size() == 0) {
          true;
        } else {
          let term = search.toLower();
          provider.name.toLower().contains(#text term) or provider.description.toLower().contains(#text term);
        };
      };
      case null { true };
    };
    categoryOk and locationOk and searchOk;
  };

  public func listProviders(
    providers : Map.Map<Common.ProviderId, Types.Provider>,
    reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>,
    filter : Types.ProviderFilter,
  ) : [Types.ProviderView] {
    providers.values().filter(func provider = matches(provider, filter)).map(func provider = toView(provider, reviews)).toArray();
  };

  public func getProvider(
    providers : Map.Map<Common.ProviderId, Types.Provider>,
    reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>,
    id : Common.ProviderId,
  ) : ?Types.ProviderView {
    switch (providers.get(id)) {
      case (?provider) { ?toView(provider, reviews) };
      case null { null };
    };
  };

  public func getMyProvider(
    providers : Map.Map<Common.ProviderId, Types.Provider>,
    reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>,
    owner : Principal,
  ) : ?Types.ProviderView {
    switch (providers.values().find(func provider = provider.owner == owner)) {
      case (?provider) { ?toView(provider, reviews) };
      case null { null };
    };
  };

  public func createProvider(
    providers : Map.Map<Common.ProviderId, Types.Provider>,
    reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>,
    state : { var nextProviderId : Nat },
    owner : Principal,
    input : Types.ProviderInput,
  ) : Types.ProviderView {
    let id = state.nextProviderId;
    state.nextProviderId := id + 1;
    let provider : Types.Provider = {
      id;
      owner;
      name = input.name;
      categoryId = input.categoryId;
      description = input.description;
      hourlyRate = input.hourlyRate;
      location = input.location;
      photo = input.photo;
      createdAt = Time.now();
    };
    providers.add(id, provider);
    toView(provider, reviews);
  };

  public func updateProvider(
    providers : Map.Map<Common.ProviderId, Types.Provider>,
    reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>,
    id : Common.ProviderId,
    input : Types.ProviderInput,
  ) : ?Types.ProviderView {
    switch (providers.get(id)) {
      case (?existing) {
        let updated : Types.Provider = {
          id = existing.id;
          owner = existing.owner;
          name = input.name;
          categoryId = input.categoryId;
          description = input.description;
          hourlyRate = input.hourlyRate;
          location = input.location;
          photo = input.photo;
          createdAt = existing.createdAt;
        };
        providers.add(id, updated);
        ?toView(updated, reviews);
      };
      case null { null };
    };
  };

  public func deleteProvider(
    providers : Map.Map<Common.ProviderId, Types.Provider>,
    id : Common.ProviderId,
  ) : Bool {
    switch (providers.get(id)) {
      case (?_) {
        providers.remove(id);
        true;
      };
      case null { false };
    };
  };
};
