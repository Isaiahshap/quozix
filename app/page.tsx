"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Globe,
  Tv2,
  Radio,
  Radar,
  Zap,
  ArrowRight,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Panel, PanelHeader } from "@/components/UI/Panel";
import { Button } from "@/components/UI/Button";
import { Badge } from "@/components/UI/Badge";
import { Skeleton, SkeletonRow } from "@/components/UI/Skeleton";
import { fetchGDELTSignals, fetchSignalsFallback } from "@/lib/fetchers/gdelt";
import { fetchIPTVFallback } from "@/lib/fetchers/iptv";
import { fetchRadioFallback } from "@/lib/fetchers/radiobrowser";
import type { Signal, DataSourceStatus } from "@/lib/types";
import { formatRelativeTime, getCountryFlag, truncate, groupBy } from "@/lib/utils";
import { GlobeWrapper } from "@/components/Globe/GlobeWrapper";
import type { GlobePoint } from "@/lib/types";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function StatCounter({ value, label, icon: Icon, accent }: {
  value: number | string;
  label: string;
  icon: React.ElementType;
  accent: "cyan" | "purple" | "amber";
}) {
  const colors = {
    cyan: "text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/20",
    purple: "text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20",
    amber: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20",
  };

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-3 p-4 bg-[#0e1118] rounded-xl border border-[#1e2433]">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${colors[accent]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-2xl font-bold font-heading text-[#e2e8f0]">{value}</p>
        <p className="text-xs text-[#475569] font-body mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function SourceStatus({ sources }: { sources: DataSourceStatus[] }) {
  const statusIcons = {
    ok: <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" />,
    degraded: <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b]" />,
    error: <AlertCircle className="w-3.5 h-3.5 text-[#ef4444]" />,
    loading: <RefreshCw className="w-3.5 h-3.5 text-[#475569] animate-spin" />,
  };

  return (
    <div className="space-y-1.5">
      {sources.map((s) => (
        <div key={s.id} className="flex items-center gap-2.5 px-1 py-0.5">
          {statusIcons[s.status]}
          <span className="text-xs text-[#94a3b8] font-body flex-1">{s.name}</span>
          {s.message && (
            <span className="text-[10px] text-[#475569]">{s.message}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [channelCount, setChannelCount] = useState<number>(0);
  const [radioCount, setRadioCount] = useState<number>(0);
  const [globePoints, setGlobePoints] = useState<GlobePoint[]>([]);
  const [sources, setSources] = useState<DataSourceStatus[]>([
    { id: "gdelt", name: "GDELT Signals", status: "loading" },
    { id: "iptv", name: "IPTV Directory", status: "loading" },
    { id: "radio", name: "Radio Browser", status: "loading" },
  ]);

  const updateSource = useCallback((id: string, update: Partial<DataSourceStatus>) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...update } : s)));
  }, []);

  useEffect(() => {
    // Fetch signals
    (async () => {
      try {
        const data = await fetchGDELTSignals("conflict military airstrike protest", "1440");
        setSignals(data.length > 0 ? data : await fetchSignalsFallback());
        updateSource("gdelt", {
          status: "ok",
          message: `${data.length} signals`,
          lastChecked: Date.now(),
        });

        // Build globe points
        const pts: GlobePoint[] = data
          .filter((s) => s.geo)
          .map((s) => ({
            lat: s.geo!.lat,
            lng: s.geo!.lng,
            type: "signal" as const,
            payloadId: s.id,
            label: s.title.slice(0, 50),
            intensity: Math.min((s.sourceCount || 1) / 10, 1),
          }));
        setGlobePoints(pts);
      } catch {
        const fallback = await fetchSignalsFallback();
        setSignals(fallback);
        updateSource("gdelt", { status: "degraded", message: "Using cached" });
      } finally {
        setSignalsLoading(false);
      }
    })();

    // Fetch channel count
    (async () => {
      try {
        const channels = await fetchIPTVFallback();
        setChannelCount(channels.length || 8);
        updateSource("iptv", { status: "ok", message: `${channels.length} channels` });
      } catch {
        setChannelCount(8);
        updateSource("iptv", { status: "degraded" });
      }
    })();

    // Fetch radio count
    (async () => {
      try {
        const stations = await fetchRadioFallback();
        setRadioCount(stations.length || 10);
        updateSource("radio", { status: "ok", message: `${stations.length} stations` });
      } catch {
        setRadioCount(10);
        updateSource("radio", { status: "degraded" });
      }
    })();
  }, [updateSource]);

  // Trending regions
  const trendingRegions = (() => {
    const byGeo = signals.filter((s) => s.geo).map((s) => s.geo!.label.split(",")[0]);
    const counts: Record<string, number> = {};
    byGeo.forEach((r) => { counts[r] = (counts[r] || 0) + 1; });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => ({ key, count }));
  })();

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-0.5 bg-[#00d4ff]" />
            <span className="text-xs font-semibold font-heading tracking-widest text-[#00d4ff] uppercase">
              Intelligence Dashboard
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#e2e8f0] leading-tight">
            Global Signal{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6]">
              Monitor
            </span>
          </h1>
          <p className="text-sm text-[#475569] font-body mt-2 max-w-xl">
            Open-source intelligence dashboard. All data sourced from public APIs. Informational use only — data may be incomplete or delayed.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCounter value={signalsLoading ? "—" : signals.length} label="Signals (24h)" icon={Radar} accent="amber" />
          <StatCounter value={channelCount > 0 ? `${channelCount}+` : "—"} label="Live Channels" icon={Tv2} accent="cyan" />
          <StatCounter value={radioCount > 0 ? `${radioCount}+` : "—"} label="Radio Stations" icon={Radio} accent="purple" />
          <StatCounter value={trendingRegions.length} label="Trending Regions" icon={TrendingUp} accent="cyan" />
        </div>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/globe", label: "Open Globe", icon: Globe, color: "cyan" },
            { href: "/streams", label: "Watch TV", icon: Tv2, color: "purple" },
            { href: "/radio", label: "Radio", icon: Radio, color: "purple" },
            { href: "/intel", label: "Intel Feed", icon: Radar, color: "amber" },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium font-body border transition-all cursor-pointer ${
                  color === "cyan"
                    ? "bg-[#00d4ff]/8 text-[#00d4ff] border-[#00d4ff]/20 hover:bg-[#00d4ff]/15"
                    : color === "amber"
                    ? "bg-[#f59e0b]/8 text-[#f59e0b] border-[#f59e0b]/20 hover:bg-[#f59e0b]/15"
                    : "bg-[#8b5cf6]/8 text-[#8b5cf6] border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/15"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <ArrowRight className="w-3 h-3" />
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Globe preview */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <Panel className="overflow-hidden h-[320px] md:h-[400px]">
            <PanelHeader
              title="Globe Preview"
              icon={<Globe className="w-4 h-4" />}
              action={
                <Link href="/globe">
                  <Button size="xs" variant="glow">
                    Full View <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            />
            <div className="h-[calc(100%-44px)]">
              <GlobeWrapper points={globePoints} lowPowerMode={true} />
            </div>
          </Panel>
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Source health */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Panel>
              <PanelHeader
                title="Source Health"
                icon={<Activity className="w-4 h-4" />}
              />
              <div className="p-3">
                <SourceStatus sources={sources} />
              </div>
            </Panel>
          </motion.div>

          {/* Trending regions */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Panel>
              <PanelHeader
                title="Trending Regions"
                icon={<TrendingUp className="w-4 h-4" />}
                subtitle="By signal frequency"
              />
              <div className="p-3 space-y-1.5">
                {trendingRegions.length === 0 ? (
                  <>
                    <Skeleton className="h-6" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-4/6" />
                  </>
                ) : (
                  trendingRegions.map(({ key, count }, i) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <span className="text-[10px] text-[#475569] font-mono w-4 text-right">{i + 1}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div
                          className="h-1 rounded-full bg-gradient-to-r from-[#00d4ff]/60 to-[#8b5cf6]/40"
                          style={{ width: `${(count / (trendingRegions[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#94a3b8] font-body">{key}</span>
                      <Badge variant="amber" size="xs">{count}</Badge>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </motion.div>
        </div>

        {/* Signal feed */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3"
        >
          <Panel>
            <PanelHeader
              title="Top Signals"
              icon={<Radar className="w-4 h-4" />}
              subtitle="News mentions (last 24h) — informational only, not verified"
              action={
                <Link href="/intel">
                  <Button size="xs" variant="ghost">
                    View all <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            />
            <div className="divide-y divide-[#1e2433]">
              {signalsLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : signals.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#475569] font-body">
                  No signals available
                </div>
              ) : (
                signals.slice(0, 6).map((signal) => (
                  <motion.a
                    key={signal.id}
                    href={signal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 2 }}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#1e2433]/30 transition-colors group"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="text-sm">
                        {signal.geo ? getCountryFlag(signal.geo.label.split(",")[1]?.trim().slice(0, 2) || "XX") : "🌐"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#e2e8f0] font-body leading-snug group-hover:text-[#00d4ff] transition-colors">
                        {truncate(signal.title, 90)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#475569]">{signal.source}</span>
                        <span className="text-[#1e2433]">·</span>
                        <Clock className="w-2.5 h-2.5 text-[#475569]" />
                        <span className="text-[10px] text-[#475569]">{formatRelativeTime(signal.publishedAt)}</span>
                        {signal.geo && (
                          <>
                            <span className="text-[#1e2433]">·</span>
                            <span className="text-[10px] text-[#475569]">{signal.geo.label}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {signal.sourceCount && signal.sourceCount >= 3 && (
                      <Badge variant="amber" size="xs" className="flex-shrink-0">
                        {signal.sourceCount} sources
                      </Badge>
                    )}
                  </motion.a>
                ))
              )}
            </div>
          </Panel>
        </motion.div>
      </div>

      {/* Disclaimer */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mt-6"
      >
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/15">
          <AlertCircle className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#94a3b8] font-body leading-relaxed">
            <strong className="text-[#f59e0b]">Informational only.</strong>{" "}
            Data is sourced from public APIs (GDELT, IPTV-org, Radio Browser) and may be incomplete, delayed, or inaccurate.
            Quozix does not host any streams or claim editorial responsibility for linked content.
            Do not rely on this for safety-critical decisions.{" "}
            <Link href="/sources" className="text-[#00d4ff] hover:underline">
              Learn more →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
