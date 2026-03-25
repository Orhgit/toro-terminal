"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map as MapIcon, Satellite, Building2, Mountain } from "lucide-react";
import type { Listing } from "../data/listings";

// ── Config ──────────────────────────────────────────────────
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type LayerMode = "standard" | "satellite" | "3d-urban" | "terrain";

const LAYER_STYLES: Record<LayerMode, string> = {
  standard: "mapbox://styles/mapbox/light-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  "3d-urban": "mapbox://styles/mapbox/dark-v11",
  terrain: "mapbox://styles/mapbox/outdoors-v12",
};

const LAYER_OPTIONS: { mode: LayerMode; label: string; Icon: typeof MapIcon }[] = [
  { mode: "standard", label: "Standard", Icon: MapIcon },
  { mode: "satellite", label: "Satellite", Icon: Satellite },
  { mode: "3d-urban", label: "3D Urban", Icon: Building2 },
  { mode: "terrain", label: "Terrain", Icon: Mountain },
];

// ── Helpers ─────────────────────────────────────────────────
function formatPinPrice(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `₪${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  return `₪${(price / 1000).toFixed(0)}K`;
}

// ── Props ───────────────────────────────────────────────────
interface MapPanelProps {
  listings: Listing[];
  hoveredId: string | null;
  onPinHover: (id: string | null) => void;
}

// ── Fallback (no token) ────────────────────────────────────
function MapFallback({ listings, hoveredId, onPinHover }: MapPanelProps) {
  // Bounds: Israel central
  function toPos(lat: number, lng: number) {
    const minLat = 31.5, maxLat = 32.95, minLng = 34.55, maxLng = 35.35;
    return {
      left: `${((lng - minLng) / (maxLng - minLng)) * 100}%`,
      top: `${(1 - (lat - minLat) / (maxLat - minLat)) * 100}%`,
    };
  }

  return (
    <div className="w-full h-full bg-[#e8ecf1] relative overflow-hidden rounded-lg border border-(--color-border)">
      <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {listings.map((l) => {
        const pos = toPos(l.lat, l.lng);
        const active = hoveredId === l.id;
        return (
          <div
            key={l.id}
            className="absolute z-10 flex flex-col items-center"
            style={{ left: pos.left, top: pos.top, transform: "translate(-50%, -100%)" }}
            onMouseEnter={() => onPinHover(l.id)}
            onMouseLeave={() => onPinHover(null)}
          >
            <div className={`map-price-marker relative ${active ? "active" : ""}`}>
              {formatPinPrice(l.price)}
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
        <div className="rounded-lg bg-white/90 px-3 py-1.5 text-[10px] text-(--color-text-muted) shadow-sm">
          Set <code className="bg-(--color-bg-secondary) px-1 py-0.5 rounded text-[9px]">NEXT_PUBLIC_MAPBOX_TOKEN</code> in <code className="bg-(--color-bg-secondary) px-1 py-0.5 rounded text-[9px]">.env.local</code> for 3D map
        </div>
        <span className="text-[9px] text-slate-400">{listings.length} pins</span>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export function MapPanel({ listings, hoveredId, onPinHover }: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [activeLayer, setActiveLayer] = useState<LayerMode>("standard");
  const [mapReady, setMapReady] = useState(false);

  // ── Initialize map ─────────────────────────────────────────
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: LAYER_STYLES[activeLayer],
      center: [34.79, 32.07], // Tel Aviv center
      zoom: 10.5,
      pitch: 45,
      bearing: -10,
      antialias: true,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    map.on("style.load", () => {
      add3DLayers(map, activeLayer);
      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // Only init once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Switch style ───────────────────────────────────────────
  const switchStyle = useCallback((mode: LayerMode) => {
    const map = mapRef.current;
    if (!map) return;
    setActiveLayer(mode);

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    setMapReady(false);

    map.setStyle(LAYER_STYLES[mode]);
    // style.load will re-fire and add layers
    map.once("style.load", () => {
      add3DLayers(map, mode);
      setMapReady(true);
    });
  }, []);

  // ── Add 3D layers based on mode ────────────────────────────
  function add3DLayers(map: mapboxgl.Map, mode: LayerMode) {
    // 3D buildings
    if (mode === "3d-urban" || mode === "standard") {
      const layers = map.getStyle().layers ?? [];
      let labelLayerId: string | undefined;
      for (const layer of layers) {
        if (layer.type === "symbol" && (layer.layout as Record<string, unknown>)?.["text-field"]) {
          labelLayerId = layer.id;
          break;
        }
      }

      if (!map.getLayer("3d-buildings")) {
        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 12,
            paint: mode === "3d-urban"
              ? {
                  // Glass-Tech style
                  "fill-extrusion-color": [
                    "interpolate", ["linear"], ["get", "height"],
                    0, "#1e1b4b",
                    15, "#312e81",
                    40, "#4338ca",
                    80, "#6366f1",
                    150, "#818cf8",
                  ],
                  "fill-extrusion-height": ["get", "height"],
                  "fill-extrusion-base": ["get", "min_height"],
                  "fill-extrusion-opacity": 0.7,
                }
              : {
                  // Standard subtle
                  "fill-extrusion-color": "#d1d5db",
                  "fill-extrusion-height": ["get", "height"],
                  "fill-extrusion-base": ["get", "min_height"],
                  "fill-extrusion-opacity": 0.4,
                },
          },
          labelLayerId,
        );
      }
    }

    // Highlighted building layer (for hover glow)
    if (!map.getSource("highlighted-building")) {
      map.addSource("highlighted-building", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "highlighted-building-fill",
        type: "fill-extrusion",
        source: "highlighted-building",
        paint: {
          "fill-extrusion-color": mode === "3d-urban" ? "#818cf8" : "#6366f1",
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.9,
        },
      });
    }

    // Terrain for terrain mode
    if (mode === "terrain") {
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
    } else {
      if (map.getTerrain()) {
        map.setTerrain(null as unknown as mapboxgl.TerrainSpecification);
      }
    }
  }

  // ── Sync markers with listings ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const currentIds = new Set(listings.map((l) => l.id));

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    listings.forEach((l) => {
      const existing = markersRef.current.get(l.id);
      if (existing) {
        // Update position in case data changed
        existing.setLngLat([l.lng, l.lat]);
        return;
      }

      // Create marker element
      const el = document.createElement("div");
      el.className = "map-price-marker relative";
      el.textContent = formatPinPrice(l.price);
      el.dataset.id = l.id;

      el.addEventListener("mouseenter", () => onPinHover(l.id));
      el.addEventListener("mouseleave", () => onPinHover(null));

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([l.lng, l.lat])
        .addTo(map);

      markersRef.current.set(l.id, marker);
    });
  }, [listings, mapReady, onPinHover]);

  // ── Hover highlight ────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Update marker classes
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      if (id === hoveredId) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });

    // Highlight building at hovered pin
    if (hoveredId) {
      const listing = listings.find((l) => l.id === hoveredId);
      if (listing && map.getZoom() >= 14) {
        const point = map.project([listing.lng, listing.lat]);
        const features = map.queryRenderedFeatures(
          [
            [point.x - 10, point.y - 10],
            [point.x + 10, point.y + 10],
          ],
          { layers: map.getLayer("3d-buildings") ? ["3d-buildings"] : [] },
        );

        const src = map.getSource("highlighted-building") as mapboxgl.GeoJSONSource | undefined;
        if (src && features.length > 0) {
          src.setData({
            type: "FeatureCollection",
            features: features.map((f) => ({
              type: "Feature" as const,
              geometry: f.geometry,
              properties: f.properties ?? {},
            })),
          });
        }
      }
    } else {
      const src = map.getSource("highlighted-building") as mapboxgl.GeoJSONSource | undefined;
      if (src) {
        src.setData({ type: "FeatureCollection", features: [] });
      }
    }
  }, [hoveredId, listings, mapReady]);

  // ── No token → fallback ────────────────────────────────────
  if (!MAPBOX_TOKEN) {
    return <MapFallback listings={listings} hoveredId={hoveredId} onPinHover={onPinHover} />;
  }

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-(--color-border)">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Layer Switcher */}
      <div className="layer-switcher">
        {LAYER_OPTIONS.map(({ mode, label, Icon }) => (
          <button
            key={mode}
            onClick={() => switchStyle(mode)}
            className={`layer-btn ${activeLayer === mode ? "active" : ""}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Property count */}
      <div className="absolute bottom-3 left-3 z-5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] text-(--color-text-muted) shadow-sm border border-(--color-border)">
        {listings.length} properties · Pitch 45°
        {activeLayer === "3d-urban" && " · Glass-Tech"}
        {activeLayer === "terrain" && " · 3D Terrain"}
      </div>
    </div>
  );
}
