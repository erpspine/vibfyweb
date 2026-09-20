import { ArrowRight, BarChart3, CalendarDays, Coins, Eye, Heart, MapPin, Plus, Star, Store, Ticket, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from '../../router'
import { api, apiUrl, getSession } from '../../api'
import EventLoading from '../../components/EventLoading'
import './overview.css'

const compact = value => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
const dateLabel = value => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
function EventPhoto({ event }) {
  const [failed, setFailed] = useState(false)
  const photo = event.media?.find(item => item.type === 'image')?.url
  const src = photo?.startsWith('/storage/') ? apiUrl.replace(/\/api\/v1$/, '') + photo : photo
  return src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : <span className="hd-photo-placeholder"><CalendarDays size={25} /></span>
}
export default function HostOverviewPage() {
  const { navigate } = useRouter()
  const [dashboard, setDashboard] = useState(null)
  const events = dashboard?.events
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [tab, setTab] = useState('Upcoming')
  useEffect(() => {
    let active = true
    setDashboard(null); setError('')
    api('/host/dashboard').then(data => { if (active) setDashboard(data) }).catch(problem => { if (active) setError(problem.message) })
    return () => { active = false }
  }, [retry])
  const now = new Date()
  const all = events || []
  const groups = {
    Upcoming: all.filter(e => e.status === 'published' && new Date(e.starts_at) > now).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)),
    Live: all.filter(e => e.status === 'published' && new Date(e.starts_at) <= now && new Date(e.ends_at) > now),
    Drafts: all.filter(e => e.status === 'draft'),
    Past: all.filter(e => e.status !== 'draft' && new Date(e.ends_at) <= now),
  }
  const total = field => all.reduce((sum, event) => sum + Number(event[field] || 0), 0)
  const stats = dashboard?.summary
  const revenue = Object.entries(stats?.revenue || {}).map(([currency, value]) => `${currency === 'TZS' ? 'TSh' : currency} ${compact(value)}`).join(' · ') || 'TSh 0'
  const summary = [[Users, 'Event views', compact(stats?.views || 0), 'purple'], [Ticket, 'Tickets sold', compact(stats?.tickets || 0), 'pink'], [CalendarDays, 'Upcoming events', stats?.upcoming || 0, 'amber'], [Coins, 'Event revenue', revenue, 'cyan']]
  const activity = dashboard?.booking_activity || []
  const maxTickets = Math.max(1, ...activity.map(day => day.tickets))
  const activityTotal = activity.reduce((sum, day) => sum + day.tickets, 0)
  const topEvent = [...all].filter(e => Number(e.views_count) > 0).sort((a, b) => b.views_count - a.views_count)[0]
  const categories = all.reduce((counts, e) => { if (e.category) counts[e.category] = (counts[e.category] || 0) + 1; return counts }, {})
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]
  const quick = dashboard?.quick_stats
  const quickStats = [[Store, 'Venues', quick?.venues || 0, 'cyan'], [Users, 'Guests booked', compact(quick?.guests || 0), 'purple'], [Heart, 'Event likes', compact(quick?.likes || 0), 'pink'], [Star, 'Event rating', quick?.rating ?? '—', 'amber']]
  const tips = [[Users, 'Grow your audience', 'Bring people together with experiences worth sharing.', '/host/events/new', 'purple'], [BarChart3, 'Boost your sales', 'Manage your events and keep your next big night on track.', '/host/events', 'cyan'], [Heart, 'Build your community', 'Bring your team together to create memorable experiences.', '/host/team', 'pink'], [CalendarDays, 'Discover opportunities', 'Make room for more experiences at your venues.', '/host/venues', 'purple']]
  return <div className="host-dashboard">
    <section className="hd-hero"><div><p className="hd-eyebrow">Welcome back, {getSession()?.user?.name?.split(' ')[0] || 'host'} <span>👋</span></p><h1>Create unforgettable experiences</h1><p>Manage your events, venues, and community — all in one place.</p><div className="hd-actions"><button onClick={() => navigate('/host/events/new')}><Plus size={19} />Create Event</button><button onClick={() => navigate('/host/events')}>View My Events</button></div></div><p className="hd-motto" aria-hidden="true">Good Vibes<br /><span>Bring People</span><br />Together <i>✦</i></p></section>
    {error ? <section className="hd-panel hd-empty"><p role="alert">{error}</p><button className="secondary-button" onClick={() => setRetry(v => v + 1)}>Try again</button></section> : !events ? <EventLoading label="Loading your dashboard..." /> : <>
      <div className="hd-metrics">{summary.map(([Icon, label, value, tone]) => <article className="hd-metric" key={label}><span className={`hd-icon ${tone}`}><Icon size={28} /></span><div><p>{label}</p><strong>{value}</strong><small>{label === 'Upcoming events' ? 'Published and scheduled' : 'Across all your events'}</small></div></article>)}</div>
      <div className="hd-grid">
        <section className="hd-panel hd-events"><div className="hd-heading"><h2>Your Events</h2><button onClick={() => navigate('/host/events')}>View all events <ArrowRight size={15} /></button></div><div className="hd-tabs" aria-label="Filter events">{Object.entries(groups).map(([label, items]) => <button key={label} aria-pressed={tab === label} className={tab === label ? 'active' : ''} onClick={() => setTab(label)}>{label} ({items.length})</button>)}</div>
          <div aria-live="polite">{groups[tab].length ? groups[tab].slice(0, 3).map(event => <article className="hd-event" key={event.id}><EventPhoto event={event} /><div className="hd-event-info"><button onClick={() => navigate('/host/events/view?id=' + event.id)}>{event.name}</button><span><CalendarDays size={13} />{dateLabel(event.starts_at)}</span><span><MapPin size={13} />{event.location_name || event.venue?.name || 'Location to be confirmed'}</span></div><span className={`hd-status ${tab.toLowerCase()}`}>{tab === 'Drafts' ? 'Draft' : tab === 'Past' ? 'Ended' : tab === 'Live' ? 'Live' : 'Published'}</span><div className="hd-tickets"><strong>{compact(Number(event.tickets_sold || 0))}</strong><small>tickets sold</small></div><button className="hd-view" aria-label={'View ' + event.name} onClick={() => navigate('/host/events/view?id=' + event.id)}><ArrowRight size={17} /></button></article>) : <div className="hd-empty"><CalendarDays size={32} /><h3>No {tab.toLowerCase()} events yet</h3><p>{tab === 'Upcoming' || tab === 'Drafts' ? 'Your next unforgettable experience starts here.' : 'Events will appear here when their schedule matches.'}</p><button className="hd-text-link" onClick={() => navigate('/host/events/new')}>Create an event <Plus size={15} /></button></div>}</div>
        </section>
        <section className="hd-panel hd-audience"><div className="hd-heading"><h2>Booking Activity</h2><span className="hd-period">Last 30 days</span></div><div className="hd-booking-summary"><strong>{compact(activityTotal)}</strong><span>tickets in confirmed bookings</span></div>{activityTotal > 0 ? <><div className="hd-booking-chart" role="img" aria-label={`Daily confirmed tickets over the last 30 days: ${activity.map(day => `${day.date}: ${day.tickets}`).join(', ')}`}>{activity.map(day => <span key={day.date} title={`${day.date}: ${day.tickets} tickets`} style={{ height: `${Math.max(2, day.tickets / maxTickets * 100)}%`, opacity: day.tickets ? 1 : .2 }} />)}</div><div className="hd-chart-dates"><span>{activity[0]?.date}</span><span>{activity.at(-1)?.date}</span></div></> : <div className="hd-chart-empty"><BarChart3 size={36} /><p>No confirmed bookings in the last 30 days.</p></div>}<div className="hd-insight"><small>Most viewed event</small><strong>{topEvent?.name || 'No event views yet'}</strong>{topEvent && <><progress value={Number(topEvent.views_count)} max={total('views_count')} aria-label="Share of views for most viewed event" /><span>{Math.round(Number(topEvent.views_count) / total('views_count') * 100)}%</span></>}</div><div className="hd-insight pink"><small>Most hosted category</small><strong>{topCategory?.[0] || 'Create your first event'}</strong>{topCategory && <><progress value={topCategory[1]} max={all.length} aria-label="Share of events in most hosted category" /><span>{Math.round(topCategory[1] / all.length * 100)}%</span></>}</div></section>
        <aside className="hd-sidebar"><section className="hd-panel"><div className="hd-heading"><h2>Coming Up Next</h2><button onClick={() => navigate('/host/events')}>See all <ArrowRight size={14} /></button></div>{groups.Upcoming.slice(0, 2).map(event => <button className="hd-next" key={event.id} onClick={() => navigate('/host/events/view?id=' + event.id)}><EventPhoto event={event} /><span><strong>{event.name}</strong><small>{dateLabel(event.starts_at)}</small><small><MapPin size={13} />{event.location_name || event.venue?.name}</small></span></button>)}{!groups.Upcoming.length && <p className="hd-sidebar-empty">Your next published event will appear here.</p>}</section><section className="hd-panel"><div className="hd-heading"><h2>Quick Stats</h2></div><div className="hd-quick">{quickStats.map(([Icon, label, value, tone]) => <div key={label}><span className={`hd-icon ${tone}`}><Icon size={21} /></span><div><small>{label}</small><strong>{value}</strong></div></div>)}</div></section></aside>
      </div>
      <section className="hd-tips" aria-label="Make the most of your host workspace">{tips.map(([Icon, title, copy, path, tone]) => <button key={title} onClick={() => navigate(path)}><span className={`hd-icon ${tone}`}><Icon size={29} /></span><span><strong>{title}</strong><small>{copy}</small></span></button>)}</section>
    </>}
  </div>
}
