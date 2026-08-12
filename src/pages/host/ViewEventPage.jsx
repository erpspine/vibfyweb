import {
  ArrowLeft,
  CalendarDays,
  Eye,
  MapPin,
  Pencil,
  TicketCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui";
import { api, apiUrl } from "../../api";
import { useRouter } from "../../router";
import EventLoading from "../../components/EventLoading";

export default function ViewEventPage() {
  const { navigate } = useRouter();
  const id = new URLSearchParams(window.location.search).get("id");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const backendUrl = apiUrl.replace(/\/api\/v1$/, "");
  const mediaUrl = (url) =>
    url?.startsWith("/storage/") ? `${backendUrl}${url}` : url;
  useEffect(() => {
    if (id)
      api(`/host/events/${id}`)
        .then(setData)
        .catch((problem) => setError(problem.message));
  }, [id]);
  if (error)
    return (
      <section className="panel venue-empty">
        <h2>Event unavailable</h2>
        <p>{error}</p>
        <button
          className="secondary-button"
          onClick={() => navigate("/host/events")}
        >
          Back to events
        </button>
      </section>
    );
  if (!data) return <EventLoading label="Loading event…" />;
  if (false && !data)
    return <section className="panel venue-loading">Loading event…</section>;
  const { event, performance } = data;
  return (
    <div className="event-view-page">
      <button className="venue-back" onClick={() => navigate("/host/events")}>
        <ArrowLeft /> Back to events
      </button>
      <div className="event-view-heading">
        <div>
          <Badge tone={event.status === "published" ? "green" : "neutral"}>
            {event.status}
          </Badge>
          <h1>{event.name}</h1>
          <p>
            <MapPin /> {event.location_name} · {event.location_address}
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => navigate(`/host/events/edit?id=${event.id}`)}
        >
          <Pencil /> Edit event
        </button>
      </div>
      <div className="event-performance-grid">
        <div>
          <span className="metric-icon purple">
            <Eye />
          </span>
          <small>Page views</small>
          <strong>{performance.views.toLocaleString()}</strong>
        </div>
        <div>
          <span className="metric-icon green">
            <TicketCheck />
          </span>
          <small>Tickets sold</small>
          <strong>{performance.tickets_sold.toLocaleString()}</strong>
        </div>
        <div>
          <span className="metric-icon pink">
            <TrendingUp />
          </span>
          <small>Conversion rate</small>
          <strong>{performance.conversion_rate}%</strong>
        </div>
        <div>
          <span className="metric-icon amber">
            <Wallet />
          </span>
          <small>Revenue</small>
          <strong>TSh {Number(performance.revenue).toLocaleString()}</strong>
        </div>
      </div>
      <div className="event-view-layout">
        <section className="panel event-view-details">
          <h2>Event information</h2>
          <p>{event.description}</p>
          <div>
            <span>
              <CalendarDays />
              <small>Starts</small>
              <strong>{new Date(event.starts_at).toLocaleString()}</strong>
            </span>
            <span>
              <CalendarDays />
              <small>Ends</small>
              <strong>{new Date(event.ends_at).toLocaleString()}</strong>
            </span>
            <span>
              <TicketCheck />
              <small>Admission</small>
              <strong>
                {event.is_free
                  ? "Free"
                  : `TSh ${Number(event.price).toLocaleString()}`}
              </strong>
            </span>
            <span>
              <MapPin />
              <small>Host venue</small>
              <strong>{event.venue.name}</strong>
            </span>
          </div>
        </section>
        <section className="panel event-view-media">
          <h2>Media</h2>
          <div>
            {event.media?.map((item) =>
              item.type === "video" ? (
                <video key={item.url} src={mediaUrl(item.url)} controls />
              ) : (
                <img
                  key={item.url}
                  src={mediaUrl(item.url)}
                  alt={item.name || event.name}
                />
              ),
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
