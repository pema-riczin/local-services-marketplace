import Principal "mo:core/Principal";
import Common "common";

module {
  public type Review = {
    id : Common.ReviewId;
    providerId : Common.ProviderId;
    author : Principal;
    rating : Nat;
    text : Text;
    createdAt : Common.Timestamp;
  };

  public type ReviewInput = {
    providerId : Common.ProviderId;
    rating : Nat;
    text : Text;
  };
};
