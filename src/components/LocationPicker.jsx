
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Search,
  LoaderCircle,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

const defaultCenter = [12.9716, 77.5946]; // Bengaluru

const locationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #276746;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapClickHandler({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapCenterUpdater({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 15), {
      duration: 0.8,
    });
  }, [latitude, longitude, map]);

  return null;
}

export default function LocationPicker({
  value,
  onChange,
  address = "",
  onAddressChange,
}) {
  const [query, setQuery] = useState(address);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  const abortRef = useRef(null);

  useEffect(() => {
    setQuery(address);
  }, [address]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!dropdownOpen || trimmedQuery.length < 3) {
      setSuggestions([]);
      setSearching(false);
      setSearchError("");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      setSearchError("");

      try {
        const params = new URLSearchParams({
          q: trimmedQuery,
          limit: "6",
          lat: String(defaultCenter[0]),
          lon: String(defaultCenter[1]),
          lang: "en",
        });

        const response = await fetch(
          `https://photon.komoot.io/api/?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Location search is temporarily unavailable.");
        }

        const result = await response.json();

        if (!controller.signal.aborted) {
          setSuggestions(
            (result.features ?? []).filter((feature) => {
              const coordinates = feature.geometry?.coordinates;

              return (
                Array.isArray(coordinates) &&
                Number.isFinite(coordinates[0]) &&
                Number.isFinite(coordinates[1])
              );
            })
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
          setSearchError(
            "Couldn't load suggestions. You can still select a location on the map."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 450);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, dropdownOpen]);

  function handleQueryChange(event) {
    const nextQuery = event.target.value;

    setQuery(nextQuery);
    setDropdownOpen(true);
    setSelectedLabel("");
    setSearchError("");
    onAddressChange?.(nextQuery);

    // Prevent coordinates for an old address being submitted.
    onChange(null);
  }

  function selectSuggestion(feature) {
    const [longitude, latitude] = feature.geometry.coordinates;
    const properties = feature.properties ?? {};

    const label =
      [
        properties.name,
        properties.street,
        properties.district,
        properties.city,
        properties.state,
        properties.postcode,
        properties.country,
      ]
        .filter(Boolean)
        .filter((part, index, parts) => parts.indexOf(part) === index)
        .join(", ") || "Selected location";

    setQuery(label);
    setSelectedLabel(label);
    setSuggestions([]);
    setDropdownOpen(false);
    setSearchError("");

    onAddressChange?.(label);
    onChange({ latitude, longitude });
  }

  function clearLocation() {
    setQuery("");
    setSelectedLabel("");
    setSuggestions([]);
    setDropdownOpen(false);
    setSearchError("");

    onAddressChange?.("");
    onChange(null);
  }

  const hasLocation =
    value?.latitude != null && value?.longitude != null;

  return (
    <div className="space-y-3">
      {/* Address autocomplete */}
      <div className="relative">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8578]"
          />

          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => {
              // Allow a suggestion click to register before closing.
              setTimeout(() => setDropdownOpen(false), 180);
            }}
            placeholder="Search street, area, landmark..."
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={dropdownOpen && suggestions.length > 0}
            className="w-full rounded-lg border border-[#D5D9CF] bg-white py-3 pl-10 pr-10 text-sm outline-none focus:border-[#557F61] focus:ring-2 focus:ring-[#DCE9DA]"
          />

          {searching ? (
            <LoaderCircle
              size={17}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#55715B]"
            />
          ) : query ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={clearLocation}
              aria-label="Clear location search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8578] hover:text-[#245B43]"
            >
              <X size={17} />
            </button>
          ) : null}
        </div>

        {dropdownOpen && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-[1000] mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[#D5D9CF] bg-white py-1 shadow-lg"
          >
            {suggestions.map((feature, index) => {
              const properties = feature.properties ?? {};

              const label =
                [
                  properties.name,
                  properties.street,
                  properties.district,
                  properties.city,
                  properties.state,
                  properties.postcode,
                  properties.country,
                ]
                  .filter(Boolean)
                  .filter(
                    (part, i, parts) => parts.indexOf(part) === i
                  )
                  .join(", ") || "Unknown location";

              return (
                <li key={`${label}-${index}`} role="option" aria-selected="false">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(feature)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#F0F3EC]"
                  >
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-[#55715B]"
                    />

                    <span className="text-sm leading-5 text-[#294536]">
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {dropdownOpen &&
          query.trim().length >= 3 &&
          !searching &&
          suggestions.length === 0 && (
            <div className="absolute z-[1000] mt-1 w-full rounded-lg border border-[#D5D9CF] bg-white p-3 text-sm text-[#667267] shadow-lg">
              {searchError ||
                "No matching places found. Try adding the area or city."}
            </div>
          )}

        {query.trim().length > 0 && query.trim().length < 3 && dropdownOpen && (
          <p className="mt-1 text-xs text-[#7C8578]">
            Type at least 3 characters to search.
          </p>
        )}
      </div>

      {/* Interactive map */}
      <div className="overflow-hidden rounded-2xl border border-[#D8DFD5]">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: "320px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onChange={onChange} />

          {hasLocation && (
            <>
              <Marker
                position={[value.latitude, value.longitude]}
                icon={locationIcon}
              />

              <MapCenterUpdater
                latitude={value.latitude}
                longitude={value.longitude}
              />
            </>
          )}
        </MapContainer>
      </div>

      {hasLocation ? (
        <div className="rounded-lg border border-[#B8D4B8] bg-[#EDF5E9] p-3">
          <p className="text-sm font-medium text-[#245B43]">
            <MapPin size={15} className="mr-1 inline" />
            Location pinned
          </p>

          {selectedLabel && (
            <p className="mt-1 break-words text-sm text-[#405648]">
              {selectedLabel}
            </p>
          )}

          <p className="mt-1 text-xs text-[#55715B]">
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </p>

          <p className="mt-2 text-xs text-[#55715B]">
            Click elsewhere on the map to adjust the pin.
          </p>
        </div>
      ) : (
        <p className="text-sm leading-5 text-[#7C8578]">
          Search for a location and select a suggestion, or click directly
          on the map to drop a pin.
        </p>
      )}

      <p className="text-xs text-[#899087]">
        Search powered by Photon. Map data © OpenStreetMap contributors.
      </p>
    </div>
  );
}
