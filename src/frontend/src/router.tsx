import { AuthenticatedApp } from "@/components/InternetIdentity";
import { Layout } from "@/components/Layout";
import AdminPage from "@/pages/AdminPage";
import BookingsPage from "@/pages/BookingsPage";
import DirectoryPage from "@/pages/DirectoryPage";
import MyProfilePage from "@/pages/MyProfilePage";
import ProviderDetailPage from "@/pages/ProviderDetailPage";
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const directoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DirectoryPage,
});

const providerDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/$providerId",
  component: ProviderDetailPage,
});

const myProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-profile",
  component: () => (
    <AuthenticatedApp
      title="Sign in to manage your profile"
      description="Your provider profile and bookings are private to your Internet Identity."
    >
      <MyProfilePage />
    </AuthenticatedApp>
  ),
});

const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookings",
  component: () => (
    <AuthenticatedApp
      title="Sign in to view your bookings"
      description="Your booking requests are private to your Internet Identity."
    >
      <BookingsPage />
    </AuthenticatedApp>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AuthenticatedApp
      title="Sign in to open the admin panel"
      description="Management tools are restricted to signed-in administrators."
    >
      <AdminPage />
    </AuthenticatedApp>
  ),
});

const routeTree = rootRoute.addChildren([
  directoryRoute,
  providerDetailRoute,
  myProfileRoute,
  bookingsRoute,
  adminRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
