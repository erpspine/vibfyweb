import { useEffect, useState } from 'react'
import { ArrowUpRight, Bookmark, CalendarDays, Compass, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { api, getSession } from '../api'
import { useRouter } from '../router'
import { CommunityLayout, CommunityLink } from './CommunityHeader'
import { categories, distanceKm, eventDate, eventImage, eventPrice, isThisWeekend } from './events'

export function useSavedEvents() {
  const key = `vibfy_saved_events:${getSession()?.user?.id || 'guest'}`
  const [saved, setSaved] = useState(() => { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : [] } catch { return [] } })
  const [saveError, setSaveError] = useState('')
  function toggle(event) {
    const next = saved.some(item => item.id === event.id) ? saved.filter(item => item.id !== event.id) : [...saved, event]
    try { localStorage.setItem(key, JSON.stringify(next)); setSaved(next); setSaveError('') } catch { setSaveError('Your browser could not save this event. Please check your storage settings.') }
  }
  return { saved, toggle, saveError }
}

export function EventCard({ event, saved, onSave }) {
  return <article className="community-event-card"><div className="community-event-photo"><CommunityLink to={`/events/${event.id}`} tabIndex={-1} aria-hidden="true"><img src={eventImage(event)} alt="" loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/experiences-hero.png' }} /></CommunityLink><span className="community-category">{event.category}</span><button className={saved ? 'is-saved' : ''} onClick={() => onSave(event)} aria-label={`${saved ? 'Unsave' : 'Save'} ${event.name}`} aria-pressed={saved}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} /></button></div><div className="community-event-info"><span className="community-event-date"><CalendarDays size={14} />{eventDate(event.starts_at)}</span><h3><CommunityLink to={`/events/${event.id}`}>{event.name}</CommunityLink></h3><p><MapPin size={14} />{event.location_name || event.venue?.name || 'Location to be announced'}</p><div><strong>{eventPrice(event)}</strong><CommunityLink to={`/events/${event.id}`} aria-label={`View ${event.name}`}><ArrowUpRight size={20} /></CommunityLink></div></div></article>
}

export function EventCollection({ mode = 'all', compact = false }) {
  const { search } = useRouter()
  const params = new URLSearchParams(search)
  const [query, setQuery] = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('category') || 'All')
  const [free, setFree] = useState(false)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(mode !== 'saved')
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [position, setPosition] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [locating, setLocating] = useState(false)
  const { saved, toggle, saveError } = useSavedEvents()
  useEffect(() => { setQuery(new URLSearchParams(search).get('q') || ''); setCategory(new URLSearchParams(search).get('category') || 'All') }, [search])
  useEffect(() => {
    if (mode === 'saved') return
    let active = true; setLoading(true); setError('')
    api('/events').then(data => { if (active) setEvents(data.events || []) }).catch(e => { if (active) setError(e.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [revision, mode])
  function locate() {
    if (!navigator.geolocation) { setLocationError('Location is unavailable in this browser. Search for a city instead.'); return }
    setLocating(true); setLocationError('')
    navigator.geolocation.getCurrentPosition(p => { setPosition(p.coords); setLocating(false) }, () => { setLocationError('We could not access your location. Allow location access or search for a city.'); setLocating(false) }, { timeout: 12000, maximumAge: 300000 })
  }
  const filtered = (mode === 'saved' ? saved : events).filter(event =>
    (category === 'All' || event.category === category) && (!free || event.is_free) &&
    `${event.name} ${event.location_name || ''} ${event.location_address || ''} ${event.category}`.toLowerCase().includes(query.toLowerCase().trim()) &&
    (mode !== 'weekend' || isThisWeekend(event)) && (mode !== 'near' || !position || distanceKm(event, position) <= 50)
  )
  if (mode === 'near' && position) filtered.sort((a, b) => distanceKm(a, position) - distanceKm(b, position))
  return <div className="community-collection">
    {!compact && <><div className="community-search"><Search size={20} /><input aria-label="Search events or places" placeholder="An event, a place, your next good time..." value={query} onChange={e => setQuery(e.target.value)} /><label><input type="checkbox" checked={free} onChange={e => setFree(e.target.checked)} />Free entry</label></div><div className="vf-category-tabs" role="group" aria-label="Event categories">{['All', ...categories].map(item => <button key={item} className={category === item ? 'active' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></>}
    {mode === 'near' && <div className="community-notice"><MapPin size={22} /><div><strong>{position ? 'Experiences within 50 km' : 'Find something close to you'}</strong><p>{position ? 'Sorted from nearest to furthest.' : 'Use your location, or enter a city in the search above. All upcoming events are shown until you choose.'}</p>{locationError && <p role="alert">{locationError}</p>}</div><button className="vf-button" disabled={locating} onClick={locate}>{locating ? 'Locating...' : position ? 'Update location' : 'Use my location'}</button></div>}
    {mode === 'saved' && <p className="community-muted">Saved on this browser{getSession()?.token ? ' for your account' : ''}. Open an event to check current details and availability.</p>}
    {saveError && <p role="alert" className="community-notice">{saveError}</p>}
    {loading ? <div className="community-event-grid" aria-label="Loading events" role="status">{[1, 2, 3].map(n => <div className="community-skeleton" key={n}><span />Loading experiences...</div>)}</div> : error ? <div className="community-empty" role="alert"><Compass /><h3>We couldn't load the experiences.</h3><p>{error}</p><button className="vf-button" onClick={() => setRevision(revision + 1)}>Try again</button></div> : filtered.length ? <><div className="community-event-grid">{filtered.slice(0, compact ? 3 : undefined).map(event => <EventCard key={event.id} event={event} saved={saved.some(item => item.id === event.id)} onSave={toggle} />)}</div>{!compact && <p className="community-muted">{filtered.length} {filtered.length === 1 ? 'experience' : 'experiences'} to make your own.</p>}</> : <div className="community-empty"><Compass /><h3>{mode === 'saved' ? 'Good plans deserve a place to stay.' : 'Your next good time is on its way.'}</h3><p>{mode === 'saved' ? 'Tap the bookmark on an event to keep it here.' : 'No upcoming events match this view. Try another category or check back for new experiences.'}</p>{mode === 'saved' ? <CommunityLink className="vf-button" to="/discover">Discover experiences</CommunityLink> : (query || category !== 'All' || free) && <button className="vf-button" onClick={() => { setQuery(''); setCategory('All'); setFree(false) }}>Clear filters</button>}</div>}
  </div>
}

export default function DiscoveryPage({ mode = 'all' }) {
  const titles = { all: ['FOLLOW YOUR CURIOSITY', 'Find your next good time.', 'Real places, real people, and experiences worth showing up for.'], weekend: ['MAKE ROOM FOR GOOD PLANS', 'Your weekend starts here.', 'Discover experiences happening from Friday through Sunday.'], near: ['CLOSER THAN YOU THINK', 'A little adventure, nearby.', 'Your neighbourhood could be hiding your new favourite experience.'], saved: ['KEEP THE GOOD ONES CLOSE', 'Your saved experiences.', 'A little collection of things you want to be part of.'] }
  const [eyebrow, title, subtitle] = titles[mode]
  return <CommunityLayout><section className="community-page-heading"><span className="vf-eyebrow"><SlidersHorizontal size={15} />{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></section><section className="community-container"><EventCollection mode={mode} /></section></CommunityLayout>
}
