import { BadgeCheck, Image, MapPin, Plus, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, PageHeading } from "../../components/ui";
import { useRouter } from "../../router";
import { api } from "../../api";
import EventLoading from "../../components/EventLoading";

export default function VenuesPage() {
  const { navigate } = useRouter();
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/host/venues")
      .then((result) => setVenues(result.venues))
      .catch((problem) => setError(problem.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <PageHeading
        badge={
          <Badge tone="green">
            <Store size={13} />{" "}
            {venues.filter((venue) => venue.status === "active").length} active
          </Badge>
        }
        title="My venues"
        description="Keep your business information accurate and attractive to visitors."
      >
        <button
          className="primary-button"
          onClick={() => navigate("/host/venues/new")}
        >
          <Plus /> Add venue
        </button>
      </PageHeading>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      {loading && <EventLoading label="Loading your venues…" />}
      {!loading && !error && venues.length === 0 && (
        <section className="panel venue-empty">
          <Store />
          <h2>No venues yet</h2>
          <p>
            Add your first venue and submit it for administrator activation.
          </p>
          <button
            className="primary-button"
            onClick={() => navigate("/host/venues/new")}
          >
            <Plus /> Add venue
          </button>
        </section>
      )}
      <div className="venues-list">
        {venues.map((venue) => (
          <article className="venue-card" key={venue.id}>
            <div className="venue-image">
              <img
                src={venue.cover_image || "/images/venue-garden.png"}
                alt={venue.name}
              />
              <Badge tone={venue.status === "active" ? "green" : "amber"}>
                <BadgeCheck size={12} />{" "}
                {venue.status === "active" ? "Active" : "Awaiting activation"}
              </Badge>
              <button>
                <Image size={16} /> Cover photo
              </button>
            </div>
            <div className="venue-content">
              <div className="venue-title">
                <div>
                  <h2>{venue.name}</h2>
                  <p>
                    <MapPin /> {venue.address}, {venue.city}, Tanzania
                  </p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => navigate(`/host/venues/edit?id=${venue.id}`)}
                >
                  Edit profile
                </button>
              </div>
              <p className="venue-description">{venue.description}</p>
              <div className="venue-tags">
                <Badge>{venue.category}</Badge>
                {venue.amenities?.map((amenity) => (
                  <Badge key={amenity}>{amenity}</Badge>
                ))}
              </div>
              <div className="completion">
                <div>
                  <span>
                    {venue.status === "active"
                      ? "Visible in Vibfy"
                      : "Pending administrator review"}
                  </span>
                  <strong>
                    {venue.status === "active" ? "Active" : "Inactive"}
                  </strong>
                </div>
                <div>
                  <i
                    style={{
                      width: venue.status === "active" ? "100%" : "65%",
                    }}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
