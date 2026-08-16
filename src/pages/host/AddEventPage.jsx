import {
  ArrowLeft,
  CalendarDays,
  Check,
  ImagePlus,
  MapPin,
  Search,
  Ticket,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Badge } from "../../components/ui";
import VenueLocationMap from "../../components/VenueLocationMap";
import { api, apiUrl } from "../../api";
import { useRouter } from "../../router";
import EventLoading from "../../components/EventLoading";
import { showFailureAlert, showSuccessToast } from "../../alerts";

const eventCategories = [
  "Music", "Nightlife", "Food", "Safari", "Culture", "Sports",
  "Adventure", "Wellness", "Family", "Shopping", "Festivals", "Networking",
];

const geocodingUrl =
  import.meta.env.VITE_GEOCODING_URL || "https://nominatim.openstreetmap.org";

export default function AddEventPage({ mode = "create" }) {
  const { navigate } = useRouter();
  const editing = mode === "edit";
  const eventId = new URLSearchParams(window.location.search).get("id");
  const [venues, setVenues] = useState([]);
  const [venueId, setVenueId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFree, setIsFree] = useState(true);
  const [locationType, setLocationType] = useState("venue");
  const [position, setPosition] = useState({ lat: -3.3869, lng: 36.683 });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [media, setMedia] = useState([]);
  const [saving, setSaving] = useState(false);
  const [publishNow, setPublishNow] = useState(false);
  const [error, setError] = useState("");
  const [eventData, setEventData] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(editing && Boolean(eventId));

  useEffect(() => {
    api("/host/venues")
      .then(({ venues: list }) => {
        setVenues(list);
        if (list[0] && !editing) setVenueId(list[0].id);
      })
      .catch((problem) => setError(problem.message));
  }, [editing]);
  useEffect(() => {
    if (!editing || !eventId) return;
    api(`/host/events/${eventId}`)
      .then(({ event }) => {
        setEventData(event);
        setVenueId(event.venue_id);
        setStartDate(new Date(event.starts_at));
        setEndDate(new Date(event.ends_at));
        setIsFree(event.is_free);
        setLocationType(event.location_type);
        setPosition({ lat: event.latitude, lng: event.longitude });
        setQuery(event.location_address || "");
        setPublishNow(event.status === "published");
        setMedia(
          (event.media || []).map((item) => ({
            ...item,
            preview: item.url,
            existing: true,
          })),
        );
      })
      .catch((problem) => setError(problem.message))
      .finally(() => setLoadingEvent(false));
  }, [editing, eventId]);
  useEffect(() => {
    if (locationType !== "venue") return;
    const venue = venues.find((item) => item.id === venueId);
    if (venue) setPosition({ lat: venue.latitude, lng: venue.longitude });
  }, [locationType, venueId, venues]);
  useEffect(
    () => () =>
      media
        .filter((item) => !item.existing)
        .forEach((item) => URL.revokeObjectURL(item.preview)),
    [media],
  );

  const addMedia = (event) => {
    const files = [...event.target.files];
    const accepted = files.filter((file) => file.size <= 20 * 1024 * 1024);
    if (accepted.length !== files.length)
      setError("Each photo or video must be smaller than 20 MB.");
    setMedia((current) =>
      [...current, ...accepted].slice(0, 8).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      })),
    );
    event.target.value = "";
  };
  const removeMedia = (index) =>
    setMedia((current) => {
      if (!current[index].existing) URL.revokeObjectURL(current[index].preview);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });

  const searchLocation = async () => {
    if (query.trim().length < 3) {
      setError("Enter at least 3 characters to search for a location.");
      return;
    }
    setSearching(true);
    setError("");
    setResults([]);
    try {
      const response = await fetch(
        `${geocodingUrl.replace(/\/$/, "")}/search?format=jsonv2&limit=5&countrycodes=tz&q=${encodeURIComponent(query)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) throw new Error();
      const places = await response.json();
      setResults(places);
      if (!places.length)
        setError(
          "No matching locations found. Try another street, area, or landmark.",
        );
    } catch {
      setError(
        "Location search is unavailable. You can still choose the place directly on the map.",
      );
    } finally {
      setSearching(false);
    }
  };
  const choosePlace = (place) => {
    setPosition({ lat: Number(place.lat), lng: Number(place.lon) });
    setQuery(place.display_name);
    setResults([]);
  };

  const save = async (event) => {
    event.preventDefault();
    setError("");
    if (!startDate || !endDate || endDate <= startDate) {
      setError("Choose an end date and time that is after the event starts.");
      return;
    }
    if (!media.length) {
      setError("Upload at least one event photo or short video.");
      return;
    }
    setSaving(true);
    const fields = new FormData(event.currentTarget);
    const payload = new FormData();
    payload.append("venue_id", venueId);
    payload.append("name", fields.get("name"));
    payload.append("category", fields.get("category"));
    payload.append("description", fields.get("description"));
    payload.append("starts_at", startDate.toISOString());
    payload.append("ends_at", endDate.toISOString());
    payload.append("is_free", isFree ? "1" : "0");
    if (!isFree) payload.append("price", fields.get("price"));
    payload.append("location_type", locationType);
    payload.append("publish", publishNow ? "1" : "0");
    if (locationType === "custom") {
      payload.append("location_name", fields.get("location_name"));
      payload.append("location_address", query);
      payload.append("latitude", position.lat);
      payload.append("longitude", position.lng);
    }
    media
      .filter(({ file }) => file)
      .forEach(({ file }) => payload.append("media[]", file));
    try {
      await api(editing ? `/host/events/${eventId}` : "/host/events", {
        method: "POST",
        body: payload,
      });
      showSuccessToast(
        editing ? "Event updated" : "Event added",
        editing
          ? "Your event changes have been saved."
          : "Your new event has been added.",
      );
      navigate("/host/events", { replace: true });
    } catch (problem) {
      setError(problem.message);
      showFailureAlert(problem.message);
      setSaving(false);
    }
  };

  if (loadingEvent) return <EventLoading label="Loading event details…" />;
  if (false && loadingEvent)
    return (
      <section className="panel venue-loading">Loading event details…</section>
    );
  if (editing && (!eventId || (!eventData && error)))
    return (
      <section className="panel venue-empty">
        <h2>Event unavailable</h2>
        <p>{error || "No event selected."}</p>
        <button
          className="secondary-button"
          onClick={() => navigate("/host/events")}
        >
          Back to events
        </button>
      </section>
    );

  return (
    <div className="add-event-page">
      <button className="venue-back" onClick={() => navigate("/host/events")}>
        <ArrowLeft /> Back to events
      </button>
      <div className="add-venue-heading">
        <div>
          <Badge tone="purple">
            <CalendarDays size={12} /> {editing ? "EDIT EVENT" : "NEW EVENT"}
          </Badge>
          <h1>{editing ? "Edit event" : "Create an event"}</h1>
          <p>Build an experience your audience will want to attend.</p>
        </div>
      </div>
      <form className="event-form-layout" onSubmit={save}>
        <div className="event-form-main">
          <section className="panel venue-form-section">
            <div className="venue-section-title">
              <span>
                <CalendarDays />
              </span>
              <div>
                <h2>Event details</h2>
                <p>Name the event and explain what guests can expect.</p>
              </div>
            </div>
            <label>
              Event name
              <input
                name="name"
                required
                placeholder="e.g. Sunset Jazz Garden"
                defaultValue={eventData?.name}
              />
            </label>
            <label>
              Event category
              <select name="category" required defaultValue={eventData?.category || ""}>
                <option value="" disabled>Select the category shown in the Vibfy app</option>
                {eventCategories.map((category) => (
                  <option value={category} key={category}>{category}</option>
                ))}
              </select>
              <small className="field-hint">This controls where members discover your event in the app.</small>
            </label>
            <label>
              Description
              <textarea
                name="description"
                defaultValue={eventData?.description}
                required
                minLength="30"
                rows="5"
                placeholder="What makes this event special?"
              />
            </label>
            <label>
              Host venue
              <select
                required
                value={venueId}
                onChange={(event) => setVenueId(event.target.value)}
              >
                <option value="" disabled>
                  Select a venue
                </option>
                {venues.map((venue) => (
                  <option value={venue.id} key={venue.id}>
                    {venue.name} · {venue.status}
                  </option>
                ))}
              </select>
            </label>
          </section>
          <section className="panel venue-form-section">
            <div className="venue-section-title">
              <span>
                <CalendarDays />
              </span>
              <div>
                <h2>Date and time</h2>
                <p>Set the complete start and end of the event.</p>
              </div>
            </div>
            <div className="event-date-grid">
              <label>
                Starts
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    if (endDate && endDate <= date) setEndDate(null);
                  }}
                  showTimeSelect
                  timeIntervals={15}
                  minDate={new Date()}
                  dateFormat="EEE, d MMM yyyy · h:mm aa"
                  placeholderText="Choose start date and time"
                />
              </label>
              <label>
                Ends
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  showTimeSelect
                  timeIntervals={15}
                  minDate={startDate || new Date()}
                  minTime={
                    startDate &&
                    endDate?.toDateString() === startDate.toDateString()
                      ? startDate
                      : undefined
                  }
                  maxTime={
                    startDate &&
                    endDate?.toDateString() === startDate.toDateString()
                      ? new Date(new Date().setHours(23, 59, 0, 0))
                      : undefined
                  }
                  dateFormat="EEE, d MMM yyyy · h:mm aa"
                  placeholderText="Choose end date and time"
                />
              </label>
            </div>
          </section>
          <section className="panel venue-form-section">
            <div className="venue-section-title">
              <span>
                <MapPin />
              </span>
              <div>
                <h2>Event location</h2>
                <p>Use the venue address or choose another location.</p>
              </div>
            </div>
            <div className="location-type-options">
              <button
                type="button"
                className={locationType === "venue" ? "selected" : ""}
                onClick={() => setLocationType("venue")}
              >
                <Check /> At the venue
              </button>
              <button
                type="button"
                className={locationType === "custom" ? "selected" : ""}
                onClick={() => setLocationType("custom")}
              >
                <MapPin /> Somewhere else
              </button>
            </div>
            {locationType === "venue" ? (
              <div className="venue-location-summary">
                <MapPin />
                <div>
                  <strong>
                    {venues.find((venue) => venue.id === venueId)?.name ||
                      "Select a venue"}
                  </strong>
                  <span>
                    {venues.find((venue) => venue.id === venueId)?.address},{" "}
                    {venues.find((venue) => venue.id === venueId)?.city}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <label>
                  Location name
                  <input
                    name="location_name"
                    required
                    placeholder="e.g. Arusha Clock Tower grounds"
                    defaultValue={eventData?.location_name}
                  />
                </label>
                <div className="venue-location-search">
                  <div>
                    <Search />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search street, area or landmark"
                    />
                    <button
                      type="button"
                      className="primary-button"
                      onClick={searchLocation}
                      disabled={searching}
                    >
                      {searching ? "Searching…" : "Search"}
                    </button>
                  </div>
                  {results.length > 0 && (
                    <div className="venue-search-results">
                      {results.map((place) => (
                        <button
                          type="button"
                          key={place.place_id}
                          onClick={() => choosePlace(place)}
                        >
                          <MapPin />
                          <span>
                            <strong>
                              {place.name || place.display_name.split(",")[0]}
                            </strong>
                            <small>{place.display_name}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <VenueLocationMap
                  position={position}
                  onChange={({ lat, lng }) => setPosition({ lat, lng })}
                />
                <div className="venue-coordinates">
                  <span>
                    Latitude <strong>{position.lat.toFixed(6)}</strong>
                  </span>
                  <span>
                    Longitude <strong>{position.lng.toFixed(6)}</strong>
                  </span>
                </div>
              </>
            )}
          </section>
          <section className="panel venue-form-section">
            <div className="venue-section-title">
              <span>
                <Ticket />
              </span>
              <div>
                <h2>Tickets and price</h2>
                <p>Let guests know whether admission is free or paid.</p>
              </div>
            </div>
            <div className="price-type-options">
              <button
                type="button"
                className={isFree ? "selected" : ""}
                onClick={() => setIsFree(true)}
              >
                <Check /> Free event
              </button>
              <button
                type="button"
                className={!isFree ? "selected" : ""}
                onClick={() => setIsFree(false)}
              >
                <Ticket /> Paid event
              </button>
            </div>
            {!isFree && (
              <label>
                Ticket price (TZS)
                <input
                  name="price"
                  required
                  type="number"
                  min="0"
                  step="500"
                  placeholder="e.g. 25000"
                  defaultValue={eventData?.price}
                />
              </label>
            )}
          </section>
        </div>
        <aside className="event-form-side">
          <section className="panel event-media-panel">
            <h2>Event media</h2>
            <p>
              Upload up to 8 photos or short videos. Each file can be up to 20
              MB.
            </p>
            <label className="event-media-upload">
              <Upload />
              <strong>Add photos or videos</strong>
              <span>JPG, PNG, WebP, MP4, MOV or WebM</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                onChange={addMedia}
              />
            </label>
            <div className="event-media-grid">
              {media.map((item, index) => (
                <div key={item.preview}>
                  {item.type === "video" ? (
                    <video
                      src={
                        item.existing && item.preview.startsWith("/storage/")
                          ? `${apiUrl.replace(/\/api\/v1$/, "")}${item.preview}`
                          : item.preview
                      }
                      muted
                    />
                  ) : (
                    <img
                      src={
                        item.existing && item.preview.startsWith("/storage/")
                          ? `${apiUrl.replace(/\/api\/v1$/, "")}${item.preview}`
                          : item.preview
                      }
                      alt=""
                    />
                  )}
                  <span>{item.type}</span>
                  <button type="button" onClick={() => removeMedia(index)}>
                    <X />
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section className="panel event-publish-panel">
            <h2>Publication</h2>
            <p>
              Published events can appear in the Vibfy member app. Drafts stay
              private in your Host portal.
            </p>
            <div className="price-type-options">
              <button
                type="button"
                className={!publishNow ? "selected" : ""}
                onClick={() => setPublishNow(false)}
              >
                Save as draft
              </button>
              <button
                type="button"
                className={publishNow ? "selected" : ""}
                onClick={() => setPublishNow(true)}
              >
                Publish now
              </button>
            </div>
          </section>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <div className="venue-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/host/events")}
            >
              Cancel
            </button>
            <button
              className="primary-button"
              disabled={saving || !venues.length}
            >
              <Check />{" "}
              {saving ? "Saving…" : editing ? "Save changes" : "Create event"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
