import { CalendarDays, Eye, MapPin, MoreHorizontal, Search, UserRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import EventInformation from '../../components/EventInformation';
import { useManagerDashboard } from '../../layout/ManagerShell';
import { api } from '../../api';
import { Badge, PageHeading } from '../../components/ui';

const formatDate = value => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '-';
const eventStatus = event => event.status === 'published' ? (new Date(event.ends_at) < new Date() ? 'Ended' : 'Published') : ({ draft: 'Drafts', suspended: 'Suspended' }[event.status] || event.status);

export default function ManagerEventsPage() {
  const [events, setEvents] = useState([]); const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All'); const [error, setError] = useState(''); const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const { retry } = useManagerDashboard();
  const [mode, setMode] = useState('view');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (selected && !dialog.current.open) dialog.current.showModal();
  }, [selected]);
  function openEvent(event, nextMode) {
    setSelected(event); setMode(nextMode); setActionError(''); setConfirmDelete(false);
  }
  function closeDialog() {
    if (busy) return;
    dialog.current.close(); setSelected(null);
  }
  async function manage(status) {
    setBusy(true); setActionError(''); setNotice('');
    try {
      const result = await api(`/manager/events/${selected.id}`, {
        method: status === 'delete' ? 'DELETE' : 'PATCH',
        ...(status === 'delete' ? {} : { body: JSON.stringify({ status }) }),
        showErrorAlert: false,
      });
      setEvents(current => status === 'delete' ? current.filter(event => event.id !== selected.id) : current.map(event => event.id === selected.id ? result.event : event));
      setNotice(result.message);
      retry();
      if (status === 'delete') { dialog.current.close(); setSelected(null); }
      else setSelected(result.event);
      setConfirmDelete(false);
    } catch (problem) { setActionError(problem.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { api('/manager/events').then(result => setEvents(result.events || [])).catch(problem => setError(problem.message)); }, []);
  const visible = useMemo(() => events.filter(event => { const status = eventStatus(event); return (filter === 'All' || status === filter) && `${event.name} ${event.venue?.name || ''} ${event.venue?.owner?.name || ''}`.toLowerCase().includes(query.toLowerCase()); }), [events, filter, query]);
  return <div className="manager-events-page manager-legacy"><PageHeading badge={<Badge tone="purple"><CalendarDays size={13} /> {events.length} events</Badge>} title="Event management" description="Review every event, its host, venue, and publishing status from one place." />
    {error && <p className="auth-error" role="alert">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    <div className="filter-row"><div className="filter-tabs">{['All', 'Published', 'Drafts', 'Suspended', 'Ended'].map(item => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item === 'draft' ? 'Drafts' : item}</button>)}</div><label className="table-search"><Search size={16} /><input placeholder="Search events, hosts or venues" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
    <section className="panel table-panel manager-events-panel"><div className="data-table"><div className="table-row table-head"><span>Event</span><span>Host</span><span>Venue</span><span>Schedule</span><span>Status</span><span>Actions</span></div>{visible.map((event, index) => <div className="table-row" key={event.id}><div className="business-cell"><div className={`business-avatar color-${index % 6}`}><CalendarDays size={16} /></div><div><strong>{event.name}</strong><small>{event.category || 'Community event'}</small></div></div><span><UserRound size={13} /> {event.venue?.owner?.name || 'Host pending'}</span><span><MapPin size={13} /> {event.venue?.name || event.location_name || 'Venue pending'}</span><span>{formatDate(event.starts_at)}</span><span><Badge tone={eventStatus(event) === 'Published' ? 'green' : 'amber'}>{eventStatus(event)}</Badge></span><div className="row-actions"><button aria-label={`View ${event.name}`} onClick={() => openEvent(event, 'view')}><Eye size={17} /></button><button aria-label={`Manage ${event.name}`} onClick={() => openEvent(event, 'manage')}><MoreHorizontal size={17} /></button></div></div>)}</div>{!visible.length && <div className="venue-empty"><CalendarDays size={28} /><h2>No events found</h2><p>Try a different search or status filter.</p></div>}</section><dialog ref={dialog} className="md-dialog manager-event-dialog" aria-labelledby="manager-event-title" onCancel={event => { event.preventDefault(); closeDialog(); }} onClick={event => { if (event.target === dialog.current) closeDialog(); }} onClose={() => setSelected(null)}>
      {selected && <>
        <div className="md-heading"><h2 id="manager-event-title">{mode === 'manage' ? 'Manage: ' : ''}{selected.name}</h2><button disabled={busy} onClick={closeDialog} aria-label="Close event details">×</button></div>
        <EventInformation event={selected} />
        {actionError && <p className="auth-error" role="alert">{actionError}</p>}
        {mode === 'manage' && <div className="manager-event-actions" aria-busy={busy}>
          {confirmDelete ? <>
            <p>Delete “{selected.name}” permanently? Its bookings, reviews and other linked records will also be removed. This cannot be undone.</p>
            <button className="danger-action" disabled={busy} onClick={() => manage('delete')}>{busy ? 'Deleting…' : 'Confirm delete'}</button>
            <button disabled={busy} onClick={() => setConfirmDelete(false)}>Cancel</button>
          </> : <>
            {selected.status !== 'suspended' && <button disabled={busy} onClick={() => manage('suspended')}>Suspend event</button>}
            {selected.status !== 'published' && selected.status !== 'suspended' && <button disabled={busy} onClick={() => manage('published')}>Publish event</button>}
            {selected.status !== 'draft' && <button disabled={busy} onClick={() => manage('draft')}>{selected.status === 'suspended' ? 'Restore to draft' : 'Unpublish'}</button>}
            <button className="danger-action" disabled={busy} onClick={() => setConfirmDelete(true)}>Delete event</button>
            {busy && <span role="status">Saving…</span>}
          </>}
        </div>}
        <button className="md-primary" disabled={busy} onClick={closeDialog}>Close</button>
      </>}
    </dialog></div>;
}
