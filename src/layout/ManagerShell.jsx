import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, ChevronDown, ChevronsLeft, ChevronsRight, CreditCard, FileCheck2, Heart, House, LogOut, MapPin, Megaphone, Menu, Search, Settings, ShieldCheck, Users, X } from 'lucide-react';
import { api, clearSession, getSession } from '../api';
import { useRouter } from '../router';
import './manager.css';
import { NotificationBell } from '../components/Notifications';

const DashboardContext = createContext(null);
export const useManagerDashboard = () => useContext(DashboardContext);
const links = [
  ['Dashboard', '/manager', House], ['Events', '/manager/events', CalendarDays], ['Host Approvals', '/manager/hosts', FileCheck2],
  ['Venue Approvals', '/manager/venues', MapPin], ['Subscriptions', '/manager/subscriptions', CreditCard],
  ['Advertising', '/manager/advertising', Megaphone],
  ['Users', '/manager/users', Users],
];

export default function ManagerShell({ children }) {
  const { path, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const user = getSession()?.user;
  const name = user?.name || 'Administrator';
  const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api('/manager/dashboard' + (city ? '?city=' + encodeURIComponent(city) : ''))
      .then(result => { if (active) setData(result); })
      .catch(problem => { if (active) setError(problem.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [city, revision, path]);
  useEffect(() => {
    const close = event => { if (!menuRef.current?.contains(event.target)) setMenu(null); };
    const escape = event => { if (event.key === 'Escape') { setMenu(null); setMobileOpen(false); mobileMenuRef.current?.focus(); } };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, []);
  const go = target => { navigate(target); setMobileOpen(false); setMenu(null); };
  const logout = async () => {
    setLoggingOut(true);
    try { await api('/logout', { method: 'POST' }); }
    catch { /* Local sign out remains available when the server is unreachable. */ }
    finally { clearSession(); go('/admin/login'); }
  };
  return <DashboardContext.Provider value={{ data, error, loading, search, city, retry: () => setRevision(value => value + 1) }}>
    <div className={`manager-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <aside className={`manager-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Admin sidebar">
        <div className="manager-brand-row"><a href="/manager" onClick={event => { event.preventDefault(); go('/manager'); }} className="manager-brand"><span className="manager-wordmark"><span className="manager-brand-symbol" aria-hidden="true" /><strong>Vibfy</strong></span><small>DISCOVER. LIVE. BELONG.</small></a><button className="manager-icon desktop-collapse" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(value => !value)}>{collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}</button><button className="manager-icon mobile-close-nav" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button></div>
        <nav aria-label="Admin navigation">{links.map(([label, to, Icon]) => <a key={to} href={to} title={collapsed ? label : undefined} aria-current={path === to ? 'page' : undefined} onClick={event => { event.preventDefault(); go(to); }}><Icon size={21} /><span>{label}</span>{to === '/manager/events' && data?.event_count != null && <b aria-label={`${data.event_count} events`}>{data.event_count.toLocaleString()}</b>}{to === '/manager/venues' && data?.pending?.venues > 0 && <b>{data.pending.venues}</b>}</a>)}<div className="manager-nav-divider" /><a href="/discover" title={collapsed ? 'Community' : undefined} onClick={event => { event.preventDefault(); go('/discover'); }}><Heart size={21} /><span>Community</span></a><a href="/profile" title={collapsed ? 'Account Settings' : undefined} onClick={event => { event.preventDefault(); go('/profile'); }}><Settings size={21} /><span>Account Settings</span></a></nav>
        <div className="manager-promo"><strong>Let's create<br />unforgettable<br />experiences!</strong><button onClick={() => go('/manager/venues')}>Review Venues <ArrowRight size={16} /></button></div>
        <div className="manager-nav-bottom"><ShieldCheck size={20} /><span>System Manager</span></div>
      </aside>
      {mobileOpen && <button className="manager-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <div className="manager-main">
        <header className="manager-topbar">
          <button ref={mobileMenuRef} className="manager-icon mobile-open-nav" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          <form className="manager-search" role="search" onSubmit={event => { event.preventDefault(); if (path !== '/manager') go('/manager'); }}><Search size={19} /><input aria-label="Search events and venues" placeholder="Search events or venues..." value={search} onChange={event => setSearch(event.target.value)} />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={16} /></button>}</form>
          <label className="manager-location"><MapPin size={20} /><select aria-label="Filter dashboard by location" value={city} onChange={event => { setCity(event.target.value); if (path !== '/manager') go('/manager'); }}><option value="">All locations</option>{data?.locations?.map(location => <option key={location}>{location}</option>)}</select><ChevronDown size={14} /></label>
          <div className="manager-account-actions" ref={menuRef}>
            <NotificationBell />
            <button className="manager-account" aria-label="Open account menu" aria-expanded={menu === 'account'} onClick={() => setMenu(menu === 'account' ? null : 'account')}><span className="manager-avatar">{initials}</span><span><strong>{name}</strong><small>Admin</small></span><ChevronDown size={16} /></button>
            {menu === 'account' && <div className="manager-dropdown"><strong>{name}</strong><small>{user?.email}</small><button onClick={() => go('/profile')}><Settings size={17} />Account Settings</button><button onClick={logout} disabled={loggingOut}><LogOut size={17} />{loggingOut ? 'Signing out...' : 'Sign out'}</button></div>}
          </div>
        </header>
        <main className={`manager-content ${path !== '/manager' && path !== '/manager/events' ? 'manager-legacy' : ''}`}>{children}</main>
        <footer className="manager-footer">
          <div className="manager-footer-top">
            <div className="manager-footer-brand">
              <a href="/manager" aria-label="Vibfy admin home" onClick={event => { event.preventDefault(); go('/manager'); }}><strong>Vibfy<span>.</span></strong><span className="manager-footer-label">ADMIN WORKSPACE</span></a>
              <p>Discover. Live. Belong.</p>
            </div>
            <nav className="manager-footer-links" aria-label="Admin footer navigation">
              <a href="/manager" onClick={event => { event.preventDefault(); go('/manager'); }}>Dashboard</a>
              <a href="/profile" onClick={event => { event.preventDefault(); go('/profile'); }}>Account settings</a>
              <a className="manager-footer-community" href="/discover" onClick={event => { event.preventDefault(); go('/discover'); }}>Explore community <ArrowRight size={15} aria-hidden="true" /></a>
            </nav>
          </div>
          <div className="manager-footer-bottom">
            <small>&copy; {new Date().getFullYear()} Vibfy. All rights reserved.</small>
            <span><ShieldCheck size={15} aria-hidden="true" /> Administrator workspace</span>
          </div>
        </footer>
      </div>
    </div>
  </DashboardContext.Provider>;
}
