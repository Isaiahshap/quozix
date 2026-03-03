"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";
import type { GlobePoint, GlobeArc, AircraftPosition, Signal } from "@/lib/types";

export type GlobeViewHandle = {
  focusPoint: (lat: number, lng: number) => void;
};

interface GlobeViewProps {
  points?: GlobePoint[];
  arcs?: GlobeArc[];
  aircraft?: AircraftPosition[];
  lowPowerMode?: boolean;
  onPointClick?: (point: GlobePoint) => void;
  className?: string;
}

// Color map by type
const TYPE_COLORS: Record<string, string> = {
  signal: "#f59e0b",
  air: "#00d4ff",
  stream: "#8b5cf6",
  radio: "#00ff88",
};

export const GlobeView = forwardRef<GlobeViewHandle, GlobeViewProps>(
  (
    {
      points = [],
      arcs = [],
      aircraft = [],
      lowPowerMode = false,
      onPointClick,
      className,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const globeRef = useRef<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [webglSupported, setWebglSupported] = useState(true);

    useImperativeHandle(ref, () => ({
      focusPoint: (lat: number, lng: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = globeRef.current as any;
        if (g && g.pointOfView) {
          g.pointOfView({ lat, lng, altitude: 1.5 }, 1000);
        }
      },
    }));

    const initGlobe = useCallback(async () => {
      if (!containerRef.current) return;

      // Check WebGL support
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
          setWebglSupported(false);
          setLoading(false);
          return;
        }
      } catch {
        setWebglSupported(false);
        setLoading(false);
        return;
      }

      try {
        const GlobeGL = (await import("globe.gl")).default;

        const container = containerRef.current;
        const width = container.clientWidth || 600;
        const height = container.clientHeight || 500;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globe = (GlobeGL as any)();
        globe(container);
        globeRef.current = globe;

        globe
          .width(width)
          .height(height)
          .backgroundColor("rgba(0,0,0,0)")
          .globeImageUrl(
            "https://unpkg.com/three-globe/example/img/earth-dark.jpg"
          )
          .bumpImageUrl(
            "https://unpkg.com/three-globe/example/img/earth-topology.png"
          )
          .showAtmosphere(true)
          .atmosphereColor("#00d4ff")
          .atmosphereAltitude(0.1);

        // Auto-rotate
        if (!lowPowerMode) {
          globe.controls().autoRotate = true;
          globe.controls().autoRotateSpeed = 0.4;
        }

        globe.controls().enableZoom = true;
        globe.controls().minDistance = 150;
        globe.controls().maxDistance = 600;

        // Points
        globe
          .pointsData(points)
          .pointLat((p: GlobePoint) => p.lat)
          .pointLng((p: GlobePoint) => p.lng)
          .pointColor((p: GlobePoint) => TYPE_COLORS[p.type] || "#ffffff")
          .pointRadius((p: GlobePoint) => (p.intensity || 0.5) * 0.5 + 0.3)
          .pointAltitude(0.01)
          .pointLabel((p: GlobePoint) => p.label || p.type)
          .onPointClick((p: GlobePoint) => onPointClick?.(p));

        // Arcs
        if (!lowPowerMode) {
          globe
            .arcsData(arcs)
            .arcStartLat((a: GlobeArc) => a.startLat)
            .arcStartLng((a: GlobeArc) => a.startLng)
            .arcEndLat((a: GlobeArc) => a.endLat)
            .arcEndLng((a: GlobeArc) => a.endLng)
            .arcColor((a: GlobeArc) => a.color || "#00d4ff")
            .arcAltitude(0.3)
            .arcStroke(0.5)
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashAnimateTime(2000);
        }

        // Aircraft as custom objects (triangles)
        if (aircraft.length > 0) {
          globe
            .customLayerData(aircraft)
            .customThreeObject(() => {
              // Simple dot for aircraft
              const THREE = (GlobeGL as unknown as { THREE: typeof import("three") }).THREE;
              if (!THREE) return null;
              const geo = new THREE.SphereGeometry(0.3, 4, 4);
              const mat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
              return new THREE.Mesh(geo, mat);
            })
            .customThreeObjectUpdate((obj: unknown, d: AircraftPosition) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (globe as any).getCoords(d.latitude, d.longitude, 0.01, (coords: { x: number; y: number; z: number }) => {
                (obj as { position: { set: (x: number, y: number, z: number) => void } }).position.set(coords.x, coords.y, coords.z);
              });
            });
        }

        // Handle resize
        const ro = new ResizeObserver(() => {
          if (containerRef.current) {
            globe
              .width(containerRef.current.clientWidth)
              .height(containerRef.current.clientHeight);
          }
        });
        ro.observe(container);

        setLoading(false);

        return () => {
          ro.disconnect();
          globe._destructor?.();
        };
      } catch (err) {
        setError("Failed to initialize globe.");
        setLoading(false);
      }
    }, [points, arcs, aircraft, lowPowerMode, onPointClick]);

    useEffect(() => {
      const cleanup = initGlobe();
      return () => {
        cleanup?.then((fn) => fn?.());
      };
    }, []);

    // Update data without re-init
    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = globeRef.current as any;
      if (!g) return;
      g.pointsData(points);
      if (!lowPowerMode) {
        g.arcsData(arcs);
      }
    }, [points, arcs, lowPowerMode]);

    if (!webglSupported) {
      return null; // Parent will render fallback map
    }

    return (
      <div className={`relative w-full h-full ${className || ""}`}>
        <div ref={containerRef} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#08090c]">
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full border-2 border-[#00d4ff]/20 border-t-[#00d4ff]"
              />
              <p className="text-xs text-[#475569] font-body">Initializing globe...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <AlertTriangle className="w-8 h-8 text-[#f59e0b]" />
              <p className="text-sm text-[#94a3b8] font-body">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

GlobeView.displayName = "GlobeView";
