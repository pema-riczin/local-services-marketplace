import type { ProviderId } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBooking } from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { CalendarCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BookingFormProps {
  providerId: ProviderId;
  providerName: string;
}

/** Booking request form: date, time and message, with a sent confirmation. */
export function BookingForm({ providerId, providerName }: BookingFormProps) {
  const { isAuthenticated } = useInternetIdentity();
  const createBooking = useCreateBooking();

  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const canSubmit =
    requestedDate.length > 0 &&
    requestedTime.length > 0 &&
    message.trim().length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const payload = {
      providerId,
      requestedDate,
      requestedTime,
      message: message.trim(),
    };
    setRequestedDate("");
    setRequestedTime("");
    setMessage("");
    createBooking.mutate(payload, {
      onSuccess: () => {
        setSent(true);
        toast.success("Booking request sent.");
      },
      onError: () => {
        setRequestedDate(payload.requestedDate);
        setRequestedTime(payload.requestedTime);
        setMessage(payload.message);
        toast.error("Could not send your request. Please try again.");
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <Card
        className="rounded-lg border-border shadow-none"
        data-ocid="booking.panel"
      >
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Request a booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sign in to send {providerName} a booking request with your preferred
            date and time.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (sent) {
    return (
      <Card
        className="rounded-lg border-primary/30 bg-primary/5 shadow-none"
        data-ocid="booking.success_state"
      >
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <CalendarCheck className="h-6 w-6 text-primary" />
          </span>
          <p className="font-display text-xl font-semibold text-foreground">
            Request sent
          </p>
          <p className="text-sm text-muted-foreground">
            {providerName} will review your request and respond soon. You can
            track it from your bookings page.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSent(false)}
            data-ocid="booking.send_another_button"
          >
            Send another request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="rounded-lg border-border shadow-none"
      data-ocid="booking.panel"
    >
      <CardHeader>
        <CardTitle className="font-display text-xl">
          Request a booking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="booking-date">Preferred date</Label>
              <Input
                id="booking-date"
                type="date"
                min={today}
                value={requestedDate}
                onChange={(event) => setRequestedDate(event.target.value)}
                disabled={createBooking.isPending}
                data-ocid="booking.date_input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="booking-time">Preferred time</Label>
              <Input
                id="booking-time"
                type="time"
                value={requestedTime}
                onChange={(event) => setRequestedTime(event.target.value)}
                disabled={createBooking.isPending}
                data-ocid="booking.time_input"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="booking-message">Message</Label>
            <Textarea
              id="booking-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={`Tell ${providerName} what you need help with.`}
              rows={4}
              maxLength={1000}
              disabled={createBooking.isPending}
              data-ocid="booking.message_textarea"
            />
          </div>
          <Button
            type="submit"
            disabled={createBooking.isPending || !canSubmit}
            data-ocid="booking.submit_button"
          >
            {createBooking.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />
            ) : null}
            {createBooking.isPending ? "Sending…" : "Send request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
