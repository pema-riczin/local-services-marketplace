import Storage "mo:caffeineai-object-storage/Storage";
import Principal "mo:core/Principal";
import Common "common";

module {
  public type Provider = {
    id : Common.ProviderId;
    owner : Principal;
    name : Text;
    categoryId : Common.CategoryId;
    description : Text;
    hourlyRate : Nat;
    location : Text;
    photo : ?Storage.ExternalBlob;
    createdAt : Common.Timestamp;
  };

  public type ProviderView = {
    id : Common.ProviderId;
    owner : Principal;
    name : Text;
    categoryId : Common.CategoryId;
    description : Text;
    hourlyRate : Nat;
    location : Text;
    photo : ?Storage.ExternalBlob;
    createdAt : Common.Timestamp;
    averageRating : Float;
    reviewCount : Nat;
  };

  public type ProviderInput = {
    name : Text;
    categoryId : Common.CategoryId;
    description : Text;
    hourlyRate : Nat;
    location : Text;
    photo : ?Storage.ExternalBlob;
  };

  public type ProviderFilter = {
    categoryId : ?Common.CategoryId;
    location : ?Text;
    search : ?Text;
  };
};
