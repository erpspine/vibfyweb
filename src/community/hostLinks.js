import { Store, CalendarDays, LayoutDashboard, Users, CreditCard, Images } from 'lucide-react';

export const hostLinks = [
  [LayoutDashboard, 'Host dashboard', '/host'],
  [Store, 'My venues', '/host/venues'],
  [Store, 'Add another venue', '/host/venues/new'],
  [CalendarDays, 'Create event', '/host/events/new'],
  [CalendarDays, 'My events', '/host/events'],
  [Images, 'Media library', '/host/media'],
  [Users, 'Host team', '/host/team'],
  [CreditCard, 'Billing', '/host/billing'],
];

export function hostState(session) {
  const access = session?.portalAccesses?.find(item => item.portal === 'host');
  const approved = Boolean(access && ['owner', 'admin', 'editor', 'viewer'].includes(access.role));
  return { approved, to: approved ? '/host' : '/become-host', label: approved ? 'Host dashboard' : access ? 'Application status' : 'Become a host' };
}
