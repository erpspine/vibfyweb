import {
  ArrowLeft,
  Eye,
  MapPin,
  Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui";
import { api } from "../../api";
import { useRouter } from "../../router";
import EventInformation from "../../components/EventInformation";
import EventLoading from "../../components/EventLoading";

export default function ViewEventPage() {
  const { navigate } = useRouter();
  const id = new URLSearchParams(window.location.search).get("id");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setData(null);
    setError("");
    if (!id) { setError("No event selected."); return; }
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
  const { event } = data;
  return (
    <div className="event-view-page">
      <button className="venue-back" onClick={() => navigate("/host/events")}>
        <ArrowLeft /> Back to events
      </button>
      <button className="secondary-button" onClick={() => navigate(`/host/preview/${id}`)}><Eye size={17} /> Preview as guest</button>
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
      <section className="panel" style={{ padding: 24 }}><EventInformation event={event} /></section>
    </div>
  );
}
