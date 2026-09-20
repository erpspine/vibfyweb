import { hostLinks, hostState } from './hostLinks'
import { useState } from 'react'
import { ArrowUpRight, Bookmark, ChevronDown, LogOut, Menu, Store, Ticket, UserRound, X } from 'lucide-react'
import { api, clearSession, getSession } from '../api'
import { useRouter } from '../router'
import BrandLogo from '../components/BrandLogo'
import CommunityFooter from './CommunityFooter'
import { NotificationBell } from '../components/Notifications'

export function CommunityLink({ to, children, onClick, ...props }) {
  const { navigate } = useRouter()
  return <a href={to} {...props} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault(); onClick?.(); navigate(to)
  }}>{children}</a>
}

export default function CommunityHeader() {
  const { path, navigate } = useRouter()
  const session = getSession()
  const host = hostState(session)
  const [open, setOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const close = () => { setOpen(false); setAccountOpen(false) }
  async function logout() {
    setBusy(true)
    try { await api('/logout', { method: 'POST' }) } catch {} finally { clearSession(); close(); setBusy(false); navigate('/') }
  }
  return <header className="vf-nav community-nav" onKeyDown={e => { if (e.key === 'Escape') close() }}>
    <CommunityLink className="vf-brand" to="/" onClick={close} aria-label="Vibfy community home"><BrandLogo /></CommunityLink>
    <nav id="community-navigation" aria-label="Community navigation" className={open ? 'is-open' : ''}>
      {[['Home', '/'], ['Discover', '/discover'], ['This weekend', '/weekend'], ['Near me', '/near-me'], ['Saved', '/saved']].map(([label, to]) => <CommunityLink key={to} to={to} onClick={close} aria-current={path === to || (label === 'Home' && path === '/home') ? 'page' : undefined}>{label}</CommunityLink>)}
      {session?.token && <CommunityLink className="community-host-link" to={host.to} onClick={close}><Store size={15} />{host.label}<ArrowUpRight size={14} /></CommunityLink>}
      {session?.token ? <div className="community-account"><button className="community-account-trigger" aria-expanded={accountOpen} aria-controls="community-account-links" onClick={() => setAccountOpen(!accountOpen)}><UserRound size={18} /><span>{session.user?.name?.split(' ')[0] || 'My account'}</span><ChevronDown size={14} /></button>{accountOpen && <div className="community-account-menu" id="community-account-links"><small>ONE ACCOUNT. YOUR WHOLE VIBFY.</small><CommunityLink to="/profile" onClick={close}><UserRound />My profile</CommunityLink><CommunityLink to="/bookings" onClick={close}><Ticket />My bookings</CommunityLink><CommunityLink to="/saved" onClick={close}><Bookmark />Saved events</CommunityLink>{host.approved ? hostLinks.map(([Icon, label, to]) => <CommunityLink key={to} to={to} onClick={close}><Icon />{label}</CommunityLink>) : <CommunityLink to={host.to} onClick={close}><Store />{host.label}</CommunityLink>}<button onClick={logout} disabled={busy}><LogOut />{busy ? 'Signing out...' : 'Log out'}</button></div>}</div> : <CommunityLink className="vf-button" to="/login" onClick={close}>Join / Log in <ArrowUpRight size={16} /></CommunityLink>}
    </nav>
    {session?.token && <NotificationBell />}
    <button className="vf-menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-controls="community-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
  </header>
}

export function CommunityLayout({ children }) {
  return <div className="vf-landing community-page"><a className="vf-skip" href="#community-main">Skip to content</a><CommunityHeader /><main id="community-main">{children}</main><CommunityFooter /></div>
}
