
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import { MapPin, X, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const statusColors = {
  submitted: "#D97706",
  in_progress: "#2563EB",
  resolved: "#168653",
};

const statusLabels = {
  submitted: "Submitted",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const categoryLabels = {
  roads: "Roads and potholes",
  sanitation: "Waste and sanitation",
  water: "Water supply",
  drainage: "Drainage and flooding",
  streetlights: "Streetlights",
  footpaths: "Footpaths",
  public_spaces: "Public spaces",
  other: "Other",
};

function getPhotoUrl(photoPath) {
  if (!photoPath) return null;

  const { data } = supabase.storage
    .from("complaint-photos")
    .getPublicUrl(photoPath);

  return data?.publicUrl ?? null;
}

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

export default function IndiaMap() {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadComplaints() {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("complaints")
      .select(
        "id, title, category, description, address, latitude, longitude, status, created_at, photo_path"
      )
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Could not load map complaints:", queryError.message);
      setError("Couldn't load report locations.");
      setLoading(false);
      return;
    }

    const locatedComplaints = (data ?? []).filter((complaint) => {
      const latitude = Number(complaint.latitude);
      const longitude = Number(complaint.longitude);

      return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      );
    });

    setComplaints(locatedComplaints);

    setSelected((current) =>
      current
        ? locatedComplaints.find((item) => item.id === current.id) ?? null
        : null
    );

    setLoading(false);
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  const selectedPhotoUrl = selected
    ? getPhotoUrl(selected.photo_path)
    : null;

  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-[#E3E8E1] bg-[#F0F4EC] sm:h-[520px]">
      <MapContainer
        center={[22.5, 79]}
        zoom={4.5}
        minZoom={4}
        maxZoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapResizeHandler />

        {complaints.map((complaint) => {
          const position = [
            Number(complaint.latitude),
            Number(complaint.longitude),
          ];

          const color =
            statusColors[complaint.status] ?? "#6B786F";

          return (
            <CircleMarker
              key={complaint.id}
              center={position}
              radius={selected?.id === complaint.id ? 10 : 7}
              pathOptions={{
                color: "#FFFFFF",
                weight: 3,
                fillColor: color,
                fillOpacity: 1,
              }}
              eventHandlers={{
                click: () => setSelected(complaint),
              }}
            >
              <Tooltip direction="top" offset={[0, -7]}>
                <strong>{complaint.title}</strong>
                <br />
                {complaint.address}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map label */}
      <div className="absolute left-3 top-3 z-[500] max-w-[calc(100%-24px)] rounded-xl border border-[#E3E8E1] bg-white/95 px-3 py-2 shadow-sm backdrop-blur sm:left-5 sm:top-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#18352B]">
          <MapPin size={16} className="shrink-0 text-[#168653]" />
          Civic issues across India
        </div>

        <p className="mt-1 text-xs text-[#6B786F]">
          {loading
            ? "Loading report locations…"
            : error
              ? error
              : complaints.length > 0
                ? `${complaints.length} located report${complaints.length === 1 ? "" : "s"} · Select a marker`
                : "No location-pinned reports yet"}
        </p>

        {error && (
          <button
            type="button"
            onClick={loadComplaints}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#245B43]"
          >
            <RefreshCw size={13} />
            Try again
          </button>
        )}
      </div>

      {/* Status legend */}
      <div className="absolute bottom-3 left-3 z-[500] flex flex-wrap gap-3 rounded-xl border border-[#E3E8E1] bg-white/95 px-3 py-2 shadow-sm sm:bottom-5 sm:left-5">
        {Object.entries(statusColors).map(([status, color]) => (
          <div
            key={status}
            className="flex items-center gap-1.5 text-xs text-[#46554B]"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {statusLabels[status]}
          </div>
        ))}
      </div>

      {/* Selected complaint details */}
      {selected && (
        <div className="absolute bottom-3 right-3 z-[600] max-h-[calc(100%-24px)] w-[min(310px,calc(100%-24px))] overflow-y-auto rounded-2xl border border-[#E3E8E1] bg-white p-4 shadow-xl sm:bottom-5 sm:right-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#168653]">
                {categoryLabels[selected.category] ?? selected.category}
              </p>

              <h3 className="mt-1 break-words font-semibold text-[#18352B]">
                {selected.title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-[#6B786F]">
                {selected.address}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="shrink-0 rounded-lg p-1 text-[#6B786F] transition hover:bg-[#F1F4EF]"
              aria-label="Close complaint details"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-3">
            <span
              className="rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: `${statusColors[selected.status] ?? "#6B786F"}18`,
                color: statusColors[selected.status] ?? "#6B786F",
              }}
            >
              {statusLabels[selected.status] ?? selected.status}
            </span>
          </div>

          {selected.description && (
            <p className="mt-3 whitespace-pre-line text-xs leading-5 text-[#6B786F]">
              {selected.description}
            </p>
          )}

          {selectedPhotoUrl && (
            <a
              href={selectedPhotoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block overflow-hidden rounded-xl border border-[#E3E8E1]"
              aria-label={`View photo for ${selected.title}`}
            >
              <img
                src={selectedPhotoUrl}
                alt={`Evidence for ${selected.title}`}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                className="max-h-40 w-full object-cover"
              />

              <span className="block bg-[#F7F6F0] px-3 py-2 text-center text-xs font-medium text-[#365340]">
                View full photo ↗
              </span>
            </a>
          )}

          <p className="mt-3 text-xs text-[#899087]">
            Reported{" "}
            {selected.created_at
              ? new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date(selected.created_at))
              : "date unavailable"}
          </p>
        </div>
      )}
    </div>
  );
}
