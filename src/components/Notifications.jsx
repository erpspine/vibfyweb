import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Check, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { api, getSession } from '../api';
import { useRouter } from '../router';
import './notifications.css';

export function NotificationBell() {
  const { path, navigate } = useRouter();
  const [count, setCount] = useState(0);
  const token = getSession()?.token;
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const result = await api('/notifications?unread=1', { showErrorAlert: false });
        if (active) setCount(result.unread_count);
      } catch { /* Background polling must not interrupt the current page. */ }
    };
    if (!token) { setCount(0); return; }
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    window.addEventListener('vibfy-notifications', refresh);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('vibfy-notifications', refresh); };
  }, [token]);
  return <button className="notification-bell" title="Notifications" aria-label={`Notifications${count ? `, ${count} unread` : ''}`} onClick={() => navigate(path.startsWith('/manager') ? '/manager/notifications' : '/notifications')}><Bell size={21} />{count > 0 && <span>{count > 99 ? '99+' : count}</span>}</button>;
}

export default function Notifications() {
  const { navigate } = useRouter();
  const [unread, setUnread] = useState(false);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api(`/notifications?page=${page}&unread=${unread ? 1 : 0}`, { showErrorAlert: false })
      .then(data => {
        if (!active) return;
        if (page > data.notifications.last_page) { setPage(data.notifications.last_page); return; }
        setResult(data);
      })
      .catch(problem => { if (active) setError(problem.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, unread, revision]);
  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    const timer = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  async function markRead(item, open = false) {
    setBusy(true); setError('');
    try {
      if (!item?.read_at) await api(item ? `/notifications/${item.id}/read` : '/notifications/read-all', { method: 'PATCH', showErrorAlert: false });
      window.dispatchEvent(new Event('vibfy-notifications'));
      setRevision(value => value + 1);
      const url = item?.data?.url;
      if (open && url?.startsWith('/') && !url.startsWith('//')) navigate(url);
    } catch (problem) { setError(problem.message); }
    finally { setBusy(false); }
  }
  return <section className="notification-page" aria-labelledby="notification-title">
    <div className="notification-heading"><div><div className="notification-eyebrow">VIBFY ACTIVITY</div><h1 id="notification-title">Notifications</h1><p>{result ? `${result.unread_count} unread` : 'Your activity'}</p></div><button disabled={busy || loading || !result?.unread_count} onClick={() => markRead(null)}><CheckCheck size={18} />Mark all as read</button></div>
    <div className="notification-toolbar"><div role="group" aria-label="Notification filter">{['All', 'Unread'].map((label, index) => <button key={label} aria-pressed={unread === Boolean(index)} onClick={() => { setUnread(Boolean(index)); setPage(1); }}>{label}</button>)}</div><button aria-label="Refresh notifications" title="Refresh notifications" disabled={loading} onClick={() => setRevision(value => value + 1)}><RefreshCw size={18} /></button></div>
    {error && <p role="alert" className="notification-error">{error}</p>}
    {loading ? <p role="status" className="notification-empty">Loading notifications...</p> : !error && !result?.notifications.data.length ? <div className="notification-empty"><Bell size={28} /><h2>{unread ? 'You are all caught up' : 'No notifications yet'}</h2></div> : <ul className="notification-list">{result?.notifications.data.map(item => <li key={item.id} className={item.read_at ? '' : 'is-unread'}><Bell size={20} aria-hidden="true" /><button className="notification-content" disabled={busy} onClick={() => markRead(item, true)}><strong>{item.data.title}</strong><span>{item.data.message}</span><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time></button>{!item.read_at && <button disabled={busy} title="Mark as read" aria-label={`Mark ${item.data.title} as read`} onClick={() => markRead(item)}><Check size={19} /></button>}</li>)}</ul>}
    {result?.notifications.last_page > 1 && <div className="notification-pagination"><button disabled={loading || page === 1} aria-label="Previous page" onClick={() => setPage(value => value - 1)}><ChevronLeft size={18} /></button><span>Page {page} of {result.notifications.last_page}</span><button disabled={loading || page >= result.notifications.last_page} aria-label="Next page" onClick={() => setPage(value => value + 1)}><ChevronRight size={18} /></button></div>}
  </section>;
}
