const stores = [
  { name: 'Google Play', url: import.meta.env.VITE_GOOGLE_PLAY_URL, platform: 'google', label: 'GET IT ON' },
  { name: 'App Store', url: import.meta.env.VITE_APP_STORE_URL, platform: 'apple', label: 'Download on the' },
]

function StoreIcon({ platform }) {
  return platform === 'google' ? (
    <svg viewBox="0 0 32 36" aria-hidden="true"><path fill="#59c9f4" d="M2 2 19 18 2 34Z" /><path fill="#88d66b" d="m2 2 22 12-5 4Z" /><path fill="#ffd45d" d="m24 14 6 3q2 1 0 2l-6 3-5-4Z" /><path fill="#f47785" d="M2 34 19 18l5 4Z" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.1 1.1c.1 1.4-.5 2.8-1.3 3.8-.9 1-2.3 1.7-3.6 1.6-.2-1.4.5-2.8 1.3-3.7.9-1 2.4-1.7 3.6-1.7ZM20.6 17.2c-.5 1.2-.8 1.7-1.5 2.8-.9 1.4-2.2 3.1-3.7 3.1-1.3 0-1.7-.9-3.5-.9-1.7 0-2.2.9-3.5.9-1.4.1-2.7-1.5-3.6-2.9C2.3 16.3 1.7 11 3.3 8.6c1.1-1.7 2.8-2.7 4.5-2.7 1.4 0 2.4.9 3.5.9 1.1 0 2.1-.9 3.8-.9 1.5 0 3.1.8 4.2 2.1-3.7 2-3.1 7.2 1.3 9.2Z" /></svg>
  )
}

export default function AppDownloadBadges() {
  return <div className="vf-store-badges">{stores.map(store => {
    const available = /^https:\/\//i.test(store.url || '')
    const content = <><StoreIcon platform={store.platform} /><span><small>{available ? store.label : 'COMING SOON ON'}</small><strong>{store.name}</strong></span></>
    return available
      ? <a key={store.platform} className="vf-store-badge" href={store.url} target="_blank" rel="noopener noreferrer" aria-label={`Download Vibfy on ${store.name}`}>{content}</a>
      : <span key={store.platform} className="vf-store-badge is-coming-soon" aria-label={`Vibfy on ${store.name}: coming soon`}>{content}</span>
  })}</div>
}
