import { SignInButton } from "@/components/InternetIdentity";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { to: "/", label: "Directory" },
  { to: "/bookings", label: "Bookings" },
  { to: "/my-profile", label: "My profile" },
  { to: "/admin", label: "Admin" },
] as const;

function isActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-subtle">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="font-display text-2xl font-semibold tracking-tight text-primary"
            data-ocid="nav.brand_link"
          >
            Homestead
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-smooth",
                  isActive(pathname, link.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                data-ocid={`nav.${link.label.toLowerCase().replace(/\s+/g, "_")}_link`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <SignInButton className="hidden sm:inline-flex" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              data-ocid="nav.menu_toggle"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <nav
            className="border-t border-border bg-card px-4 py-3 md:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                    isActive(pathname, link.to)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  data-ocid={`nav.mobile_${link.label.toLowerCase().replace(/\s+/g, "_")}_link`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                <SignInButton className="w-full" />
              </div>
            </div>
          </nav>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-muted/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                Homestead
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Trusted local providers for every home and personal need.
              </p>
            </div>
            <nav
              className="flex flex-wrap gap-x-6 gap-y-2 text-sm"
              aria-label="Footer"
            >
              <Link
                to="/"
                className="text-muted-foreground transition-smooth hover:text-foreground"
              >
                Directory
              </Link>
              <Link
                to="/bookings"
                className="text-muted-foreground transition-smooth hover:text-foreground"
              >
                Bookings
              </Link>
              <Link
                to="/my-profile"
                className="text-muted-foreground transition-smooth hover:text-foreground"
              >
                My profile
              </Link>
            </nav>
          </div>
          <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 transition-smooth hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
