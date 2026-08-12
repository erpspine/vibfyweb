import {
  CalendarDays,
  MapPin,
  MoreHorizontal,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  TicketCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, PageHeading } from "../../components/ui";
import { api, apiUrl } from "../../api";
import { useRouter } from "../../router";
import Swal from "sweetalert2";
import EventLoading from "../../components/EventLoading";

export default function EventsPage() {
  const backendUrl = apiUrl.replace(/\/api\/v1$/, "");
  const { navigate } = useRouter();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);
  const [loading, setLoading] = useState(true);
  const mediaUrl = (url) =>
    url?.startsWith("/storage/") ? `${backendUrl}${url}` : url;
  const changePublication = async (event) => {
    const status = event.status === "published" ? "draft" : "published";
    const confirmation = await Swal.fire({
      title:
        status === "published"
          ? "Publish this event?"
          : "Unpublish this event?",
      text:
        status === "published"
          ? "It will become visible in the Vibfy member app."
          : "It will be removed from the Vibfy member app.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText:
        status === "published" ? "Yes, publish" : "Yes, unpublish",
      confirmButtonColor: "#8b4ee8",
      background: "#17131b",
      color: "#f7f4fb",
    });
    if (!confirmation.isConfirmed) return;
    setUpdating(event.id);
    setError("");
    try {
      const result = await api(`/host/events/${event.id}/publication`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setEvents((current) =>
        current.map((item) => (item.id === event.id ? result.event : item)),
      );
    } catch (problem) {
      setError(problem.message);
    } finally {
      setUpdating(null);
    }
  };
  useEffect(() => {
    api("/host/events")
      .then((result) => setEvents(result.events))
      .catch((problem) => setError(problem.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <PageHeading
        badge={
          <Badge tone="purple">
            <CalendarDays size={13} /> Event studio
          </Badge>
        }
        title="Events"
        description="Create, publish and track every experience at your venues."
      >
        <button
          className="primary-button"
          onClick={() => navigate("/host/events/new")}
        >
          <Plus /> Create event
        </button>
      </PageHeading>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      {loading && <EventLoading label="Loading your events…" />}
      {!loading && !error && events.length === 0 && (
        <section className="panel venue-empty">
          <CalendarDays />
          <h2>No events yet</h2>
          <p>Create your first event and connect it to one of your venues.</p>
          <button
            className="primary-button"
            onClick={() => navigate("/host/events/new")}
          >
            <Plus /> Create event
          </button>
        </section>
      )}
      {!loading && (
        <div className="event-board">
          {events.map((event) => (
            <article className="event-card" key={event.id}>
              <div className="event-cover">
                {event.media?.[0]?.type === "video" ? (
                  <video src={mediaUrl(event.media[0].url)} muted />
                ) : (
                  <img
                    src={
                      event.media?.[0]?.url
                        ? mediaUrl(event.media[0].url)
                        : "/images/afro-night.png"
                    }
                    alt=""
                  />
                )}
                <Badge
                  tone={event.status === "published" ? "green" : "neutral"}
                >
                  {event.status}
                </Badge>
              </div>
              <div className="event-card-body">
                <small>
                  {new Date(event.starts_at).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </small>
                <h2>{event.name}</h2>
                <p>
                  <MapPin /> {event.location_name}
                </p>
                <div>
                  <span>
                    <TicketCheck />{" "}
                    {event.is_free
                      ? "Free"
                      : `TSh ${Number(event.price).toLocaleString()}`}
                  </span>
                </div>
                <div className="event-card-actions">
                  <button
                    onClick={() => navigate(`/host/events/view?id=${event.id}`)}
                  >
                    <Eye /> View
                  </button>
                  <button
                    onClick={() => navigate(`/host/events/edit?id=${event.id}`)}
                  >
                    <Pencil /> Edit
                  </button>
                  <button
                    className="event-publish-button"
                    onClick={() => changePublication(event)}
                    disabled={updating === event.id}
                  >
                    {event.status === "published" ? (
                      <>
                        <EyeOff /> Unpublish
                      </>
                    ) : (
                      <>Publish</>
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
