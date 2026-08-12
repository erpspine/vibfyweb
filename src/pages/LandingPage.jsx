import { ArrowRight, BarChart3, CalendarCheck2, Check, Heart, MapPin, Menu, Sparkles, Star, Store, TicketCheck, Users, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from '../router'

function Brand() { return <a className="public-brand" href="/" aria-label="Vibfy home"><span><Zap size={20} fill="currentColor" /></span>vibfy</a> }

export default function LandingPage() {
  const { navigate } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const go = (event, path) => { event.preventDefault(); setMenuOpen(false); navigate(path) }
  return <div className="public-page">
    <header className="public-nav"><Brand /><nav className={menuOpen ? 'open' : ''}><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#about">About Vibfy</a><a href="/login" onClick={(e) => go(e, '/login')} className="nav-login">Log in</a><a href="/signup" onClick={(e) => go(e, '/signup')} className="nav-cta">Become a host <ArrowRight size={15} /></a></nav><button className="public-menu" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></header>

    <main>
      <section className="landing-hero"><span className="hero-orb orb-one" /><span className="hero-orb orb-two" /><div className="hero-copy"><div className="eyebrow"><Sparkles size={14} /> The home of unforgettable experiences</div><h1>Turn your venue into the <em>place to be.</em></h1><p>Vibfy helps hosts publish standout events, reach the right crowd, and grow their business—all from one beautifully simple platform.</p><div className="landing-actions"><button className="public-primary" onClick={() => navigate('/signup')}>Start hosting <ArrowRight size={17} /></button><button className="public-secondary" onClick={() => document.querySelector('#how-it-works').scrollIntoView({ behavior: 'smooth' })}><span className="play-dot">▶</span> See how it works</button></div><div className="hero-proof"><div className="proof-faces"><span>JK</span><span>AM</span><span>SN</span><span>+</span></div><p><strong>Join 500+ hosts</strong><br />creating better nights across East Africa</p><div className="proof-rating"><Star fill="currentColor" /><strong>4.9</strong><span>host rating</span></div></div></div>
        <div className="hero-visual"><div className="visual-outline" /><div className="hero-photo"><img src="/images/afro-night.png" alt="A lively Vibfy event" /><span className="live-pill"><i /> LIVE THIS WEEKEND</span><button className="heart-float" aria-label="Save event"><Heart /></button><div className="event-float"><small>FEATURED EVENT</small><strong>Afro Night Nairobi</strong><p><MapPin /> The Alchemist · Saturday, 8:00 PM</p><div><span><Users /> 214 going</span><b>KES 1,500</b></div></div></div><div className="growth-float"><span><BarChart3 size={18} /></span><div><small>THIS MONTH</small><strong>+32% bookings</strong></div></div><div className="sold-float"><strong>2.4k</strong><span>tickets sold</span></div></div>
      </section>

      <section className="brand-strip"><span>Trusted by experiences at</span><strong>RAHA HOUSE</strong><strong>THE ALCHEMIST</strong><strong>GARDEN CITY</strong><strong>SKYLOUNGE</strong></section>

      <section className="landing-stats"><div><strong>500<span>+</span></strong><p>active hosts</p></div><i /><div><strong>120k<span>+</span></strong><p>happy guests</p></div><i /><div><strong>1,800<span>+</span></strong><p>experiences hosted</p></div><i /><div><strong>4.9<span>/5</span></strong><p>average host rating</p></div></section>

      <section className="landing-section" id="features"><div className="section-intro"><span>EVERYTHING YOU NEED</span><h2>Built for hosts who think bigger.</h2><p>Less admin, more energy. Vibfy puts every tool you need to run and grow your experiences in one place.</p></div><div className="feature-grid">
        <article><span className="feature-icon purple"><CalendarCheck2 /></span><h3>Publish in minutes</h3><p>Create beautiful event listings, manage schedules and update details without the busywork.</p><a href="/signup" onClick={(e) => go(e, '/signup')}>Create your first event <ArrowRight /></a></article>
        <article><span className="feature-icon pink"><TicketCheck /></span><h3>Sell more tickets</h3><p>Simple checkout, real-time guest lists and tools that turn interest into confirmed bookings.</p><a href="/signup" onClick={(e) => go(e, '/signup')}>Start selling <ArrowRight /></a></article>
        <article><span className="feature-icon cyan"><BarChart3 /></span><h3>Know what works</h3><p>See reach, sales and audience trends in one dashboard so your next move is your best one.</p><a href="/signup" onClick={(e) => go(e, '/signup')}>Explore insights <ArrowRight /></a></article>
      </div></section>

      <section className="how-section" id="how-it-works"><div className="how-image"><img src="/images/venue-garden.png" alt="A Vibfy partner venue" /><div><strong>4.9</strong><span>★★★★★<br /><small>Average host rating</small></span></div></div><div className="how-copy"><span>HOW IT WORKS</span><h2>Your next sold-out event starts here.</h2><ol><li><b>01</b><div><h3>Create your host profile</h3><p>Tell us about your business and venue. Our team reviews every host to keep Vibfy trusted.</p></div></li><li><b>02</b><div><h3>List your experiences</h3><p>Add the details, photos and ticket options that make your event impossible to miss.</p></div></li><li><b>03</b><div><h3>Welcome your crowd</h3><p>Track bookings, manage guests and use live insights to keep growing.</p></div></li></ol><button className="public-primary" onClick={() => navigate('/signup')}>Create your host account <ArrowRight size={17} /></button></div></section>

      <section className="about-section" id="about"><div><span>WHY VIBFY</span><h2>More than a listing.<br />A partner in your growth.</h2></div><div><p>We believe the best memories happen when people discover places that feel alive. Vibfy connects curious guests with exceptional hosts—and gives local experience businesses the technology to thrive.</p><div className="about-points"><span><Check /> Curated community</span><span><Check /> Local support</span><span><Check /> Secure payments</span><span><Check /> Actionable insights</span></div></div></section>

      <section className="testimonial-section"><div className="testimonial-photo"><img src="/images/live-band.png" alt="Live music experience hosted through Vibfy" /><span><i /> HOST STORY</span></div><div className="testimonial-copy"><div className="quote-stars"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div><blockquote>“Before Vibfy, we were juggling DMs, spreadsheets and payment screenshots. Now our whole team knows exactly what’s happening—and our events fill up faster.”</blockquote><div><span>RN</span><p><strong>Rita Njoki</strong><small>Founder, Raha House · Nairobi</small></p></div></div></section>

      <section className="landing-cta"><span><Store /></span><h2>Ready to fill your venue?</h2><p>Join the hosts shaping how East Africa goes out.</p><button onClick={() => navigate('/signup')}>Become a Vibfy host <ArrowRight size={17} /></button></section>
    </main>
    <footer className="public-footer"><Brand /><p>Discover. Experience. Remember.</p><div><a href="#features">Features</a><a href="#about">About</a><a href="/login" onClick={(e) => go(e, '/login')}>Portal login</a></div><small>© 2026 Vibfy. All rights reserved.</small></footer>
  </div>
}
