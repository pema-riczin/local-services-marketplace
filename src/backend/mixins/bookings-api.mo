import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import BookingTypes "../types/bookings";
import ProviderTypes "../types/providers";
import Common "../types/common";
import BookingsLib "../lib/bookings";

mixin (
  accessControlState : AccessControl.AccessControlState,
  bookings : Map.Map<Common.BookingId, BookingTypes.BookingRequest>,
  providers : Map.Map<Common.ProviderId, ProviderTypes.Provider>,
  state : { var nextBookingId : Nat },
) {
  func canRespond(caller : Principal, id : Common.BookingId) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (bookings.get(id)) {
      case (?booking) {
        switch (providers.get(booking.providerId)) {
          case (?provider) { provider.owner == caller };
          case null { false };
        };
      };
      case null { false };
    };
  };
  func canViewProviderBookings(caller : Principal, providerId : Common.ProviderId) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (providers.get(providerId)) {
      case (?provider) { provider.owner == caller };
      case null { false };
    };
  };
  public shared ({ caller }) func createBooking(input : BookingTypes.BookingInput) : async BookingTypes.BookingRequest {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can request a booking");
    };
    BookingsLib.createBooking(bookings, state, caller, input);
  };

  public query ({ caller }) func listMyBookings() : async [BookingTypes.BookingRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can view their bookings");
    };
    BookingsLib.listCustomerBookings(bookings, caller);
  };

  public query ({ caller }) func listProviderBookings(providerId : Common.ProviderId) : async [BookingTypes.BookingRequest] {
    if (not canViewProviderBookings(caller, providerId)) {
      Runtime.trap("Unauthorized: Only the provider or an admin can view incoming booking requests");
    };
    BookingsLib.listProviderBookings(bookings, providerId);
  };

  public shared ({ caller }) func acceptBooking(id : Common.BookingId) : async ?BookingTypes.BookingRequest {
    if (not canRespond(caller, id)) {
      Runtime.trap("Unauthorized: Only the provider or an admin can respond to a booking request");
    };
    BookingsLib.setBookingStatus(bookings, id, #accepted);
  };

  public shared ({ caller }) func declineBooking(id : Common.BookingId) : async ?BookingTypes.BookingRequest {
    if (not canRespond(caller, id)) {
      Runtime.trap("Unauthorized: Only the provider or an admin can respond to a booking request");
    };
    BookingsLib.setBookingStatus(bookings, id, #declined);
  };
};
