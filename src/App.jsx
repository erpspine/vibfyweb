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
import DiscoveryPage from './community/EventDiscovery';
import EventDetails from './community/EventDetails';
import MemberAuth from './community/MemberAuth';
import { MemberProfile, MemberBookings, BecomeHost } from './community/MemberPages';
import { CommunityLayout, CommunityLink } from './community/CommunityHeader';
import { getSession } from "./api";
import HomeFeedPage from './community/HomeFeedPage';

const pages = {
  "/": LandingPage,
  "/login": MemberAuth,
  "/signup": () => <MemberAuth register />,
  "/home": HomeFeedPage,
  "/discover": DiscoveryPage,
  "/weekend": () => <DiscoveryPage mode="weekend" />,
  "/near-me": () => <DiscoveryPage mode="near" />,
  "/saved": () => <DiscoveryPage mode="saved" />,
  "/profile": MemberProfile,
  "/bookings": MemberBookings,
  "/become-host": BecomeHost,
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
  const { path, search } = useRouter();
  // The root URL is the single Vibfy entry point: public visitors see the
  // landing page, while authenticated members go straight to their home feed.
  if (path === '/' && getSession()?.token) return <HomeFeedPage />;
  if (/^\/events\/[^/]+$/.test(path)) return <EventDetails key={path} />;
  const preview = /^\/host\/preview\/[^/]+$/.test(path);
  const Page = pages[path];
  if (!Page && !preview) return <CommunityLayout><section className="community-empty"><h1>This page isn't here.</h1><CommunityLink className="vf-button" to="/discover">Discover Vibfy</CommunityLink></section></CommunityLayout>;
  const isPortal = path === '/manager' || path.startsWith('/manager/') || path === '/host' || path.startsWith('/host/');
  const memberOnly = ['/home', '/discover', '/weekend', '/near-me', '/saved'].includes(path);
  if (memberOnly && !getSession()?.token) return <MemberAuth returnTo={path + search} />;
  if (isPortal) {
    const portal = path.startsWith("/manager") ? "manager" : "host";
    const session = getSession();
    const allowed = session?.portalAccesses?.some(
      (access) => access.portal === portal,
    );
    if (!session?.token) return <MemberAuth returnTo={path + search} />;
    if (!allowed) return portal === 'host' ? <BecomeHost /> : <CommunityLayout><section className="community-empty"><h1>Manager access is required.</h1><CommunityLink to="/profile">Back to my account</CommunityLink></section></CommunityLayout>;
  }
  if (preview) return <EventDetails preview key={path} />;
  return isPortal ? (
    <AppShell>
      <Page />
    </AppShell>
  ) : (
    <Page />
  );
}
