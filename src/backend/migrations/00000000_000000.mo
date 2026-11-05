import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type Provider = {
    id : Nat;
    owner : Principal;
    name : Text;
    categoryId : Nat;
    description : Text;
    hourlyRate : Nat;
    location : Text;
    photo : ?Blob;
    createdAt : Int;
  };

  type Category = {
    id : Nat;
    name : Text;
  };

  type Review = {
    id : Nat;
    providerId : Nat;
    author : Principal;
    rating : Nat;
    text : Text;
    createdAt : Int;
  };

  type BookingStatus = {
    #pending;
    #accepted;
    #declined;
  };

  type BookingRequest = {
    id : Nat;
    providerId : Nat;
    customer : Principal;
    requestedDate : Text;
    requestedTime : Text;
    message : Text;
    status : BookingStatus;
    createdAt : Int;
  };

  type State = {
    var nextProviderId : Nat;
    var nextCategoryId : Nat;
    var nextReviewId : Nat;
    var nextBookingId : Nat;
    var seeded : Bool;
  };

  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    providers : Map.Map<Nat, Provider>;
    categories : Map.Map<Nat, Category>;
    reviews : Map.Map<Nat, Review>;
    bookings : Map.Map<Nat, BookingRequest>;
    state : State;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      providers = Map.empty();
      categories = Map.empty();
      reviews = Map.empty();
      bookings = Map.empty();
      state = {
        var nextProviderId = 0;
        var nextCategoryId = 0;
        var nextReviewId = 0;
        var nextBookingId = 0;
        var seeded = false;
      };
    };
  };
};
