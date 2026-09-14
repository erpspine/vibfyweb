import { apiUrl } from '../api'

export const categories = ['Music', 'Nightlife', 'Food', 'Safari', 'Culture', 'Sports', 'Adventure', 'Wellness', 'Family', 'Shopping', 'Festivals', 'Networking']
export function eventImage(event) {
  const source = event.media?.find(item => item.type === 'image')?.url
  if (!source) return '/images/experiences-hero.png'
  return source.startsWith('/storage/') ? `${apiUrl.replace(/\/api\/v1$/, '')}${source}` : source
}
export function eventDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date to be announced' : date.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
export function eventPrice(event) {
  return event.is_free ? 'Free entry' : `${event.currency || 'TZS'} ${Number(event.price || 0).toLocaleString()}`
}
export function isThisWeekend(event, now = new Date()) {
  const start = new Date(now); start.setHours(0, 0, 0, 0)
  const day = start.getDay()
  start.setDate(start.getDate() + (day === 0 ? -2 : day === 6 ? -1 : 5 - day))
  const end = new Date(start); end.setDate(end.getDate() + 3)
  return new Date(event.starts_at) < end && new Date(event.ends_at) > start
}
export function distanceKm(event, position) {
  if (event.latitude == null || event.longitude == null || !position) return Infinity
  const rad = n => n * Math.PI / 180
  const a = Math.sin(rad(event.latitude - position.latitude) / 2) ** 2 + Math.cos(rad(position.latitude)) * Math.cos(rad(event.latitude)) * Math.sin(rad(event.longitude - position.longitude) / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)))
}
