import { Check, MapPin, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, PageHeading } from "../../components/ui";
import { api } from "../../api";

export default function VenueApprovalsPage() {
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState("");
  const [activating, setActivating] = useState(null);
  useEffect(() => {
    api("/manager/venues/pending")
      .then((result) => setVenues(result.venues))
      .catch((problem) => setError(problem.message));
  }, []);
  const activate = async (venue) => {
    setActivating(venue.id);
    setError("");
    try {
      await api(`/manager/venues/${venue.id}/activate`, { method: "POST" });
      setVenues((current) => current.filter((item) => item.id !== venue.id));
    } catch (problem) {
      setError(problem.message);
    } finally {
      setActivating(null);
    }
  };
  return (
    <>
      <PageHeading
        badge={
          <Badge tone="amber">
            <Store size={13} /> {venues.length} pending
          </Badge>
        }
        title="Venue approvals"
        description="Review newly submitted venues before they become visible to Vibfy members."
      />
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <div className="approval-venue-grid">
        {venues.map((venue) => (
          <article className="panel approval-venue" key={venue.id}>
            <img src={venue.cover_image || "/images/venue-garden.png"} alt="" />
            <div>
              <Badge tone="amber">Inactive</Badge>
              <h2>{venue.name}</h2>
              <p>
                <MapPin /> {venue.address}, {venue.city}
              </p>
              <small>
                {venue.category} · {venue.latitude.toFixed(5)},{" "}
                {venue.longitude.toFixed(5)}
              </small>
              <button
                className="primary-button"
                onClick={() => activate(venue)}
                disabled={activating === venue.id}
              >
                <Check />{" "}
                {activating === venue.id ? "Activating…" : "Activate venue"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {!error && venues.length === 0 && (
        <section className="panel venue-empty">
          <Check />
          <h2>All caught up</h2>
          <p>There are no inactive venues waiting for activation.</p>
        </section>
      )}
    </>
  );
}
