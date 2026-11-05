import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ProviderTypes "../types/providers";
import ReviewTypes "../types/reviews";
import ProvidersLib "../lib/providers";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  providers : Map.Map<Common.ProviderId, ProviderTypes.Provider>,
  reviews : Map.Map<Common.ReviewId, ReviewTypes.Review>,
  state : { var nextProviderId : Nat },
) {
  public query func listProviders(filter : ProviderTypes.ProviderFilter) : async [ProviderTypes.ProviderView] {
    ProvidersLib.listProviders(providers, reviews, filter);
  };

  public query func getProvider(id : Common.ProviderId) : async ?ProviderTypes.ProviderView {
    ProvidersLib.getProvider(providers, reviews, id);
  };

  public query ({ caller }) func getMyProvider() : async ?ProviderTypes.ProviderView {
    ProvidersLib.getMyProvider(providers, reviews, caller);
  };

  public shared ({ caller }) func createMyProvider(input : ProviderTypes.ProviderInput) : async ProviderTypes.ProviderView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can create a provider profile");
    };
    switch (ProvidersLib.getMyProvider(providers, reviews, caller)) {
      case (?_) { Runtime.trap("You already have a provider profile") };
      case null {};
    };
    ProvidersLib.createProvider(providers, reviews, state, caller, input);
  };

  public shared ({ caller }) func updateMyProvider(input : ProviderTypes.ProviderInput) : async ?ProviderTypes.ProviderView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can update a provider profile");
    };
    switch (providers.values().find(func provider = provider.owner == caller)) {
      case (?provider) { ProvidersLib.updateProvider(providers, reviews, provider.id, input) };
      case null { Runtime.trap("You do not have a provider profile") };
    };
  };

  public shared ({ caller }) func deleteMyProvider() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can delete a provider profile");
    };
    switch (providers.values().find(func provider = provider.owner == caller)) {
      case (?provider) { ProvidersLib.deleteProvider(providers, provider.id) };
      case null { Runtime.trap("You do not have a provider profile") };
    };
  };

  public shared ({ caller }) func createProvider(input : ProviderTypes.ProviderInput) : async ProviderTypes.ProviderView {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create providers");
    };
    ProvidersLib.createProvider(providers, reviews, state, caller, input);
  };

  public shared ({ caller }) func updateProvider(id : Common.ProviderId, input : ProviderTypes.ProviderInput) : async ?ProviderTypes.ProviderView {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update providers");
    };
    ProvidersLib.updateProvider(providers, reviews, id, input);
  };

  public shared ({ caller }) func deleteProvider(id : Common.ProviderId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete providers");
    };
    ProvidersLib.deleteProvider(providers, id);
  };
};
