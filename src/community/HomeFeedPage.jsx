import { useEffect, useState } from 'react'
import { ArrowUpRight, Compass, Sparkles } from 'lucide-react'
import { api } from '../api'
import { CommunityLayout, CommunityLink } from './CommunityHeader'
import { EventCard, useSavedEvents } from './EventDiscovery'

export default function HomeFeedPage() {
  const [feed, setFeed] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const { saved, toggle } = useSavedEvents()
  useEffect(() => {
    let active = true
    setFeed(null); setError('')
    // Refresh the personalized feed on every mount. If that endpoint is temporarily
    // unavailable, the member can still use the same published events immediately.
    api('/home-feed').then(data => { if (active) setFeed(data) }).catch(() => api('/events').then(data => {
      if (!active) return
      const events = data.events || []
      setFeed({ happening_today: events.slice(0, 6), weekend_picks: events.slice(0, 6), hidden_gems: events.slice(0, 6), fallback: true })
    }).catch(problem => { if (active) setError(problem.message) }))
    return () => { active = false }
  }, [retry])
  const sections = feed ? [['HAPPENING TODAY', 'Right now, near you.', feed.happening_today], ['WEEKEND PICKS', 'Make a good plan.', feed.weekend_picks], ['HIDDEN GEMS', 'The places people are about to discover.', feed.hidden_gems]] : []
  return <CommunityLayout><section className="community-page-heading community-home-heading"><span className="vf-eyebrow"><Sparkles size={16} /> YOUR PERSONAL VIBFY</span><h1>Good morning.<br /><em>Find your feeling.</em></h1><p>A fresh mix of experiences picked from the places and people that make Vibfy feel alive.</p></section><section className="community-container community-feed">{error ? <div className="community-empty" role="alert"><Compass /><h2>We couldn't refresh your home feed.</h2><p>{error}</p><button className="vf-button" onClick={() => setRetry(value => value + 1)}>Try again</button></div> : !feed ? <div className="community-event-grid" role="status">{[1,2,3].map(n => <div className="community-skeleton" key={n}><span />Loading your feed...</div>)}</div> : <>{feed.fallback && <div className="community-notice"><Compass size={20} /><div><strong>Showing the latest published experiences.</strong><p>Your personalized feed is refreshing; these events are ready to explore now.</p></div></div>}{sections.map(([eyebrow, title, events]) => events?.length ? <section className="community-feed-section" key={eyebrow}><div className="vf-section-heading"><div><span className="vf-eyebrow">{eyebrow}</span><h2>{title}</h2></div><CommunityLink className="vf-text-link" to="/discover">See all <ArrowUpRight size={17} /></CommunityLink></div><div className="community-event-grid">{events.map((event, index) => <EventCard key={`${event.id}-${eyebrow}-${index}`} event={event} saved={saved.some(item => item.id === event.id)} onSave={toggle} />)}</div></section> : null)}{!sections.some(([, , events]) => events?.length) && <div className="community-empty"><Compass /><h2>Your next experience is still loading.</h2><CommunityLink className="vf-button" to="/discover">Discover Vibfy</CommunityLink></div>}</>}</section></CommunityLayout>
}
