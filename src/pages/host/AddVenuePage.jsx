import {
  ArrowLeft,
  Check,
  ImagePlus,
  LocateFixed,
  MapPin,
  Search,
  Store,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui";
import { useRouter } from "../../router";
import VenueLocationMap from "../../components/VenueLocationMap";
import { api } from "../../api";
import EventLoading from "../../components/EventLoading";
import { showFailureAlert, showSuccessToast } from "../../alerts";

const amenities = [
  "Outdoor",
  "Live music",
  "Parking",
  "Wi-Fi",
  "Family friendly",
  "Wheelchair access",
];
const geocodingUrl =
  import.meta.env.VITE_GEOCODING_URL || "https://nominatim.openstreetmap.org";

export default function AddVenuePage({ mode = "create" }) {
  const { navigate } = useRouter();
  const editing = mode === "edit";
  const venueId = new URLSearchParams(window.location.search).get("id");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [position, setPosition] = useState({ lat: -3.3869, lng: 36.683 });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationResults, setLocationResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [venue, setVenue] = useState(null);
  const [loadingVenue, setLoadingVenue] = useState(editing && Boolean(venueId));
  useEffect(() => {
    if (!editing || !venueId) return;
    api(`/host/venues/${venueId}`)
      .then((result) => {
        setVenue(result.venue);
        setSelectedAmenities(result.venue.amenities || []);
        setImage(result.venue.cover_image || "");
        setPosition({
          lat: result.venue.latitude,
          lng: result.venue.longitude,
        });
      })
      .catch((problem) => setSaveError(problem.message))
      .finally(() => setLoadingVenue(false));
  }, [editing, venueId]);
  const toggleAmenity = (amenity) =>
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity],
    );
  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showFailureAlert("Please choose an image smaller than 2 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    const form = new FormData(event.currentTarget);
    const venue = {
      name: form.get("name"),
      category: form.get("category"),
      address: form.get("address"),
      city: form.get("city"),
      description: form.get("description"),
      phone: form.get("phone"),
      hours: `${form.get("open_time")}–${form.get("close_time")}`,
      opens_at: form.get("open_time"),
      closes_at: form.get("close_time"),
      price_range: form.get("price_range"),
      amenities: selectedAmenities,
      cover_image: image || null,
      latitude: position.lat,
      longitude: position.lng,
    };
    try {
      await api(editing ? `/host/venues/${venueId}` : "/host/venues", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(venue),
      });
      showSuccessToast(
        editing ? "Venue updated" : "Venue added",
        editing
          ? "Your venue changes have been saved."
          : "Your new venue has been added.",
      );
      navigate("/host/venues", { replace: true });
    } catch (problem) {
      setSaveError(problem.message);
      showFailureAlert(problem.message);
      setSaving(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ lat: coords.latitude, lng: coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError(
          "We couldn't access your location. Allow location permission or select it on the map.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const searchLocation = async (event) => {
    event.preventDefault();
    const query = locationQuery.trim();
    if (query.length < 3) {
      setSearchError("Enter at least 3 characters to search.");
      return;
    }
    setSearchingLocation(true);
    setSearchError("");
    setLocationResults([]);
    const cacheKey = `vibfy_location_${query.toLowerCase()}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      const results = cached
        ? JSON.parse(cached)
        : await fetch(
            `${geocodingUrl.replace(/\/$/, "")}/search?format=jsonv2&limit=5&countrycodes=tz&q=${encodeURIComponent(query)}`,
            { headers: { Accept: "application/json" } },
          ).then((response) => {
            if (!response.ok) throw new Error();
            return response.json();
          });
      if (!cached) sessionStorage.setItem(cacheKey, JSON.stringify(results));
      setLocationResults(results);
      if (!results.length) {
        setSearchError(
          "No matching places found. Try a nearby landmark, street, or area.",
        );
      }
    } catch {
      setSearchError(
        "Location search is unavailable right now. You can still select the venue directly on the map.",
      );
    } finally {
      setSearchingLocation(false);
    }
  };

  const chooseLocation = (result) => {
    setPosition({ lat: Number(result.lat), lng: Number(result.lon) });
    setLocationQuery(result.display_name);
    setLocationResults([]);
    setSearchError("");
  };

  if (loadingVenue) return <EventLoading label="Loading venue details…" />;
  if (false && loadingVenue)
    return (
      <section className="panel venue-loading">Loading venue details…</section>
    );
  if (editing && (!venueId || (!venue && saveError)))
    return (
      <section className="panel venue-empty">
        <h2>Venue unavailable</h2>
        <p>{saveError || "No venue was selected."}</p>
        <button
          className="secondary-button"
          onClick={() => navigate("/host/venues")}
        >
          Back to venues
        </button>
      </section>
    );

  return (
    <div className="add-venue-page">
      <button className="venue-back" onClick={() => navigate("/host/venues")}>
        <ArrowLeft /> Back to venues
      </button>
      <div className="add-venue-heading">
        <div>
          <Badge tone="purple">
            <Store size={12} /> {editing ? "EDIT VENUE" : "NEW VENUE"}
          </Badge>
          <h1>{editing ? "Edit venue" : "Add a venue"}</h1>
          <p>
            {editing
              ? "Update your venue information and submit it for review."
              : "Create the place visitors will discover and book through Vibfy."}
          </p>
        </div>
        <div className="venue-progress">
          <span>1</span>
          <div>
            <strong>Venue profile</strong>
            <small>Required details</small>
          </div>
        </div>
      </div>
      <form className="venue-form-layout" onSubmit={save}>
        <div className="venue-form-main">
          <section className="panel venue-form-section">
            <div className="venue-section-title">
              <span>
                <Store />
              </span>
              <div>
                <h2>Basic information</h2>
                <p>
                  Tell members what your venue is called and what kind of place
                  it is.
                </p>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Venue name
                <input
                  name="name"
                  required
                  placeholder="e.g. The Garden House"
                  defaultValue={venue?.name}
                />
              </label>
              <label>
                Category
                <select
                  name="category"
                  required
                  defaultValue={venue?.category || ""}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option>Restaurant</option>
                  <option>Bar & lounge</option>
                  <option>Club</option>
                  <option>Hotel</option>
                  <option>Event space</option>
                  <option>Outdoor venue</option>
                </select>
              </label>
            </div>
            <label>
              Description
              <textarea
                name="description"
                defaultValue={venue?.description}
                required
                minLength="30"
                rows="5"
                placeholder="Describe the atmosphere and what makes this venue special…"
              />
            </label>
          </section>
          <section className="panel venue-form-section">
            <div className="venue-section-title">
              <span>
                <MapPin />
              </span>
              <div>
                <h2>Location and contact</h2>
                <p>Help visitors find and contact your venue.</p>
              </div>
            </div>
            <label>
              Street or area
              <input
                name="address"
                required
                placeholder="e.g. Sakina Road"
                defaultValue={venue?.address}
              />
            </label>
            <div className="form-grid">
              <label>
                City
                <input
                  name="city"
                  required
                  defaultValue={venue?.city || "Arusha"}
                />
              </label>
              <label>
                Phone number
                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="+255 700 000 000"
                  defaultValue={venue?.phone}
                />
              </label>
            </div>
            <div className="venue-location-search">
              <div>
                <Search />
                <input
                  value={locationQuery}
                  onChange={(event) => setLocationQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") searchLocation(event);
                  }}
                  placeholder="Search an area, street or landmark"
                  aria-label="Search location"
                />
                <button
                  type="button"
                  className="primary-button"
                  onClick={searchLocation}
                  disabled={searchingLocation}
                >
                  {searchingLocation ? "Searching…" : "Search"}
                </button>
              </div>
              {locationResults.length > 0 && (
                <div className="venue-search-results">
                  {locationResults.map((result) => (
                    <button
                      type="button"
                      key={result.place_id}
                      onClick={() => chooseLocation(result)}
                    >
                      <MapPin />
                      <span>
                        <strong>
                          {result.name || result.display_name.split(",")[0]}
                        </strong>
                        <small>{result.display_name}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {searchError && (
                <p className="map-location-error" role="alert">
                  {searchError}
                </p>
              )}
            </div>
            <div className="venue-map-heading">
              <div>
                <strong>Pin the exact location</strong>
                <span>
                  Click the map or drag the marker to your venue entrance.
                </span>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={useCurrentLocation}
                disabled={locating}
              >
                <LocateFixed /> {locating ? "Locating…" : "Use my location"}
              </button>
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
            {locationError && (
              <p className="map-location-error" role="alert">
                {locationError}
              </p>
            )}
          </section>
          <section className="panel venue-form-section">
            <div className="venue-section-title">
              <span>
                <Check />
              </span>
              <div>
                <h2>Visitor details</h2>
                <p>Add opening times, pricing and useful amenities.</p>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Opening time
                <input
                  name="open_time"
                  required
                  type="time"
                  defaultValue={venue?.opens_at?.slice(0, 5)}
                />
              </label>
              <label>
                Closing time
                <input
                  name="close_time"
                  required
                  type="time"
                  defaultValue={venue?.closes_at?.slice(0, 5)}
                />
              </label>
            </div>
            <label>
              Typical price range
              <input
                name="price_range"
                defaultValue={venue?.price_range}
                required
                placeholder="e.g. TSh 15,000–60,000"
              />
            </label>
            <fieldset>
              <legend>Amenities</legend>
              <div className="amenity-options">
                {amenities.map((amenity) => (
                  <button
                    type="button"
                    key={amenity}
                    className={
                      selectedAmenities.includes(amenity) ? "selected" : ""
                    }
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {selectedAmenities.includes(amenity) && <Check />} {amenity}
                  </button>
                ))}
              </div>
            </fieldset>
          </section>
        </div>
        <aside className="venue-form-side">
          <section className="panel venue-cover-panel">
            <h2>Cover photo</h2>
            <p>Choose a bright landscape photo that represents your venue.</p>
            {image ? (
              <div className="venue-cover-preview">
                <img src={image} alt="Venue preview" />
                <button type="button" onClick={() => setImage("")}>
                  <X />
                </button>
              </div>
            ) : (
              <label className="venue-image-upload">
                <ImagePlus />
                <strong>Upload a cover photo</strong>
                <span>JPG or PNG · max 2 MB</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={selectImage}
                />
              </label>
            )}
          </section>
          {saveError && (
            <p className="auth-error" role="alert">
              {saveError}
            </p>
          )}
          <div className="venue-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/host/venues")}
            >
              Cancel
            </button>
            <button className="primary-button" disabled={saving}>
              <Check />{" "}
              {saving ? "Saving…" : editing ? "Save changes" : "Save venue"}
            </button>
          </div>
          <p className="venue-review-note">
            New venues are marked pending while the Vibfy team reviews their
            public profile.
          </p>
        </aside>
      </form>
    </div>
  );
}
