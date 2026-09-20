import { apiUrl } from '../api';
import './event-information.css';

const date = value => value ? new Date(value).toLocaleString() : 'Not provided';
const number = value => Number(value ?? 0).toLocaleString();

export default function EventInformation({ event }) {
  const currency = event.currency || 'TZS';
  const views = Number(event.views_count || 0);
  const conversion = views > 0 ? (Number(event.tickets_sold || 0) / views * 100).toFixed(1) : '0';
  const details = [
    ['Category', event.category || 'Not provided'],
    ['Status', event.status],
    ['Host', event.venue?.owner?.name],
    ['Host email', event.venue?.owner?.email],
    ['Venue', event.venue?.name || 'Not provided'],
    ['Starts', date(event.starts_at)],
    ['Ends', date(event.ends_at)],
    ['Admission', event.is_free ? 'Free' : `${currency} ${number(event.price)}`],
    ['Location type', event.location_type === 'custom' ? 'Custom location' : 'Host venue'],
    ['Location', event.location_name || 'Not provided'],
    ['Address', event.location_address || 'Not provided'],
    ['Coordinates', event.latitude != null && event.longitude != null ? `${event.latitude}, ${event.longitude}` : 'Not provided'],
    ['Created', date(event.created_at)],
    ['Last updated', date(event.updated_at)],
  ];
  return <div className="event-information">
    <h2>Performance</h2>
    <div className="event-information-metrics">{[
      ['Page views', number(event.views_count)], ['Tickets sold', number(event.tickets_sold)],
      ['Revenue', `${currency} ${number(event.revenue)}`], ['Conversion rate', `${conversion}%`],
    ].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
    <p className="event-information-note">Lifetime totals. Conversion rate is tickets sold divided by page views.</p>
    <h2>Event details</h2>
    <dl>{details.filter(([, value]) => value != null).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <h2>Description</h2><p className="event-information-description">{event.description || 'No description provided.'}</p>
    <h2>Media</h2>
    {event.media?.length ? <div className="event-information-media">{event.media.map((item, index) => {
      const src = item.url?.startsWith('/storage/') ? `${apiUrl.replace(/\/api\/v1$/, '')}${item.url}` : item.url;
      return item.type === 'video' ? <video key={index} src={src} controls preload="metadata" /> : <img key={index} src={src} alt={item.name || event.name} loading="lazy" />;
    })}</div> : <p>No media uploaded.</p>}
  </div>;
}
