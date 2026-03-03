"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv2,
  Search,
  Heart,
  Star,
  AlertCircle,
  RefreshCw,
  Globe,
  Filter,
  X,
} from "lucide-react";
import { fetchIPTVIndex, fetchIPTVFallback } from "@/lib/fetchers/iptv";
import { toggleFavorite, isFavorite } from "@/lib/cache";
import type { StreamChannel } from "@/lib/types";
import { VideoPlayer } from "@/components/Player/VideoPlayer";
import { Panel, PanelHeader } from "@/components/UI/Panel";
import { SearchInput } from "@/components/UI/Input";
import { Badge } from "@/components/UI/Badge";
import { Chip } from "@/components/UI/Badge";
import { Button } from "@/components/UI/Button";
import { SkeletonCard } from "@/components/UI/Skeleton";
import { getCountryFlag, truncate, groupBy } from "@/lib/utils";

function ChannelCard({
  channel,
  active,
  onClick,
  isFav,
  onFav,
}: {
  channel: StreamChannel;
  active: boolean;
  onClick: () => void;
  isFav: boolean;
  onFav: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-[#1e2433] last:border-0 ${
        active
          ? "bg-[#00d4ff]/8 border-l-2 border-l-[#00d4ff]"
          : "hover:bg-[#1e2433]/30"
      }`}
    >
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg bg-[#1e2433] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#2a3347]">
        {channel.logoUrl && !imgError ? (
          <img
            src={channel.logoUrl}
            alt={channel.name}
            className="w-full h-full object-contain p-1"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-xs font-bold text-[#475569] font-heading">
            {channel.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{getCountryFlag(channel.countryCode)}</span>
          <p className="text-sm font-medium text-[#e2e8f0] font-body truncate">
            {channel.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {channel.categories[0] && (
            <Badge variant="ghost" size="xs">{channel.categories[0]}</Badge>
          )}
          {channel.languages[0] && (
            <Badge variant="ghost" size="xs">{channel.languages[0]}</Badge>
          )}
        </div>
      </div>

      {/* Fav */}
      <button
        onClick={(e) => { e.stopPropagation(); onFav(); }}
        className="flex-shrink-0 p-1 rounded text-[#475569] hover:text-[#f59e0b] transition-colors"
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={`w-3.5 h-3.5 ${isFav ? "fill-[#f59e0b] text-[#f59e0b]" : ""}`}
        />
      </button>
    </motion.div>
  );
}

export default function StreamsPage() {
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [selected, setSelected] = useState<StreamChannel | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [showFavs, setShowFavs] = useState(false);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchIPTVIndex();
        if (data.length === 0) throw new Error("Empty");
        setChannels(data);
        setIsFallback(false);
      } catch {
        try {
          const fallback = await fetchIPTVFallback();
          setChannels(fallback);
          setIsFallback(true);
        } catch {
          setError("Failed to load channels.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("quozix_fav_stream");
      setFavIds(stored ? JSON.parse(stored) : []);
    }
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    channels.forEach((c) => c.categories.forEach((cat) => cats.add(cat)));
    return Array.from(cats).sort().slice(0, 12);
  }, [channels]);

  const countries = useMemo(() => {
    const map: Record<string, number> = {};
    channels.forEach((c) => {
      if (c.countryCode) map[c.countryCode] = (map[c.countryCode] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([code]) => code);
  }, [channels]);

  const filtered = useMemo(() => {
    let list = channels;
    if (showFavs) list = list.filter((c) => favIds.includes(c.id));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.categories.some((cat) => cat.toLowerCase().includes(q)) ||
          c.countryCode.toLowerCase().includes(q)
      );
    }
    if (activeCategory) list = list.filter((c) => c.categories.includes(activeCategory));
    if (activeCountry) list = list.filter((c) => c.countryCode === activeCountry);
    return list.slice(0, 200);
  }, [channels, search, activeCategory, activeCountry, showFavs, favIds]);

  const handleFav = useCallback((id: string) => {
    toggleFavorite("stream", id);
    setFavIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveCountry(null);
    setShowFavs(false);
  };

  const hasFilters = search || activeCategory || activeCountry || showFavs;

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col lg:flex-row overflow-hidden">
      {/* Channel list */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col border-r border-[#1e2433] bg-[#0d0f14] flex-shrink-0 lg:h-full overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-[#1e2433] space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tv2 className="w-4 h-4 text-[#8b5cf6]" />
              <span className="font-heading font-semibold text-sm text-[#e2e8f0]">
                Live TV
              </span>
              {!loading && (
                <Badge variant="ghost" size="xs">{filtered.length}</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFavs(!showFavs)}
                className={`p-1.5 rounded-lg transition-colors ${showFavs ? "text-[#f59e0b] bg-[#f59e0b]/10" : "text-[#475569] hover:text-[#94a3b8]"}`}
                aria-label="Show favorites"
              >
                <Star className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-lg transition-colors ${showFilters ? "text-[#00d4ff] bg-[#00d4ff]/10" : "text-[#475569] hover:text-[#94a3b8]"}`}
                aria-label="Toggle filters"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                  aria-label="Clear filters"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
          />

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-1 space-y-2">
                  <div>
                    <p className="text-[10px] text-[#475569] font-heading uppercase tracking-widest mb-1.5">Category</p>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <Chip
                          key={cat}
                          active={activeCategory === cat}
                          onClick={() =>
                            setActiveCategory(activeCategory === cat ? null : cat)
                          }
                        >
                          {cat}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#475569] font-heading uppercase tracking-widest mb-1.5">Country</p>
                    <div className="flex flex-wrap gap-1.5">
                      {countries.map((cc) => (
                        <Chip
                          key={cc}
                          active={activeCountry === cc}
                          onClick={() =>
                            setActiveCountry(activeCountry === cc ? null : cc)
                          }
                        >
                          {getCountryFlag(cc)} {cc}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CORS/fallback warning */}
        {isFallback && (
          <div className="mx-3 mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f59e0b]/8 border border-[#f59e0b]/15 text-xs text-[#f59e0b] font-body flex-shrink-0">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Showing curated sample — full playlist blocked by CORS
          </div>
        )}

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-[#ef4444] mx-auto mb-2" />
              <p className="text-sm text-[#94a3b8] font-body">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-[#475569] font-body">No channels found</p>
              {hasFilters && (
                <Button size="sm" variant="ghost" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            filtered.map((ch) => (
              <ChannelCard
                key={ch.id}
                channel={ch}
                active={selected?.id === ch.id}
                onClick={() => setSelected(ch)}
                isFav={favIds.includes(ch.id)}
                onFav={() => handleFav(ch.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Player area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <VideoPlayer channel={selected} />

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold font-heading text-[#e2e8f0]">
                  {selected.name}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-base">{getCountryFlag(selected.countryCode)}</span>
                  <span className="text-sm text-[#475569] font-body">{selected.countryCode}</span>
                  {selected.categories.map((cat) => (
                    <Badge key={cat} variant="purple" size="xs">{cat}</Badge>
                  ))}
                  {selected.languages.map((lang) => (
                    <Badge key={lang} variant="ghost" size="xs">{lang}</Badge>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant={favIds.includes(selected.id) ? "secondary" : "ghost"}
                onClick={() => handleFav(selected.id)}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${favIds.includes(selected.id) ? "fill-[#f59e0b] text-[#f59e0b]" : ""}`}
                />
                {favIds.includes(selected.id) ? "Favorited" : "Favorite"}
              </Button>
            </div>

            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/10">
              <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#94a3b8] font-body leading-relaxed">
                Stream availability depends on third-party broadcasters. Quozix does not host any content.
                If the stream fails, try opening it directly or check back later.
              </p>
            </div>
          </motion.div>
        )}

        {!selected && (
          <div className="h-48 flex flex-col items-center justify-center text-center gap-3">
            <Tv2 className="w-12 h-12 text-[#1e2433]" />
            <p className="text-sm text-[#475569] font-body">
              Select a channel from the list to begin watching
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
