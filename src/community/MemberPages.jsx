import { useEffect, useState } from 'react'
import { ArrowUpRight, Bookmark, CalendarDays, Store, Ticket, Users } from 'lucide-react'
import { api, getSession } from '../api'
import { CommunityLayout, CommunityLink } from './CommunityHeader'
import { eventDate } from './events'
import VenueLocationMap from '../components/VenueLocationMap'

export function MemberProfile() {
  const session = getSession()
  return <CommunityLayout><section className="community-container community-profile"><span className="vf-eyebrow">YOUR COMMUNITY, YOUR WAY</span><h1>{session?.token ? `Hello, ${session.user?.name || 'Vibfy member'}.` : 'Make yourself at home.'}</h1><p>{session?.token ? session.user?.email || session.user?.phone : 'Join Vibfy to keep your bookings and host workspace together.'}</p>{!session?.token && <CommunityLink className="vf-button" to="/login?next=/profile">Join / Log in</CommunityLink>}<div className="community-profile-grid">{[[Ticket, 'My bookings', 'Your next plans, all in one place.', '/bookings'], [Bookmark, 'Saved experiences', 'The good times you want to come back to.', '/saved'], [Store, 'Your host experience', 'Bring your own community together.', session?.portalAccesses?.some(a => a.portal === 'host') ? '/host' : '/become-host']].map(([Icon, title, copy, to]) => <CommunityLink key={to} to={to}><Icon size={25} /><h2>{title}</h2><p>{copy}</p><ArrowUpRight size={20} /></CommunityLink>)}</div></section></CommunityLayout>
}

export function MemberBookings() {
  const session = getSession()
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (!session?.token) return
    let active = true; setError(''); setBookings(null)
    api('/bookings').then(data => { if (active) setBookings(data.bookings || []) }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [session?.token, revision])
  return <CommunityLayout><section className="community-container community-profile"><span className="vf-eyebrow">GOOD PLANS LIVE HERE</span><h1>Your bookings.</h1>{!session?.token ? <div className="community-empty"><Ticket /><h2>Log in to see your plans.</h2><CommunityLink className="vf-button" to="/login?next=/bookings">Log in</CommunityLink></div> : error ? <div role="alert" className="community-empty"><p>{error}</p><button className="vf-button" onClick={() => setRevision(revision + 1)}>Try again</button></div> : !bookings ? <p role="status">Loading bookings...</p> : !bookings.length ? <div className="community-empty"><Ticket /><h2>Your next chapter is unwritten.</h2><p>Discover an experience and reserve your place.</p><CommunityLink className="vf-button" to="/discover">Find an experience</CommunityLink></div> : <div className="community-booking-list">{bookings.map(item => <article key={item.id}><div><span className="vf-eyebrow">{item.reference}</span><h2>{item.event?.name || 'Event'}</h2><p><CalendarDays size={15} />{eventDate(item.event?.starts_at)}</p><p>{item.quantity} ticket(s) &middot; {item.status || 'Reserved'} &middot; Payment: {item.payment_method || item.payment_status}</p></div><CommunityLink className="vf-button" to={`/events/${item.event_id}`}>View event <ArrowUpRight size={16} /></CommunityLink></article>)}</div>}</section></CommunityLayout>
}

export function BecomeHost() {
  const session = getSession()
  const host = session?.portalAccesses?.find(a => a.portal === 'host')
  const [status, setStatus] = useState(host?.role || 'none'); const [error, setError] = useState(''); const [country, setCountry] = useState(''); const [position, setPosition] = useState({ lat: -3.3869, lng: 36.683 }); const [submitting, setSubmitting] = useState(false);
  const towns = { Tanzania: ['Arusha','Dar es Salaam','Dodoma','Mwanza','Zanzibar'], Kenya: ['Nairobi','Mombasa','Kisumu','Nakuru','Naivasha'] }
  if (!session?.token) return <CommunityLayout><section className="community-container community-empty"><h1>Become a host</h1><p>Verify your account first, then submit your venue.</p><CommunityLink className="vf-button" to="/signup?next=/become-host">Join the community first</CommunityLink></section></CommunityLayout>
  if (status === 'pending' || status === 'owner' || status === 'admin') return <CommunityLayout><section className="community-container community-empty"><Store size={32}/><h1>{status === 'pending' ? 'Application under review' : 'Your host workspace is ready'}</h1><p>{status === 'pending' ? 'An administrator will review your venue details.' : 'You can now add venues and publish events.'}</p>{status !== 'pending' && <CommunityLink className="vf-button" to="/host">Open host dashboard</CommunityLink>}</section></CommunityLayout>
  const submit = async (e) => { e.preventDefault(); setError(''); setSubmitting(true); try { const form = Object.fromEntries(new FormData(e.currentTarget)); const result = await api('/host/application', {method:'POST', body:JSON.stringify({...form, address:`Map location (${position.lat.toFixed(6)}, ${position.lng.toFixed(6)})`, latitude:position.lat, longitude:position.lng, price_range:'', amenities:[]})}); setStatus(result.status) } catch (e) { setError(e.message) } finally { setSubmitting(false) } }
  return <CommunityLayout><section className="community-container community-profile"><span className="vf-eyebrow">VERIFIED MEMBERS ONLY · EAST AFRICA</span><h1>Apply to become a host.</h1><p>Tell us about your first venue. Our team reviews every application.</p>{error && <div role="alert" className="community-notice">{error}</div>}<form className="community-form" onSubmit={submit}><div className="form-grid"><input name="name" required placeholder="Venue name"/><select name="category" required><option value="">Category</option><option>Restaurant</option><option>Bar & lounge</option><option>Club</option><option>Hotel</option><option>Event space</option><option>Outdoor venue</option></select><select name="country" required value={country} onChange={e => setCountry(e.target.value)}><option value="">Country</option><option>Tanzania</option><option>Kenya</option></select><select name="city" required disabled={!country}><option value="">Town / city</option>{(towns[country] || []).map(t => <option key={t}>{t}</option>)}</select><div className="venue-location-summary"><strong>Venue location</strong><span>Click the map or drag the pin to set the exact location.</span></div><VenueLocationMap position={position} onChange={point => setPosition({lat:point.lat,lng:point.lng})}/><input name="phone" required placeholder="Venue phone"/><label>Opening time<input name="opens_at" type="time" required/></label><label>Closing time<input name="closes_at" type="time" required/></label></div><textarea name="description" required minLength="30" placeholder="Tell us about your venue (at least 30 characters)"/><button className="vf-button" type="submit" disabled={submitting}>{submitting ? <><span className="form-spinner" aria-hidden="true" />Submitting application...</> : <>Submit application <ArrowUpRight size={16}/></>}</button></form></section></CommunityLayout>
}


