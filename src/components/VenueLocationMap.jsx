import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

const venueMarker = L.divIcon({
  className: "venue-map-marker",
  html: "<span></span>",
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

function MapClickHandler({ onChange }) {
  useMapEvents({ click: (event) => onChange(event.latlng) });
  return null;
}

function MapPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, Math.max(map.getZoom(), 15), { duration: 0.7 });
  }, [map, position]);
  return null;
}

export default function VenueLocationMap({ position, onChange }) {
  const [query, setQuery] = useState("");
  const search = async (event) => { event.preventDefault(); event.stopPropagation(); if (!query.trim()) return; const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`); const results = await response.json(); if (results[0]) onChange({ lat: Number(results[0].lat), lng: Number(results[0].lon) }); };
  const point = useMemo(() => L.latLng(position.lat, position.lng), [position]);
  return (<div className="venue-map-wrap"><div className="venue-map-search"><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') search(e); }} placeholder="Search venue area or town"/><button type="button" onClick={search}>Search</button></div>
    <MapContainer
      center={point}
      zoom={14}
      scrollWheelZoom
      className="venue-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onChange={onChange} />
      <MapPosition position={point} />
      <Marker
        position={point}
        icon={venueMarker}
        draggable
        eventHandlers={{
          dragend: (event) => onChange(event.target.getLatLng()),
        }}
      />
    </MapContainer><p className="venue-map-selected">Selected location: {Number(position.lat).toFixed(6)}, {Number(position.lng).toFixed(6)}</p></div>
  );
}
