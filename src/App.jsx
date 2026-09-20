import ManagerShell from './layout/ManagerShell';
import CommunityHostLayout from './community/CommunityHostLayout';
import { hostState } from './community/hostLinks';
import { useEffect, useState } from 'react';
import { api, saveSession } from './api';
import BillingPage from './pages/host/BillingPage';
import LoginPage from "./pages/LoginPage";
import ManagerOverviewPage from "./pages/manager/OverviewPage";
import HostApprovalsPage from "./pages/manager/HostApprovalsPage";
import SubscriptionsPage from "./pages/manager/SubscriptionsPage";
import AdvertisingPage from "./pages/manager/AdvertisingPage";
import UsersPage from "./pages/manager/UsersPage";
import VenueApprovalsPage from "./pages/manager/VenueApprovalsPage";
import ManagerEventsPage from "./pages/manager/EventsPage";
import HostOverviewPage from "./pages/host/OverviewPage";
import VenuesPage from "./pages/host/VenuesPage";
import AddVenuePage from "./pages/host/AddVenuePage";
import EventsPage from "./pages/host/EventsPage";
import AddEventPage from "./pages/host/AddEventPage";
import ViewEventPage from "./pages/host/ViewEventPage";
import MediaLibraryPage from "./pages/host/MediaLibraryPage";
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
import Notifications from './components/Notifications';

const pages = {
  '/notifications': () => <CommunityLayout><Notifications /></CommunityLayout>,
  '/manager/notifications': Notifications,
  "/": LandingPage,
  "/login": MemberAuth,
  "/admin/login": LoginPage,
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
  "/manager/events": ManagerEventsPage,
  "/manager/hosts": HostApprovalsPage,
  "/manager/subscriptions": SubscriptionsPage,
  "/manager/advertising": AdvertisingPage,
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
  "/host/billing": BillingPage,
  "/host/team": TeamMembersPage,
};

export default function App() {
  const { path, search } = useRouter();
  const [, refresh] = useState(0);
  useEffect(() => {
    const update = () => refresh(value => value + 1);
    const sync = async () => {
      const session = getSession();
      if (!session?.token) return;
      try {
        const data = await api('/user');
        if (getSession()?.token === session.token) saveSession({ ...session, user: data.user, portalAccesses: data.portal_accesses });
      } catch {}
    };
    window.addEventListener('vibfy-session', update);
    window.addEventListener('focus', sync);
    sync();
    const timer = window.setInterval(sync, 60000);
    return () => { window.removeEventListener('vibfy-session', update); window.removeEventListener('focus', sync); window.clearInterval(timer); };
  }, [path]);
  // The root URL is the single Vibfy entry point: public visitors see the
  // landing page, while authenticated members go straight to their home feed.
  if (path === '/' && getSession()?.token) return <HomeFeedPage />;
  if (/^\/events\/[^/]+$/.test(path)) return <EventDetails key={path} />;
  const preview = /^\/host\/preview\/[^/]+$/.test(path);
  const Page = pages[path];
  if (!Page && !preview) return <CommunityLayout><section className="community-empty"><h1>This page isn't here.</h1><CommunityLink className="vf-button" to="/discover">Discover Vibfy</CommunityLink></section></CommunityLayout>;
  const isPortal = path === '/manager' || path.startsWith('/manager/') || path === '/host' || path.startsWith('/host/');
  const memberOnly = ['/home', '/discover', '/weekend', '/near-me', '/saved', '/notifications'].includes(path);
  if (memberOnly && !getSession()?.token) return <MemberAuth returnTo={path + search} />;
  if (isPortal) {
    const portal = path.startsWith("/manager") ? "manager" : "host";
    const session = getSession();
    const allowed = session?.portalAccesses?.some(
      (access) => access.portal === portal && (portal !== 'host' || hostState(session).approved),
    );
    if (!session?.token) return portal === 'manager' ? <LoginPage /> : <MemberAuth returnTo={path + search} />;
    if (!allowed) return portal === 'host' ? <BecomeHost /> : <CommunityLayout><section className="community-empty"><h1>Manager access is required.</h1><CommunityLink to="/profile">Back to my account</CommunityLink></section></CommunityLayout>;
  }
  if (preview) return <EventDetails preview key={path} />;
  if (path === '/host' || path.startsWith('/host/')) return <CommunityHostLayout><Page /></CommunityHostLayout>;
  return isPortal ? (
    <ManagerShell>
      <Page />
    </ManagerShell>
  ) : (
    <Page />
  );
}
