import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

/** Sign-in / sign-out control for the shared header. */
export function SignInButton({ className }: { className?: string }) {
  const { login, clear, isAuthenticated, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const queryClient = useQueryClient();

  const handleClick = () => {
    if (isAuthenticated) {
      clear();
      queryClient.clear();
    } else {
      login();
    }
  };

  const label = isInitializing
    ? "Loading…"
    : isAuthenticated
      ? "Sign out"
      : "Sign in";

  return (
    <Button
      type="button"
      variant={isAuthenticated ? "outline" : "default"}
      onClick={handleClick}
      disabled={isInitializing || isLoggingIn}
      className={className}
      data-ocid={isAuthenticated ? "nav.signout_button" : "nav.signin_button"}
    >
      {label}
    </Button>
  );
}

/**
 * Auth boundary. Renders the signed-out landing view until the visitor signs
 * in, then mounts the authenticated subtree with a principal-scoped cache.
 */
export function AuthenticatedApp({
  children,
  title = "Sign in to continue",
  description = "Your bookings and profile are private to your Internet Identity.",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  const { isAuthenticated, isInitializing, isLoginError, loginError } =
    useInternetIdentity();

  if (isInitializing) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        data-ocid="auth.loading_state"
      >
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle px-4">
        <div
          className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-elevated"
          data-ocid="auth.panel"
        >
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
          {isLoginError ? (
            <p
              className="mt-4 text-sm text-destructive"
              data-ocid="auth.error_state"
            >
              {loginError?.message ?? "Sign-in failed. Please try again."}
            </p>
          ) : null}
          <div className="mt-6 flex justify-center">
            <SignInButton className="w-full" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
