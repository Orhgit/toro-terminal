"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import NextImage from "next/image";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map as MapIcon, Satellite, Building2, Mountain, MapPin, Navigation, Maximize2 } from "lucide-react";
import type { Listing } from "../data/listings";

// ── Config ──────────────────────────────────────────────────
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type LayerMode = "standard" | "satellite" | "3d-urban" | "terrain";

const LAYER_STYLES: Record<LayerMode, string> = {
  standard: "mapbox://styles/mapbox/streets-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  "3d-urban": "mapbox://styles/mapbox/light-v11",
  terrain: "mapbox://styles/mapbox/outdoors-v12",
};

const LAYER_OPTIONS: { mode: LayerMode; label: string; Icon: typeof MapIcon }[] = [
  { mode: "standard", label: "מפה", Icon: MapIcon },
  { mode: "satellite", label: "לוויין", Icon: Satellite },
  { mode: "3d-urban", label: "תלת-ממד", Icon: Building2 },
  { mode: "terrain", label: "פני שטח", Icon: Mountain },
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
  flyToId?: string | null;
}

// ── Fallback (no token) — Premium styled map ───────────────
function MapFallback({ listings, hoveredId, onPinHover }: MapPanelProps) {
  const [hoveredListing, setHoveredListing] = useState<Listing | null>(null);

  function toPos(lat: number, lng: number) {
    const minLat = 29.4, maxLat = 33.3, minLng = 34.1, maxLng = 36.0;
    return {
      left: `${((lng - minLng) / (maxLng - minLng)) * 100}%`,
      top: `${(1 - (lat - minLat) / (maxLat - minLat)) * 100}%`,
    };
  }

  function handlePinHover(l: Listing | null) {
    setHoveredListing(l);
    onPinHover(l?.id ?? null);
  }

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, #e8edf5, #dce3ed)", borderRadius: 16, overflow: "hidden" }}>
      {/* Subtle grid */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mapgrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#94a3b8" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapgrid)" />
      </svg>

      {/* Gradient overlay edges for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-white/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white/40 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white/30 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/30 to-transparent" />
      </div>

      {/* Map header */}
      <div className="absolute top-3 right-3 left-3 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-white/50">
          <MapPin className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-[11px] font-bold text-slate-700">{listings.length} נכסים על המפה</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-white/50 hover:bg-white transition cursor-pointer" title="מרכז">
            <Navigation className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Property pins */}
      {listings.map((l) => {
        const pos = toPos(l.lat, l.lng);
        const active = hoveredId === l.id;
        return (
          <div
            key={l.id}
            className="absolute z-10 flex flex-col items-center"
            style={{ left: pos.left, top: pos.top, transform: "translate(-50%, -100%)" }}
            onMouseEnter={() => handlePinHover(l)}
            onMouseLeave={() => handlePinHover(null)}
          >
            <div className={`map-price-marker relative ${l.promotionLevel === 2 ? "map-pin-gold" : l.promotionLevel === 1 ? "map-pin-silver" : ""} ${active ? "active" : ""}`}>
              {l.promotionLevel === 2 ? "👑 " : ""}{formatPinPrice(l.price)}
            </div>
          </div>
        );
      })}

      {/* Hover popup — mini property card */}
      {hoveredListing && (
        <div
          className="absolute z-30 animate-scaleIn pointer-events-none"
          style={{
            left: toPos(hoveredListing.lat, hoveredListing.lng).left,
            top: toPos(hoveredListing.lat, hoveredListing.lng).top,
            transform: "translate(-50%, -120%)",
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden w-52">
            {hoveredListing.imageUrl && (
              <div className="relative w-full h-24">
                <NextImage
                  src={hoveredListing.imageUrl}
                  alt={hoveredListing.address}
                  fill
                  sizes="208px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <p className="text-sm font-black text-blue-900">{formatPinPrice(hoveredListing.price)}</p>
              <p className="text-[11px] font-bold text-slate-700 truncate">{hoveredListing.address}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                <span>{hoveredListing.rooms} חד׳</span>
                <span>·</span>
                <span>{hoveredListing.sqm} מ״ר</span>
                <span>·</span>
                <span>{hoveredListing.city}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="absolute bottom-3 inset-x-3 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-white/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-600">מפה אינטראקטיבית</span>
          </div>
          <span className="text-[9px] text-slate-400">Powered by Toro</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export const MapPanel = ({ listings, hoveredId, onPinHover, flyToId }: MapPanelProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [activeLayer, setActiveLayer] = useState<LayerMode>("standard");
  const [mapReady, setMapReady] = useState(false);

  // ── FlyTo selected property ──────────────────────────────────
  useEffect(() => {
    if (!flyToId || !mapRef.current || !mapReady) return;
    const listing = listings.find((l) => l.id === flyToId);
    if (listing) {
      mapRef.current.flyTo({
        center: [listing.lng, listing.lat],
        zoom: 16,
        duration: 2000,
        essential: true,
      });
    }
  }, [flyToId, listings, mapReady]);

  // ── Initialize map ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!MAPBOX_TOKEN || !mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: LAYER_STYLES[activeLayer],
      center: [34.8, 31.5], // Center of Israel
      zoom: 7,
      pitch: 30,
      bearing: 0,
      antialias: true,
      attributionControl: false,
      maxPitch: 60,
    });

    // Remove default atmosphere/fog that creates the blue-grey sky fill
    map.on("style.load", () => {
      try { map.setFog(null as unknown as mapboxgl.FogSpecification); } catch { /* style may not support fog */ }
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
    map.once("style.load", () => {
      add3DLayers(map, mode);
      setMapReady(true);
    });
  }, []);

  // ── Add 3D layers based on mode ────────────────────────────
  function add3DLayers(map: mapboxgl.Map, mode: LayerMode) {
    // Clear fog/atmosphere to prevent blue-grey sky fill
    try { map.setFog(null as unknown as mapboxgl.FogSpecification); } catch { /* noop */ }

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
        existing.setLngLat([l.lng, l.lat]);
        return;
      }

      // Create marker element — Gold VIP gets yellow styling
      const el = document.createElement("div");
      const isGold = l.promotionLevel === 2;
      const isSilver = l.promotionLevel === 1;
      el.className = `map-price-marker relative ${isGold ? "map-pin-gold" : isSilver ? "map-pin-silver" : ""}`;
      el.textContent = `${isGold ? "👑 " : ""}${formatPinPrice(l.price)}`;
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
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* Layer Switcher — top left (LTR position, away from mapbox controls) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 bg-white/95 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-slate-200/50">
        {LAYER_OPTIONS.map(({ mode, label, Icon }) => (
          <button
            key={mode}
            onClick={() => switchStyle(mode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap
              ${activeLayer === mode
                ? "bg-indigo-100 text-indigo-700"
                : "text-slate-500 hover:bg-slate-100"
              }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Property count badge — top right */}
      <div className="absolute top-3 right-3 z-10">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-slate-200/50">
          <MapPin className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-[11px] font-bold text-slate-700">{listings.length} נכסים</span>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-3 right-3 left-3 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-slate-200/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-600">
              {activeLayer === "3d-urban" ? "Glass-Tech 3D" : activeLayer === "terrain" ? "פני שטח 3D" : activeLayer === "satellite" ? "לוויין" : "מפה"}
            </span>
          </div>
          <span className="text-[9px] text-slate-400">Toro · Mapbox</span>
        </div>
      </div>
    </div>
  );
};
