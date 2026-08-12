import { CalendarDays, ChevronRight, MapPin, MoreHorizontal, TrendingUp } from 'lucide-react'

export function Avatar({ manager = false }) {
  return <div className="avatar">{manager ? 'DO' : 'RG'}<span /></div>
}

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge ${tone}`}>{children}</span>
}

export function MetricCard({ icon: Icon, label, value, delta, tone }) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={20} /></div><span className="metric-label">{label}</span><div className="metric-bottom"><strong>{value}</strong><span className="delta"><TrendingUp size={13} />{delta}</span></div></article>
}

export function SectionHeader({ title, subtitle, action, onAction }) {
  return <div className="section-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="text-button" onClick={onAction}>{action}<ChevronRight size={16} /></button>}</div>
}

export function PageHeading({ badge, title, description, children }) {
  return <div className="page-heading"><div>{badge}<h1>{title}</h1><p>{description}</p></div>{children}</div>
}

export function EventRow({ event }) {
  return <div className="event-row"><img src={event.image} alt="" /><div><strong>{event.title}</strong><span><MapPin size={13} />{event.venue}</span><span><CalendarDays size={13} />{event.date}</span></div><Badge tone={event.status === 'Live' ? 'green' : 'neutral'}>{event.status}</Badge><div className="tickets"><strong>{event.sold}</strong><small>tickets</small></div><button><MoreHorizontal /></button></div>
}

export function EmptyPage({ title, description = 'This workspace is ready for live platform data and detailed reporting.' }) {
  return <div className="empty-page"><span><TrendingUp /></span><h1>{title}</h1><p>{description}</p><button className="primary-button">Configure report</button></div>
}
