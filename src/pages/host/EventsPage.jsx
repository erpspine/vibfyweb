import {
  CalendarDays,
  MapPin,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  TicketCheck,
  Megaphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, PageHeading } from "../../components/ui";
import { api, apiUrl } from "../../api";
import { useRouter } from "../../router";
import Swal from "sweetalert2";
import EventLoading from "../../components/EventLoading";

const alertTheme = {
  background: "#17111f", color: "#fbf8ff", buttonsStyling: false,
  customClass: { popup: "vibfy-swal", title: "vibfy-swal-title", htmlContainer: "vibfy-swal-copy", actions: "vibfy-swal-actions", confirmButton: "vibfy-swal-confirm", cancelButton: "vibfy-swal-cancel", icon: "vibfy-swal-icon" },
};
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character]);

const successToast = (title, message) => Swal.fire({
  ...alertTheme, toast: true, position: "top-end", icon: "success", title,
  text: message, showConfirmButton: false, timer: 4200, timerProgressBar: true,
  customClass: { ...alertTheme.customClass, popup: "vibfy-swal vibfy-toast" },
});

const failureAlert = (message) => Swal.fire({
  ...alertTheme, icon: "error", title: "We couldn't complete that",
  html: `<p>${escapeHtml(message)}</p><small>Your event has not been changed. Please try again.</small>`,
  confirmButtonText: "Okay, try again",
});

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
      ...alertTheme,
      title:
        status === "published"
          ? "Publish this event?"
          : "Unpublish this event?",
      html: status === "published"
        ? `<p><strong>${escapeHtml(event.name)}</strong> will become visible to Vibfy members.</p><small>You can unpublish it at any time.</small>`
        : `<p><strong>${escapeHtml(event.name)}</strong> will be removed from the member app.</p><small>Your event information will remain safely saved.</small>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText:
        status === "published" ? "Yes, publish" : "Yes, unpublish",
      cancelButtonText: "Keep as it is",
      reverseButtons: true,
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
      successToast(
        status === "published" ? "Event is now live ✨" : "Event unpublished",
        status === "published" ? `${event.name} is visible in the Vibfy app.` : `${event.name} has been removed from public listings.`,
      );
    } catch (problem) {
      failureAlert(problem.message);
    } finally {
      setUpdating(null);
    }
  };
  const applyForAdvertisement = async (event) => {
    const confirmation = await Swal.fire({
      ...alertTheme,
      title: event.advertisement?.status === "rejected" ? "Resubmit this advert?" : "Make this event stand out?",
      html: `<p>Apply to feature <strong>${escapeHtml(event.name)}</strong> prominently in the Vibfy member app.</p><div class="vibfy-alert-note"><span>✦</span><div><b>Manager approval required</b><small>Our team will review your event before it becomes featured.</small></div></div>`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: event.advertisement?.status === "rejected" ? "Resubmit advert" : "Apply for advertising",
      cancelButtonText: "Maybe later",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;
    setUpdating(event.id);
    try {
      const result = await api(`/host/events/${event.id}/advertisements`, { method: "POST" });
      setEvents((current) => current.map((item) => item.id === event.id
        ? { ...item, advertisement: result.advertisement }
        : item));
      successToast("Application sent 🚀", "A Vibfy manager will review your event and notify you after approval.");
    } catch (problem) { failureAlert(problem.message); }
    finally { setUpdating(null); }
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
                  {event.status === "published" && (
                    <button
                      onClick={() => applyForAdvertisement(event)}
                      disabled={updating === event.id || event.advertisement?.status === "pending" || event.advertisement?.status === "approved"}
                      title={event.advertisement?.review_note || ""}
                    >
                      <Megaphone /> {event.advertisement?.status === "approved"
                        ? "Featured"
                        : event.advertisement?.status === "pending"
                          ? "Ad pending"
                          : event.advertisement?.status === "rejected"
                            ? "Reapply advert"
                            : "Apply for advert"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
