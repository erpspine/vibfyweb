import L from "leaflet";
import { useEffect, useMemo } from "react";
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
  const point = useMemo(() => L.latLng(position.lat, position.lng), [position]);
  return (
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
    </MapContainer>
  );
}
