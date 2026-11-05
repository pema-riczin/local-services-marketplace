import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/bookings";
import Common "../types/common";

module {
  public func createBooking(
    bookings : Map.Map<Common.BookingId, Types.BookingRequest>,
    state : { var nextBookingId : Nat },
    customer : Principal,
    input : Types.BookingInput,
  ) : Types.BookingRequest {
    let id = state.nextBookingId;
    state.nextBookingId := id + 1;
    let booking : Types.BookingRequest = {
      id;
      providerId = input.providerId;
      customer;
      requestedDate = input.requestedDate;
      requestedTime = input.requestedTime;
      message = input.message;
      status = #pending;
      createdAt = Time.now();
    };
    bookings.add(id, booking);
    booking;
  };

  public func listCustomerBookings(
    bookings : Map.Map<Common.BookingId, Types.BookingRequest>,
    customer : Principal,
  ) : [Types.BookingRequest] {
    bookings.values().filter(func(b) = Principal.equal(b.customer, customer)).toArray();
  };

  public func listProviderBookings(
    bookings : Map.Map<Common.BookingId, Types.BookingRequest>,
    providerId : Common.ProviderId,
  ) : [Types.BookingRequest] {
    bookings.values().filter(func(b) = b.providerId == providerId).toArray();
  };

  public func setBookingStatus(
    bookings : Map.Map<Common.BookingId, Types.BookingRequest>,
    id : Common.BookingId,
    status : Types.BookingStatus,
  ) : ?Types.BookingRequest {
    switch (bookings.get(id)) {
      case (?booking) {
        let updated : Types.BookingRequest = {
          id = booking.id;
          providerId = booking.providerId;
          customer = booking.customer;
          requestedDate = booking.requestedDate;
          requestedTime = booking.requestedTime;
          message = booking.message;
          status;
          createdAt = booking.createdAt;
        };
        bookings.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };
};
