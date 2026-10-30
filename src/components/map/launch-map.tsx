"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import Supercluster from "supercluster";
import { LaunchLogo } from "@/components/launch-logo";
import { getLaunchType, LAUNCH_TYPES } from "@/config/launch-types";
import type { Launch } from "@/lib/types";

// Free, no API key, commercial use allowed: https://openfreemap.org
const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";
// Where the action is: after showing the whole country, the map glides here.
const ACCRA = { center: [-0.185, 5.585] as [number, number], zoom: 12.8 };
const CLUSTER_UNTIL_ZOOM = 9;

const GHANA_BOUNDS: [[number, number], [number, number]] = [
  [-3.26, 4.7],
  [1.2, 11.18],
];

type Props = { launches: Launch[]; className?: string; interactiveScroll?: boolean };
type PointProps = { id: string; type: string };

function initials(name: string) {
  const w = name.trim().split(/\s+/);
  return (w.length > 1 ? w[0][0] + w[1][0] : name.slice(0, 2)).toUpperCase();
}

function pinElement(launch: Launch, onClick: () => void) {
  const color = getLaunchType(launch.type).color;
  const el = document.createElement("button");
  el.type = "button";
  el.className = "gm-pin";
  el.style.setProperty("--ring", color);
  el.setAttribute("aria-label", `${launch.name}, ${getLaunchType(launch.type).label}`);
  if (launch.logo_url) {
    const img = document.createElement("img");
    img.src = launch.logo_url;
    img.alt = "";
    img.loading = "lazy";
    el.append(img);
  } else {
    el.textContent = initials(launch.name);
    el.style.color = color;
  }
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return el;
}

function clusterElement(count: number, mix: Record<string, number>, onClick: () => void) {
  // The ring shows the mix of types inside the cluster.
  let at = 0;
  const stops = Object.entries(mix).map(([type, n]) => {
    const from = (at / count) * 360;
    at += n;
    return `${getLaunchType(type).color} ${from}deg ${(at / count) * 360}deg`;
  });
  const size = Math.min(72, 38 + Math.log2(count) * 7);
  const el = document.createElement("button");
  el.type = "button";
  el.className = "gm-cluster";
  el.style.width = el.style.height = `${size}px`;
  el.style.background = `conic-gradient(${stops.join(",")})`;
  el.setAttribute("aria-label", `${count} launches here, zoom in`);
  el.innerHTML = `<span>${count}</span>`;
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return el;
}

export function LaunchMap({ launches, className, interactiveScroll = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [off, setOff] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(0);
  const [selected, setSelected] = useState<Launch | null>(null);

  const pinned = useMemo(() => launches.filter((l) => l.lat != null && l.lng != null), [launches]);
  const byId = useMemo(() => new Map(pinned.map((l) => [l.id, l])), [pinned]);
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of pinned) c[l.type] = (c[l.type] ?? 0) + 1;
    return c;
  }, [pinned]);

  const index = useMemo(() => {
    const sc = new Supercluster<PointProps, { mix: Record<string, number> }>({
      // Cluster only when zoomed out to regions; from city zoom in, pins overlap into a heap of logos.
      radius: 48,
      maxZoom: CLUSTER_UNTIL_ZOOM,
      map: (p) => ({ mix: { [p.type]: 1 } }),
      reduce: (acc, p) => {
        for (const [t, n] of Object.entries(p.mix)) acc.mix[t] = (acc.mix[t] ?? 0) + n;
      },
    });
    sc.load(
      pinned
        .filter((l) => !off.has(l.type))
        .map((l) => ({
          type: "Feature" as const,
          properties: { id: l.id, type: l.type },
          geometry: { type: "Point" as const, coordinates: [l.lng!, l.lat!] },
        })),
    );
    return sc;
  }, [pinned, off]);

  // Load MapLibre only when the map is about to scroll into view (it's ~200 KB).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || mapRef.current) return;
        io.disconnect();
        const maplibre = await import("maplibre-gl");
        if (cancelled) return;
        maplibre.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        const map = new maplibre.Map({
          container: el,
          style: STYLE_URL,
          bounds: GHANA_BOUNDS,
          fitBoundsOptions: { padding: { top: 40, bottom: 150, left: 24, right: 24 } }, // keep Ghana clear of the chips
          attributionControl: { compact: true },
          cooperativeGestures: !interactiveScroll,
          dragRotate: false,
          pitchWithRotate: false,
        });
        map.touchZoomRotate.disableRotation();
        map.on("click", () => setSelected(null));
        map.on("load", () => {
          map.resize();
          setReady(true);
          // Open on Ghana, then fly into Accra unless the visitor has already started exploring.
          let touched = false;
          map.once("dragstart", () => (touched = true));
          map.once("zoomstart", (e) => {
            if (e.originalEvent) touched = true;
          });
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          setTimeout(() => {
            if (!touched) map.flyTo({ ...ACCRA, duration: reduce ? 0 : 2600, essential: false });
          }, 1200);
        });
        resizeObserver = new ResizeObserver(() => map.resize());
        resizeObserver.observe(el);
        mapRef.current = map;
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [interactiveScroll]);

  // Draw pins and clusters for the current view.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    let frame = 0;
    const render = async () => {
      const maplibre = await import("maplibre-gl");
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      const b = map.getBounds();
      const zoom = Math.round(map.getZoom());
      const features = index.getClusters([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], zoom);
      let count = 0;
      for (const f of features) {
        const [lng, lat] = f.geometry.coordinates as [number, number];
        let el: HTMLElement;
        if ("cluster" in f.properties && f.properties.cluster) {
          const id = f.properties.cluster_id as number;
          const n = f.properties.point_count as number;
          count += n;
          el = clusterElement(n, (f.properties as unknown as { mix: Record<string, number> }).mix, () =>
            map.easeTo({ center: [lng, lat], zoom: Math.max(index.getClusterExpansionZoom(id), CLUSTER_UNTIL_ZOOM + 1) }),
          );
        } else {
          const launch = byId.get((f.properties as PointProps).id);
          if (!launch) continue;
          count += 1;
          el = pinElement(launch, () => setSelected(launch));
        }
        markersRef.current.push(new maplibre.Marker({ element: el }).setLngLat([lng, lat]).addTo(map));
      }
      setVisibleCount(count);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    };
    schedule();
    map.on("moveend", schedule);
    return () => {
      cancelAnimationFrame(frame);
      map.off("moveend", schedule);
    };
  }, [ready, index, byId]);

  const toggle = (type: string) =>
    setOff((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });

  return (
    <div className={`relative overflow-hidden bg-coal ${className ?? ""}`}>
      <div ref={containerRef} className="h-full w-full" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-3 sm:p-5">
        {selected && (
          <div className="pointer-events-auto w-full max-w-sm rounded-3xl bg-coal/95 p-4 shadow-2xl ring-1 ring-line backdrop-blur">
            <div className="flex items-start gap-3">
              <LaunchLogo name={selected.name} logoUrl={selected.logo_url} type={selected.type} size={52} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-semibold">{selected.name}</p>
                <p className="line-clamp-2 text-sm text-muted">{selected.tagline}</p>
                <p className="mt-2 text-sm">
                  <span style={{ color: getLaunchType(selected.type).color }}>{getLaunchType(selected.type).label}</span>
                  {selected.city && <span className="text-muted"> in {selected.city}</span>}
                </p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close" className="-mt-1 -mr-1 rounded-full p-2 text-muted hover:text-chalk">
                ✕
              </button>
            </div>
            <Link href={`/launch/${selected.slug}`} className="btn mt-4 w-full !py-2.5">
              Open {selected.name}
            </Link>
          </div>
        )}

        <p className="rounded-full bg-coal/90 px-4 py-1.5 font-display text-sm text-chalk ring-1 ring-line backdrop-blur" aria-live="polite">
          {visibleCount} {visibleCount === 1 ? "launch" : "launches"} on the map
        </p>

        <div className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto rounded-full bg-coal/90 p-1.5 ring-1 ring-line backdrop-blur [scrollbar-width:none]">
          {LAUNCH_TYPES.filter((t) => typeCounts[t.value]).map((t) => {
            const on = !off.has(t.value);
            return (
              <button
                key={t.value}
                onClick={() => toggle(t.value)}
                aria-pressed={on}
                className="flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 font-display text-sm font-semibold transition-opacity"
                style={{ color: t.color, background: on ? `${t.color}26` : "transparent", opacity: on ? 1 : 0.45 }}
              >
                {t.label}
                <span className="rounded-full px-1.5 text-xs tabular-nums" style={{ background: `${t.color}33` }}>
                  {typeCounts[t.value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
