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
import { AlertTriangle } from "lucide-react";
import type { GlobePoint } from "@/lib/types";

export type GlobeViewHandle = {
  focusPoint: (lat: number, lng: number, altitude?: number) => void;
};

interface GlobeViewProps {
  points?: GlobePoint[];
  onPointClick?: (point: GlobePoint) => void;
  onPointHover?: (point: GlobePoint | null) => void;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  tv:     "#00d4ff",  // cyan   — TV news only
  radio:  "#00ff88",  // green  — radio news only
  both:   "#8b5cf6",  // purple — both TV + radio
  signal: "#f59e0b",
  air:    "#00d4ff",
  stream: "#8b5cf6",
};

const TYPE_ALTITUDE: Record<string, number> = {
  tv:    0.012,
  radio: 0.012,
  both:  0.018,
};

export const GlobeView = forwardRef<GlobeViewHandle, GlobeViewProps>(
  ({ points = [], onPointClick, onPointHover, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const globeRef = useRef<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [webglSupported, setWebglSupported] = useState(true);

    useImperativeHandle(ref, () => ({
      focusPoint: (lat: number, lng: number, altitude = 1.4) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = globeRef.current as any;
        if (g?.pointOfView) {
          g.pointOfView({ lat, lng, altitude }, 1000);
        }
      },
    }));

    const initGlobe = useCallback(async () => {
      if (!containerRef.current) return;

      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
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
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globe = (GlobeGL as any)();
        globe(container);
        globeRef.current = globe;

        globe
          .width(width)
          .height(height)
          .backgroundColor("rgba(0,0,0,0)")
          .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
          .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
          .showAtmosphere(true)
          .atmosphereColor("rgba(0,180,255,0.15)")
          .atmosphereAltitude(0.15);

        const controls = globe.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
        controls.enableZoom = true;
        controls.maxDistance = 700;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;

        // Deeper pinch zoom on mobile (smaller minDistance = camera can move closer)
        const mobileMq = window.matchMedia("(max-width: 639px)");
        const applyZoomLimits = () => {
          const mobile = mobileMq.matches;
          controls.minDistance = mobile ? 78 : 180;
          // Slightly faster dolly on touch viewports
          controls.zoomSpeed = mobile ? 1.4 : 1;
        };
        applyZoomLimits();
        mobileMq.addEventListener("change", applyZoomLimits);

        // Stop auto-rotate on user interaction, restart after idle
        let rotateTimer: ReturnType<typeof setTimeout> | null = null;
        container.addEventListener("pointerdown", () => {
          globe.controls().autoRotate = false;
          if (rotateTimer) clearTimeout(rotateTimer);
          rotateTimer = setTimeout(() => {
            globe.controls().autoRotate = true;
          }, 4000);
        }, { passive: true });

        globe
          .pointsData(points)
          .pointLat((p: GlobePoint) => p.lat)
          .pointLng((p: GlobePoint) => p.lng)
          .pointColor((p: GlobePoint) => TYPE_COLORS[p.type] || "#ffffff")
          .pointRadius((p: GlobePoint) => {
            const base = p.type === "both" ? 0.55 : 0.45;
            return base + (p.intensity || 0.5) * 0.35;
          })
          .pointAltitude((p: GlobePoint) => TYPE_ALTITUDE[p.type] || 0.012)
          .pointLabel((p: GlobePoint) => {
            const tvLine = p.tvCount ? `<span style="color:#00d4ff">▶ ${p.tvCount} TV</span>` : "";
            const radioLine = p.radioCount ? `<span style="color:#00ff88">📻 ${p.radioCount} Radio</span>` : "";
            const divider = tvLine && radioLine ? " &nbsp;·&nbsp; " : "";
            return `
              <div style="background:rgba(8,9,12,0.92);border:1px solid rgba(255,255,255,0.08);
                border-radius:8px;padding:8px 12px;font-family:sans-serif;min-width:140px">
                <div style="font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:4px">${p.label || ""}</div>
                <div style="font-size:11px;color:#94a3b8">${tvLine}${divider}${radioLine}</div>
              </div>`;
          })
          .onPointClick((p: GlobePoint) => {
            globe.controls().autoRotate = false;
            onPointClick?.(p);
          })
          .onPointHover((p: GlobePoint | null) => onPointHover?.(p));

        const ro = new ResizeObserver(() => {
          if (containerRef.current) {
            globe.width(containerRef.current.clientWidth).height(containerRef.current.clientHeight);
          }
        });
        ro.observe(container);

        setLoading(false);

        return () => {
          mobileMq.removeEventListener("change", applyZoomLimits);
          ro.disconnect();
          if (rotateTimer) clearTimeout(rotateTimer);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (globe as any)._destructor?.();
        };
      } catch {
        setError("Failed to initialize globe.");
        setLoading(false);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const cleanup = initGlobe();
      return () => {
        cleanup?.then((fn) => fn?.());
      };
    }, [initGlobe]);

    // Update points data without full re-init
    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = globeRef.current as any;
      if (!g) return;
      g.pointsData(points)
        .onPointClick((p: GlobePoint) => {
          g.controls().autoRotate = false;
          onPointClick?.(p);
        })
        .onPointHover((p: GlobePoint | null) => onPointHover?.(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [points]);

    if (!webglSupported) return null;

    return (
      <div className={`relative w-full h-full ${className || ""}`}>
        <div ref={containerRef} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#08090c]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full border-2 border-[#00d4ff]/20 border-t-[#00d4ff]"
            />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <AlertTriangle className="w-8 h-8 text-[#f59e0b]" />
              <p className="text-sm text-[#94a3b8]">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

GlobeView.displayName = "GlobeView";
