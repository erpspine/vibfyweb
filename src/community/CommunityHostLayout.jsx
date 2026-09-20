import { useEffect, useState } from 'react';
import { api } from '../api';
import { CommunityLayout, CommunityLink } from './CommunityHeader';
import { hostLinks } from './hostLinks';
import { useRouter } from '../router';

export default function CommunityHostLayout({ children }) {
  const { path } = useRouter();
  const [eventCount, setEventCount] = useState(null);
  useEffect(() => {
    let active = true;
    api('/host/events', { showErrorAlert: false })
      .then(result => { if (active) setEventCount(result.events.length); })
      .catch(() => { if (active) setEventCount(null); });
    return () => { active = false; };
  }, [path]);
  return <CommunityLayout>
    <div className="community-container community-host-workspace">
      <nav className="community-host-nav" aria-label="Host navigation">
        {hostLinks.map(([Icon, label, to]) => <CommunityLink key={to} to={to} aria-current={path === to ? 'page' : undefined}><Icon size={17} />{label}{to === "/host/events" && eventCount != null && <b aria-label={`${eventCount} events`}>{eventCount.toLocaleString()}</b>}</CommunityLink>)}
      </nav>
      <div className="community-host-content">{children}</div>
    </div>
  </CommunityLayout>;
}
