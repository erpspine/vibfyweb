import { useEffect, useState } from 'react'
import { ArrowLeft, Bookmark, CalendarDays, MapPin, Ticket } from 'lucide-react'
import { api, getSession } from '../api'
import { useRouter } from '../router'
import { CommunityLayout, CommunityLink } from './CommunityHeader'
import { useSavedEvents } from './EventDiscovery'
import { eventDate, eventImage, eventPrice } from './events'

export default function EventDetails({ preview = false }) {
  const { path, navigate } = useRouter()
  const id = path.split('/').pop()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  const [booking, setBooking] = useState(null)
  const [bookingError, setBookingError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const { saved, toggle, saveError } = useSavedEvents()
  const session = getSession()
  useEffect(() => {
    let active = true; setEvent(null); setError(''); setBooking(null)
    api(`${preview ? '/host' : ''}/events/${encodeURIComponent(id)}`).then(data => { if (active) setEvent(data.event) }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [id, preview, retry])
  async function reserve(e) {
    e.preventDefault()
    if (!session?.token) { navigate(`/login?next=${encodeURIComponent(path)}`); return }
    setBusy(true); setBookingError('')
    try {
      const form = Object.fromEntries(new FormData(e.currentTarget))
      const result = await api(`/events/${id}/bookings`, { method: 'POST', body: JSON.stringify({ ...form, quantity: Number(quantity), payment_method: 'Pay at venue' }) })
      setBooking(result.booking)
    } catch (problem) { setBookingError(problem.message) } finally { setBusy(false) }
  }
  return <CommunityLayout><section className="community-container community-detail"><CommunityLink className="vf-text-link" to={preview ? `/host/events/view?id=${id}` : '/discover'}><ArrowLeft size={17} />{preview ? 'Back to event management' : 'Back to discovering'}</CommunityLink>{preview && <div className="community-notice">Guest preview. This view is only visible to your host team; bookings are disabled here.</div>}{error ? <div className="community-empty" role="alert"><h1>Event unavailable</h1><p>{error}</p><button className="vf-button" onClick={() => setRetry(retry + 1)}>Try again</button></div> : !event ? <div role="status" className="community-empty">Loading your next experience...</div> : <><div className="community-detail-cover"><img src={eventImage(event)} alt={event.name} /><span>{event.category}</span></div><div className="community-detail-grid"><div><span className="vf-eyebrow">MAKE A LITTLE ROOM FOR THIS</span><h1>{event.name}</h1><p className="community-detail-meta"><CalendarDays size={18} />{eventDate(event.starts_at)}</p><p className="community-detail-meta"><MapPin size={18} />{event.location_name || event.venue?.name}</p><h2>About the experience</h2><p className="community-description">{event.description}</p><h2>Where & when</h2><p>{event.location_address}</p><p className="community-muted">Starts: {eventDate(event.starts_at)}<br />Ends: {eventDate(event.ends_at)}</p>{event.latitude != null && event.longitude != null && <a className="vf-text-link" href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`} target="_blank" rel="noopener noreferrer">Open location in Maps <MapPin size={15} /></a>}</div><aside className="community-booking"><Ticket size={27} /><h2>{eventPrice(event)}</h2><p>{event.is_free ? 'A good time, without the ticket price.' : 'Reserve your place and pay at the venue.'}</p>{preview ? <p className="community-notice">Guests can reserve here once the event is published and the venue is active.</p> : new Date(event.ends_at) <= new Date() ? <p className="community-notice">This experience has ended.</p> : booking ? <div role="status"><h3>You're on the list!</h3><p>Reference: {booking.reference}</p><CommunityLink className="vf-button" to="/bookings">View my bookings</CommunityLink></div> : session?.token ? <form onSubmit={reserve}><label>Ticket holder<input name="holder_name" required maxLength={150} defaultValue={session.user?.name || ''} /></label><label>Contact email<input type="email" name="holder_email" defaultValue={session.user?.email || ''} /></label><label>Tickets<select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>{Array.from({ length: 10 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label><strong>Total: {event.is_free ? 'Free' : `${event.currency || 'TZS'} ${(Number(event.price) * quantity).toLocaleString()}`}</strong>{bookingError && <p role="alert" className="community-error">{bookingError}</p>}<button className="vf-button" disabled={busy}>{busy ? 'Reserving...' : 'Reserve my place'}</button></form> : <CommunityLink className="vf-button" to={`/login?next=${encodeURIComponent(path)}`}>Log in to reserve</CommunityLink>}{!preview && <button className="community-save-button" onClick={() => toggle(event)} aria-pressed={saved.some(item => item.id === event.id)}><Bookmark size={17} />{saved.some(item => item.id === event.id) ? 'Saved to this browser' : 'Save for later'}</button>}{saveError && <p role="alert">{saveError}</p>}</aside></div></>}</section></CommunityLayout>
}
