import AppShell from "./layout/AppShell";
import ManagerOverviewPage from "./pages/manager/OverviewPage";
import HostApprovalsPage from "./pages/manager/HostApprovalsPage";
import SubscriptionsPage from "./pages/manager/SubscriptionsPage";
import AdvertisingPage from "./pages/manager/AdvertisingPage";
import AnalyticsPage from "./pages/manager/AnalyticsPage";
import UsersPage from "./pages/manager/UsersPage";
import VenueApprovalsPage from "./pages/manager/VenueApprovalsPage";
import HostOverviewPage from "./pages/host/OverviewPage";
import VenuesPage from "./pages/host/VenuesPage";
import AddVenuePage from "./pages/host/AddVenuePage";
import EventsPage from "./pages/host/EventsPage";
import AddEventPage from "./pages/host/AddEventPage";
import ViewEventPage from "./pages/host/ViewEventPage";
import MediaLibraryPage from "./pages/host/MediaLibraryPage";
import PerformancePage from "./pages/host/PerformancePage";
import TeamMembersPage from "./pages/host/TeamMembersPage";
import { useRouter } from "./router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { getSession } from "./api";

const pages = {
  "/": LandingPage,
  "/login": LoginPage,
  "/signup": SignupPage,
  "/manager": ManagerOverviewPage,
  "/manager/hosts": HostApprovalsPage,
  "/manager/subscriptions": SubscriptionsPage,
  "/manager/advertising": AdvertisingPage,
  "/manager/analytics": AnalyticsPage,
  "/manager/users": UsersPage,
  "/manager/venues": VenueApprovalsPage,
  "/host": HostOverviewPage,
  "/host/venues": VenuesPage,
  "/host/venues/new": AddVenuePage,
  "/host/venues/edit": () => <AddVenuePage mode="edit" />,
  "/host/events": EventsPage,
  "/host/events/new": AddEventPage,
  "/host/events/edit": () => <AddEventPage mode="edit" />,
  "/host/events/view": ViewEventPage,
  "/host/media": MediaLibraryPage,
  "/host/performance": PerformancePage,
  "/host/team": TeamMembersPage,
};

export default function App() {
  const { path } = useRouter();
  const Page = pages[path] || LandingPage;
  const isPortal = path.startsWith("/manager") || path.startsWith("/host");
  if (isPortal) {
    const portal = path.startsWith("/manager") ? "manager" : "host";
    const session = getSession();
    const allowed = session?.portalAccesses?.some(
      (access) => access.portal === portal,
    );
    if (!session?.token || !allowed) return <LoginPage />;
  }
  return isPortal ? (
    <AppShell>
      <Page />
    </AppShell>
  ) : (
    <Page />
  );
}
