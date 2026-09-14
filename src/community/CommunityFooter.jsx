import { ArrowUpRight, Heart, MapPin, Sparkles } from 'lucide-react'
import { CommunityLink } from './CommunityHeader'
import { getSession } from '../api'
import AppDownloadBadges from '../components/AppDownloadBadges'
import BrandLogo from '../components/BrandLogo'

export default function CommunityFooter() {
  const session = getSession()
  return <footer className="community-footer">
    <div className="community-footer-invite"><div><span className="vf-eyebrow"><Sparkles size={16} /> YOUR NEXT GOOD STORY STARTS HERE</span><h2>Go out. Feel alive.<br /><em>Find where you belong.</em></h2></div><CommunityLink className="vf-button vf-lime" to="/discover">Find your next experience <ArrowUpRight size={19} /></CommunityLink></div>
    <div className="community-footer-grid">
      <div className="community-footer-brand"><CommunityLink to="/" aria-label="Vibfy community home"><BrandLogo /></CommunityLink><p>For the nights you remember.<br />The places you love.<br />The people who make it all worthwhile.</p><span><MapPin size={14} /> Rooted in East Africa. Open to you.</span></div>
      <nav aria-label="Explore Vibfy"><h3>Find your vibe</h3><CommunityLink to="/discover">Discover experiences</CommunityLink><CommunityLink to="/weekend">This weekend</CommunityLink><CommunityLink to="/near-me">Near you</CommunityLink><CommunityLink to="/saved">Saved experiences</CommunityLink></nav>
      <nav aria-label="Vibfy community"><h3>Be part of it</h3><CommunityLink to="/signup">Join the community</CommunityLink>{session?.token && <CommunityLink to="/become-host">Become a host</CommunityLink>}<CommunityLink to="/bookings">My bookings</CommunityLink><CommunityLink to="/login">Member login</CommunityLink></nav>
      <div className="community-footer-download"><h3>Take the good times with you</h3><p>A little less scrolling.<br />A little more living.</p><AppDownloadBadges /></div>
    </div>
    <div className="community-footer-bottom"><small>&copy; {new Date().getFullYear()} Vibfy. All rights reserved.</small><span>One account. One community. Endless possibilities.</span><span>Made for real connection <Heart size={13} /></span></div>
  </footer>
}
