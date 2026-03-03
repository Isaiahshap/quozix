"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  Search,
  Clock,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Globe,
  Info,
  Plus,
  X,
  Filter,
  TrendingUp,
} from "lucide-react";
import {
  fetchGDELTSignals,
  fetchSignalsFallback,
  DEFAULT_KEYWORDS,
} from "@/lib/fetchers/gdelt";
import type { Signal } from "@/lib/types";
import { Panel, PanelHeader } from "@/components/UI/Panel";
import { SearchInput } from "@/components/UI/Input";
import { Badge } from "@/components/UI/Badge";
import { Chip } from "@/components/UI/Badge";
import { Button } from "@/components/UI/Button";
import { SkeletonRow } from "@/components/UI/Skeleton";
import { formatRelativeTime, getCountryFlag, truncate, extractDomain } from "@/lib/utils";

const TIME_WINDOWS = [
  { label: "1h", value: "60" },
  { label: "6h", value: "360" },
  { label: "24h", value: "1440" },
  { label: "7d", value: "10080" },
];

function SignalCard({ signal }: { signal: Signal }) {
  const confidence =
    (signal.sourceCount || 1) >= 5
      ? "Multiple Sources"
      : (signal.sourceCount || 1) >= 3
      ? "Corroborated"
      : "Reported";

  const confidenceVariant: "green" | "amber" | "ghost" =
    confidence === "Multiple Sources"
      ? "green"
      : confidence === "Corroborated"
      ? "amber"
      : "ghost";

  return (
    <motion.a
      href={signal.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ x: 2 }}
      className="flex items-start gap-3 px-4 py-4 border-b border-[#1e2433] last:border-0 hover:bg-[#1e2433]/30 transition-colors group"
    >
      {/* Source image */}
      <div className="w-8 h-8 rounded-lg bg-[#1e2433] border border-[#2a3347] flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
        {signal.imageUrl ? (
          <img
            src={signal.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <Globe className="w-3.5 h-3.5 text-[#475569]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#e2e8f0] font-body leading-snug group-hover:text-[#00d4ff] transition-colors">
          {signal.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] text-[#475569] font-mono">{signal.domain}</span>
          <span className="text-[#1e2433]">·</span>
          <div className="flex items-center gap-1 text-[10px] text-[#475569]">
            <Clock className="w-2.5 h-2.5" />
            {formatRelativeTime(signal.publishedAt)}
          </div>
          {signal.geo && (
            <>
              <span className="text-[#1e2433]">·</span>
              <span className="text-[10px] text-[#475569]">
                📍 {signal.geo.label}
                <span className="text-[#2a3347] ml-0.5">(approx.)</span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Badge variant={confidenceVariant} size="xs" dot>
            {confidence}
          </Badge>
          {signal.keywords.slice(0, 3).map((kw) => (
            <Badge key={kw} variant="ghost" size="xs">{kw}</Badge>
          ))}
        </div>
      </div>

      <ExternalLink className="w-3.5 h-3.5 text-[#475569] flex-shrink-0 mt-1 group-hover:text-[#00d4ff] transition-colors" />
    </motion.a>
  );
}

export default function IntelPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [timeWindow, setTimeWindow] = useState("1440");
  const [activeKeywords, setActiveKeywords] = useState<string[]>(["conflict"]);
  const [customKeyword, setCustomKeyword] = useState("");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(id);
  }, [query]);

  const loadSignals = useCallback(async () => {
    setLoading(true);
    try {
      const searchQuery =
        debouncedQuery ||
        (activeKeywords.length > 0
          ? activeKeywords.slice(0, 5).join(" OR ")
          : DEFAULT_KEYWORDS.slice(0, 3).join(" OR "));

      const data = await fetchGDELTSignals(searchQuery, timeWindow);
      if (data.length === 0) {
        const fallback = await fetchSignalsFallback();
        setSignals(fallback);
        setIsFallback(true);
      } else {
        setSignals(data);
        setIsFallback(false);
      }
      setLastUpdated(Date.now());
    } catch {
      const fallback = await fetchSignalsFallback();
      setSignals(fallback);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, activeKeywords, timeWindow]);

  useEffect(() => {
    loadSignals();
  }, [debouncedQuery, activeKeywords, timeWindow]);

  const toggleKeyword = (kw: string) => {
    setActiveKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  const addCustomKeyword = () => {
    const kw = customKeyword.trim().toLowerCase();
    if (kw && !activeKeywords.includes(kw)) {
      setActiveKeywords((prev) => [...prev, kw]);
    }
    setCustomKeyword("");
  };

  const filteredSignals = useMemo(() => {
    if (!query) return signals;
    const q = query.toLowerCase();
    return signals.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.domain.includes(q) ||
        s.geo?.label.toLowerCase().includes(q)
    );
  }, [signals, query]);

  // Domain frequency for insights
  const topDomains = useMemo(() => {
    const map: Record<string, number> = {};
    signals.forEach((s) => { map[s.domain] = (map[s.domain] || 0) + 1; });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [signals]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-48px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 border-r border-[#1e2433] bg-[#0d0f14] flex flex-col overflow-hidden">
        <div className="p-3 border-b border-[#1e2433] space-y-3">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-[#f59e0b]" />
            <span className="font-heading font-semibold text-sm text-[#e2e8f0]">Intel Feed</span>
          </div>

          {/* Time window */}
          <div>
            <p className="text-[10px] text-[#475569] font-heading uppercase tracking-widest mb-1.5">Time Window</p>
            <div className="flex gap-1">
              {TIME_WINDOWS.map(({ label, value }) => (
                <Chip
                  key={value}
                  active={timeWindow === value}
                  onClick={() => setTimeWindow(value)}
                  className="flex-1 justify-center"
                >
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <p className="text-[10px] text-[#475569] font-heading uppercase tracking-widest mb-1.5">Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_KEYWORDS.map((kw) => (
                <Chip
                  key={kw}
                  active={activeKeywords.includes(kw)}
                  onClick={() => toggleKeyword(kw)}
                >
                  {kw}
                </Chip>
              ))}
            </div>
          </div>

          {/* Custom keyword */}
          <div>
            <p className="text-[10px] text-[#475569] font-heading uppercase tracking-widest mb-1.5">Custom Keyword</p>
            <div className="flex gap-1.5">
              <input
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomKeyword()}
                placeholder="e.g. Tehran"
                className="flex-1 bg-[#12141a] border border-[#1e2433] text-[#e2e8f0] rounded-lg px-2.5 py-1.5 text-xs font-body placeholder:text-[#475569] focus:outline-none focus:border-[#00d4ff]/40"
              />
              <button
                onClick={addCustomKeyword}
                className="p-1.5 rounded-lg bg-[#1e2433] text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
                aria-label="Add keyword"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {activeKeywords.filter((kw) => !DEFAULT_KEYWORDS.includes(kw)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {activeKeywords
                  .filter((kw) => !DEFAULT_KEYWORDS.includes(kw))
                  .map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20"
                    >
                      {kw}
                      <button
                        onClick={() => toggleKeyword(kw)}
                        className="hover:text-white"
                        aria-label={`Remove ${kw}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={loadSignals}
            loading={loading}
            className="w-full"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        {/* Top sources */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-[10px] text-[#475569] font-heading uppercase tracking-widest">Top Sources</p>
          {topDomains.map(([domain, count]) => (
            <div key={domain} className="flex items-center gap-2">
              <div
                className="h-1 rounded-full bg-[#f59e0b]/40 flex-shrink-0"
                style={{
                  width: `${(count / (topDomains[0]?.[1] || 1)) * 60}px`,
                }}
              />
              <span className="text-xs text-[#94a3b8] font-body truncate">{domain}</span>
              <Badge variant="ghost" size="xs" className="ml-auto">{count}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-[#1e2433] flex items-center gap-3">
          <div className="flex-1">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter signals..."
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#475569] font-body flex-shrink-0">
            {lastUpdated && (
              <span>Updated {formatRelativeTime(new Date(lastUpdated).toISOString())}</span>
            )}
            <Badge variant={isFallback ? "amber" : "ghost"} size="xs">
              {filteredSignals.length} signals
            </Badge>
          </div>
        </div>

        {/* Warning */}
        <div className="px-4 py-2 border-b border-[#1e2433] flex items-start gap-2 bg-[#f59e0b]/3">
          <Info className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#475569] font-body leading-relaxed">
            <strong className="text-[#f59e0b]">INFORMATIONAL ONLY.</strong>{" "}
            Data from GDELT public API. Articles are news mentions — not verified events.
            Locations are approximate inferences. Not for operational or safety-critical use.
          </p>
        </div>

        {isFallback && (
          <div className="mx-4 mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f59e0b]/8 border border-[#f59e0b]/15 text-xs text-[#f59e0b] font-body">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            GDELT unreachable — showing cached sample data
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : filteredSignals.length === 0 ? (
            <div className="p-8 text-center">
              <Radar className="w-10 h-10 text-[#1e2433] mx-auto mb-3" />
              <p className="text-sm text-[#475569] font-body">No signals found</p>
            </div>
          ) : (
            filteredSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
