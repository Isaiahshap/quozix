"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Zap,
  Wind,
  Tv2,
  Radio,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Info,
  RotateCcw,
} from "lucide-react";
import { GlobeWrapper } from "@/components/Globe/GlobeWrapper";
import { Panel } from "@/components/UI/Panel";
import { Button } from "@/components/UI/Button";
import { Badge } from "@/components/UI/Badge";
import { Toggle } from "@/components/UI/Toggle";
import { Chip } from "@/components/UI/Badge";
import type { GlobePoint, GlobeArc, AircraftPosition, Signal, LayerType } from "@/lib/types";
import { fetchGDELTSignals, fetchSignalsFallback } from "@/lib/fetchers/gdelt";
import { fetchAircraft } from "@/lib/fetchers/opensky";
import { formatRelativeTime, getCountryFlag, truncate } from "@/lib/utils";

const TIME_WINDOWS = [
  { label: "1h", value: "60" },
  { label: "6h", value: "360" },
  { label: "24h", value: "1440" },
  { label: "7d", value: "10080" },
] as const;

export default function GlobePage() {
  const [points, setPoints] = useState<GlobePoint[]>([]);
  const [arcs, setArcs] = useState<GlobeArc[]>([]);
  const [aircraft, setAircraft] = useState<AircraftPosition[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<GlobePoint | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [layers, setLayers] = useState<Record<LayerType, boolean>>({
    signals: true,
    air: true,
    streams: false,
    radio: false,
  });
  const [lowPower, setLowPower] = useState(false);
  const [timeWindow, setTimeWindow] = useState<string>("1440");
  const [airAvailable, setAirAvailable] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Signals
      const [signalData, airData] = await Promise.allSettled([
        fetchGDELTSignals("conflict military airstrike protest earthquake", timeWindow),
        fetchAircraft(),
      ]);

      const sigs = signalData.status === "fulfilled" ? signalData.value : await fetchSignalsFallback();
      setSignals(sigs);

      const pts: GlobePoint[] = [];
      const arcList: GlobeArc[] = [];

      if (layers.signals) {
        sigs.filter((s) => s.geo).forEach((s) => {
          pts.push({
            lat: s.geo!.lat,
            lng: s.geo!.lng,
            type: "signal",
            payloadId: s.id,
            label: truncate(s.title, 60),
            intensity: Math.min((s.sourceCount || 1) / 8, 1),
          });
        });

        // Arcs: signal flows from source origin (approximated from domain)
        if (!lowPower) {
          sigs
            .filter((s) => s.geo)
            .slice(0, 10)
            .forEach((s, i) => {
              if (i % 2 === 0) {
                arcList.push({
                  startLat: 38.9,
                  startLng: -77.0,
                  endLat: s.geo!.lat,
                  endLng: s.geo!.lng,
                  label: s.title.slice(0, 40),
                  color: "rgba(0,212,255,0.6)",
                });
              }
            });
        }
      }

      // Aircraft
      if (airData.status === "fulfilled") {
        const air = airData.value;
        setAircraft(air);
        setAirAvailable(true);
        if (layers.air) {
          air.slice(0, 50).forEach((a) => {
            pts.push({
              lat: a.latitude,
              lng: a.longitude,
              type: "air",
              payloadId: a.icao24,
              label: a.callsign || a.icao24,
              intensity: 0.5,
            });
          });
        }
      } else {
        setAirAvailable(false);
      }

      setPoints(pts);
      setArcs(arcList);
    } finally {
      setLoading(false);
    }
  }, [layers, lowPower, timeWindow]);

  useEffect(() => {
    loadData();
  }, [timeWindow]);

  useEffect(() => {
    // Rebuild points when layers change
    const pts: GlobePoint[] = [];
    if (layers.signals) {
      signals.filter((s) => s.geo).forEach((s) => {
        pts.push({
          lat: s.geo!.lat,
          lng: s.geo!.lng,
          type: "signal",
          payloadId: s.id,
          label: truncate(s.title, 60),
          intensity: Math.min((s.sourceCount || 1) / 8, 1),
        });
      });
    }
    if (layers.air) {
      aircraft.slice(0, 50).forEach((a) => {
        pts.push({
          lat: a.latitude,
          lng: a.longitude,
          type: "air",
          payloadId: a.icao24,
          label: a.callsign || a.icao24,
          intensity: 0.5,
        });
      });
    }
    setPoints(pts);
  }, [layers, signals, aircraft]);

  const handlePointClick = (point: GlobePoint) => {
    setSelectedPoint(point);
    if (point.type === "signal") {
      const sig = signals.find((s) => s.id === point.payloadId);
      setSelectedSignal(sig || null);
    } else {
      setSelectedSignal(null);
    }
  };

  const toggleLayer = (layer: LayerType) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col lg:flex-row relative overflow-hidden">
      {/* Globe */}
      <div className="flex-1 relative">
        <GlobeWrapper
          points={points}
          arcs={arcs}
          aircraft={aircraft}
          lowPowerMode={lowPower}
          onPointClick={handlePointClick}
          className="w-full h-full"
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-[#0d0f14]/90 rounded-full border border-[#1e2433] text-xs text-[#94a3b8] font-body">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Loading signals...
          </div>
        )}

        {/* Layer controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d0f14]/95 backdrop-blur-md border border-[#1e2433]">
            <Layers className="w-3.5 h-3.5 text-[#475569]" />
            <span className="text-[10px] font-heading uppercase tracking-widest text-[#475569]">Layers</span>
          </div>
          {([
            { key: "signals" as LayerType, label: "Signals", Icon: Zap, color: "#f59e0b" },
            { key: "air" as LayerType, label: "Aircraft", Icon: Wind, color: "#00d4ff" },
          ]).map(({ key, label, Icon, color }) => (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-body transition-all backdrop-blur-md border ${
                layers[key]
                  ? "bg-[#0d0f14]/95 border-[#1e2433] text-[#e2e8f0]"
                  : "bg-[#0d0f14]/70 border-[#1e2433]/50 text-[#475569]"
              }`}
              aria-pressed={layers[key]}
            >
              <Icon className="w-3 h-3" style={{ color: layers[key] ? color : undefined }} />
              {label}
              <span
                className="ml-auto w-2 h-2 rounded-full"
                style={{ backgroundColor: layers[key] ? color : "#1e2433" }}
              />
            </button>
          ))}
          {!airAvailable && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[10px] text-[#f59e0b] font-body">
              <AlertCircle className="w-3 h-3" />
              Aircraft: sample
            </div>
          )}
        </div>

        {/* Time window + settings */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0d0f14]/95 backdrop-blur-md border border-[#1e2433]">
            {TIME_WINDOWS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTimeWindow(value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-body transition-all ${
                  timeWindow === value
                    ? "bg-[#00d4ff]/15 text-[#00d4ff]"
                    : "text-[#475569] hover:text-[#94a3b8]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d0f14]/95 backdrop-blur-md border border-[#1e2433]">
            <Toggle
              checked={lowPower}
              onChange={setLowPower}
              label="Low Power"
              size="sm"
            />
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d0f14]/95 backdrop-blur-md border border-[#1e2433] text-xs text-[#475569] hover:text-[#94a3b8] transition-colors font-body"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 lg:hidden flex flex-col gap-1 px-3 py-2 rounded-xl bg-[#0d0f14]/95 backdrop-blur-md border border-[#1e2433]">
          {[
            { color: "#f59e0b", label: "Signal" },
            { color: "#00d4ff", label: "Aircraft" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-[#475569] font-body">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right sidebar — details panel */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 400 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-[#0d0f14] border-l border-[#1e2433] z-20 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#1e2433]">
              <span className="text-sm font-semibold text-[#e2e8f0] font-heading">
                Point Detail
              </span>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-[#475569] hover:text-[#e2e8f0] transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <Badge
                  variant={
                    selectedPoint.type === "signal"
                      ? "amber"
                      : selectedPoint.type === "air"
                      ? "cyan"
                      : "purple"
                  }
                  size="xs"
                  dot
                >
                  {selectedPoint.type.toUpperCase()}
                </Badge>
                <p className="text-sm text-[#e2e8f0] font-body mt-2 leading-relaxed">
                  {selectedPoint.label}
                </p>
              </div>

              {selectedSignal && (
                <div className="space-y-3">
                  <div className="h-px bg-[#1e2433]" />
                  <p className="text-xs text-[#475569] font-body">
                    <span className="text-[#94a3b8]">Source:</span>{" "}
                    {selectedSignal.source}
                  </p>
                  <p className="text-xs text-[#475569] font-body">
                    <span className="text-[#94a3b8]">Published:</span>{" "}
                    {formatRelativeTime(selectedSignal.publishedAt)}
                  </p>
                  {selectedSignal.geo && (
                    <p className="text-xs text-[#475569] font-body">
                      <span className="text-[#94a3b8]">Location:</span>{" "}
                      {selectedSignal.geo.label}{" "}
                      <span className="text-[#1e2433]">(approximate)</span>
                    </p>
                  )}
                  {selectedSignal.sourceCount && selectedSignal.sourceCount >= 3 && (
                    <Badge variant="amber" size="xs">
                      {selectedSignal.sourceCount} sources
                    </Badge>
                  )}
                  <a
                    href={selectedSignal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="glow" className="w-full mt-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Read Article
                    </Button>
                  </a>
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/10">
                    <Info className="w-3 h-3 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[#475569] font-body">
                      Location is approximate. Based on keyword inference, not verified coordinates.
                    </p>
                  </div>
                </div>
              )}

              {selectedPoint.type === "air" && (
                <div>
                  <p className="text-xs text-[#94a3b8] font-body">
                    Callsign: <span className="text-[#e2e8f0]">{selectedPoint.label}</span>
                  </p>
                  <p className="text-[10px] text-[#475569] font-body mt-1">
                    Data from OpenSky public ADS-B feed. Incomplete — not for navigation use.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
