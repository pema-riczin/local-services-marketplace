import Principal "mo:core/Principal";
import Common "common";

module {
  public type BookingStatus = {
    #pending;
    #accepted;
    #declined;
  };

  public type BookingRequest = {
    id : Common.BookingId;
    providerId : Common.ProviderId;
    customer : Principal;
    requestedDate : Text;
    requestedTime : Text;
    message : Text;
    status : BookingStatus;
    createdAt : Common.Timestamp;
  };

  public type BookingInput = {
    providerId : Common.ProviderId;
    requestedDate : Text;
    requestedTime : Text;
    message : Text;
  };
};
