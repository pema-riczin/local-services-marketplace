import type { BookingRequest, ProviderId } from "@/backend";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAcceptBooking,
  useDeclineBooking,
  useIsAdmin,
  useMyBookings,
  useMyProvider,
  useProviderBookings,
  useProviders,
} from "@/hooks/useQueries";
import { formatRequestedDate } from "@/lib/format";
import { CalendarClock, Inbox, Loader2, MessageSquareText } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

const SKELETON_IDS = Array.from(
  { length: 3 },
  (_, i) => `booking-skeleton-${i}`,
);

function shortPrincipal(principal: { toString(): string }): string {
  const value = principal.toString();
  return value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function BookingCard({
  booking,
  providerName,
  index,
  actions,
}: {
  booking: BookingRequest;
  providerName: string;
  index: number;
  actions?: ReactNode;
}) {
  return (
    <Card
      className="gap-4 rounded-lg border-border py-5 shadow-subtle transition-smooth hover:shadow-elevated"
      data-ocid={`bookings.item.${index}`}
    >
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-display text-lg text-foreground">
            {providerName}
          </CardTitle>
          <BookingStatusBadge status={booking.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarClock
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden
          />
          <span className="font-medium text-foreground">
            {formatRequestedDate(booking.requestedDate)}
          </span>
          <span aria-hidden>·</span>
          <span>{booking.requestedTime}</span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
          <MessageSquareText
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden
          />
          <p className="min-w-0 break-words">{booking.message}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Requested by {shortPrincipal(booking.customer)}
        </p>
      </CardContent>
      {actions ? (
        <CardFooter className="gap-2 border-t border-border pt-4">
          {actions}
        </CardFooter>
      ) : null}
    </Card>
  );
}

function BookingListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SKELETON_IDS.map((id) => (
        <Skeleton key={id} className="h-44 w-full rounded-lg" />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  description,
  marker,
}: {
  title: string;
  description: string;
  marker: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/60 px-6 py-16 text-center"
      data-ocid={marker}
    >
      <Inbox className="h-10 w-10 text-muted-foreground" aria-hidden />
      <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ErrorState({ message, marker }: { message: string; marker: string }) {
  return (
    <div
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-8 text-center text-sm text-destructive"
      data-ocid={marker}
    >
      {message}
    </div>
  );
}

export default function BookingsPage() {
  const [selectedProviderId, setSelectedProviderId] = useState<
    ProviderId | undefined
  >(undefined);

  const providersQuery = useProviders({});
  const myBookingsQuery = useMyBookings();
  const providerBookingsQuery = useProviderBookings(selectedProviderId);
  const isAdminQuery = useIsAdmin();
  const myProviderQuery = useMyProvider();
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();

  const providerNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const provider of providersQuery.data ?? []) {
      map.set(provider.id.toString(), provider.name);
    }
    return map;
  }, [providersQuery.data]);

  const providers = providersQuery.data ?? [];
  const myBookings = myBookingsQuery.data ?? [];
  const incomingBookings = providerBookingsQuery.data ?? [];
  const isAdmin = isAdminQuery.data ?? false;
  const myProviderId = myProviderQuery.data?.id;
  const ownsSelectedProvider =
    selectedProviderId !== undefined &&
    myProviderId !== undefined &&
    myProviderId === selectedProviderId;
  const canRespond = isAdmin || ownsSelectedProvider;

  const pendingCount = incomingBookings.filter(
    (booking) => booking.status === "pending",
  ).length;

  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6"
      data-ocid="bookings.page"
    >
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Your activity
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">
          Bookings
        </h1>
        <p className="mt-3 text-muted-foreground">
          Track the requests you have sent and respond to the ones waiting on
          you.
        </p>
      </header>

      <Tabs defaultValue="mine" className="mt-8 gap-6">
        <TabsList className="h-10">
          <TabsTrigger value="mine" data-ocid="bookings.mine.tab">
            My requests
          </TabsTrigger>
          <TabsTrigger value="incoming" data-ocid="bookings.incoming.tab">
            Incoming requests
            {pendingCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-accent/20 px-1.5 text-xs font-semibold text-accent-foreground">
                {pendingCount}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mine">
          {myBookingsQuery.isLoading ? (
            <BookingListSkeleton />
          ) : myBookingsQuery.isError ? (
            <ErrorState
              message="We could not load your booking requests. Please try again."
              marker="bookings.mine.error_state"
            />
          ) : myBookings.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="When you request a booking from a provider, it will appear here with its status."
              marker="bookings.mine.empty_state"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myBookings.map((booking, index) => (
                <BookingCard
                  key={booking.id.toString()}
                  booking={booking}
                  index={index + 1}
                  providerName={
                    providerNames.get(booking.providerId.toString()) ??
                    "Provider"
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="incoming" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 sm:max-w-sm">
            <label
              htmlFor="provider-select"
              className="text-sm font-medium text-foreground"
            >
              Provider profile
            </label>
            <Select
              value={selectedProviderId?.toString() ?? ""}
              onValueChange={(value) =>
                setSelectedProviderId(value ? BigInt(value) : undefined)
              }
            >
              <SelectTrigger
                id="provider-select"
                className="w-full"
                data-ocid="bookings.provider.select"
              >
                <SelectValue placeholder="Choose a provider profile" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem
                    key={provider.id.toString()}
                    value={provider.id.toString()}
                  >
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {canRespond
                ? "You can accept or decline requests for the selected profile."
                : "Only the profile owner or an administrator can accept or decline requests."}
            </p>
          </div>

          {selectedProviderId === undefined ? (
            <EmptyState
              title="Select a provider profile"
              description="Choose a profile above to review the booking requests sent to it."
              marker="bookings.incoming.empty_state"
            />
          ) : providerBookingsQuery.isLoading ? (
            <BookingListSkeleton />
          ) : providerBookingsQuery.isError ? (
            <ErrorState
              message="We could not load incoming requests. Please try again."
              marker="bookings.incoming.error_state"
            />
          ) : incomingBookings.length === 0 ? (
            <EmptyState
              title="No incoming requests"
              description="Requests sent to this provider profile will show up here."
              marker="bookings.incoming.empty_state"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {incomingBookings.map((booking, index) => {
                const isPending = booking.status === "pending";
                const isActing =
                  acceptBooking.isPending || declineBooking.isPending;
                return (
                  <BookingCard
                    key={booking.id.toString()}
                    booking={booking}
                    index={index + 1}
                    providerName={
                      providerNames.get(booking.providerId.toString()) ??
                      "Provider"
                    }
                    actions={
                      isPending ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            disabled={!canRespond || isActing}
                            onClick={() => acceptBooking.mutate(booking.id)}
                            data-ocid={`bookings.accept_button.${index + 1}`}
                          >
                            {acceptBooking.isPending ? (
                              <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                            ) : null}
                            Accept
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!canRespond || isActing}
                            onClick={() => declineBooking.mutate(booking.id)}
                            data-ocid={`bookings.decline_button.${index + 1}`}
                          >
                            {declineBooking.isPending ? (
                              <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                            ) : null}
                            Decline
                          </Button>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          This request has been{" "}
                          {booking.status === "accepted"
                            ? "accepted"
                            : "declined"}
                          .
                        </p>
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
