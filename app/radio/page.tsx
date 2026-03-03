"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Search,
  Heart,
  Star,
  AlertCircle,
  Filter,
  X,
  Globe,
} from "lucide-react";
import { searchRadioStations, getTopStations, fetchRadioFallback } from "@/lib/fetchers/radiobrowser";
import { toggleFavorite } from "@/lib/cache";
import type { RadioStation } from "@/lib/types";
import { AudioPlayer } from "@/components/Player/AudioPlayer";
import { Panel, PanelHeader } from "@/components/UI/Panel";
import { SearchInput, Input } from "@/components/UI/Input";
import { Badge } from "@/components/UI/Badge";
import { Chip } from "@/components/UI/Badge";
import { Button } from "@/components/UI/Button";
import { SkeletonCard } from "@/components/UI/Skeleton";
import { getCountryFlag, truncate } from "@/lib/utils";

const POPULAR_TAGS = ["news", "pop", "rock", "jazz", "classical", "talk", "sport", "electronic", "country", "folk"];
const POPULAR_COUNTRIES = ["US", "GB", "DE", "FR", "AU", "CA", "BR", "JP", "ES", "IT"];

function StationCard({
  station,
  active,
  onClick,
  isFav,
  onFav,
}: {
  station: RadioStation;
  active: boolean;
  onClick: () => void;
  isFav: boolean;
  onFav: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-[#1e2433] last:border-0 ${
        active
          ? "bg-[#8b5cf6]/8 border-l-2 border-l-[#8b5cf6]"
          : "hover:bg-[#1e2433]/30"
      }`}
    >
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg bg-[#1e2433] flex items-center justify-center flex-shrink-0 border border-[#2a3347] overflow-hidden">
        {station.favicon && !imgError ? (
          <img
            src={station.favicon}
            alt={station.name}
            className="w-full h-full object-contain p-1"
            onError={() => setImgError(true)}
          />
        ) : (
          <Radio className="w-4 h-4 text-[#475569]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {station.countryCode && (
            <span className="text-sm">{getCountryFlag(station.countryCode)}</span>
          )}
          <p className="text-sm font-medium text-[#e2e8f0] font-body truncate">
            {station.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {station.bitrate && (
            <Badge variant="ghost" size="xs">{station.bitrate}k</Badge>
          )}
          {station.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="ghost" size="xs">{tag}</Badge>
          ))}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onFav(); }}
        className={`flex-shrink-0 p-1 rounded transition-colors ${isFav ? "text-[#f59e0b]" : "text-[#475569] hover:text-[#f59e0b]"}`}
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-[#f59e0b]" : ""}`} />
      </button>
    </motion.div>
  );
}

export default function RadioPage() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [selected, setSelected] = useState<RadioStation | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [showFavs, setShowFavs] = useState(false);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("quozix_fav_radio");
      setFavIds(stored ? JSON.parse(stored) : []);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let data: RadioStation[];
        if (debouncedSearch || activeTag || activeCountry) {
          data = await searchRadioStations({
            name: debouncedSearch || undefined,
            tag: activeTag || undefined,
            countrycode: activeCountry || undefined,
            limit: 60,
          });
        } else {
          data = await getTopStations(60);
        }
        if (data.length === 0) {
          data = await fetchRadioFallback();
          setIsFallback(true);
        } else {
          setIsFallback(false);
        }
        setStations(data);
      } catch {
        const fallback = await fetchRadioFallback();
        setStations(fallback);
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedSearch, activeTag, activeCountry]);

  const displayed = useMemo(() => {
    if (showFavs) return stations.filter((s) => favIds.includes(s.id));
    return stations;
  }, [stations, showFavs, favIds]);

  const handleFav = useCallback((id: string) => {
    toggleFavorite("radio", id);
    setFavIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const hasFilters = search || activeTag || activeCountry || showFavs;
  const clearFilters = () => {
    setSearch("");
    setActiveTag(null);
    setActiveCountry(null);
    setShowFavs(false);
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col lg:flex-row overflow-hidden">
      {/* Station list */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col border-r border-[#1e2433] bg-[#0d0f14] flex-shrink-0 lg:h-full overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-[#1e2433] space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#8b5cf6]" />
              <span className="font-heading font-semibold text-sm text-[#e2e8f0]">
                Radio
              </span>
              {!loading && (
                <Badge variant="ghost" size="xs">{displayed.length}</Badge>
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
                aria-label="Filters"
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
            placeholder="Search stations..."
          />

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
                    <p className="text-[10px] text-[#475569] font-heading uppercase tracking-widest mb-1.5">Genre</p>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_TAGS.map((tag) => (
                        <Chip
                          key={tag}
                          active={activeTag === tag}
                          onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#475569] font-heading uppercase tracking-widest mb-1.5">Country</p>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_COUNTRIES.map((cc) => (
                        <Chip
                          key={cc}
                          active={activeCountry === cc}
                          onClick={() => setActiveCountry(activeCountry === cc ? null : cc)}
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

        {isFallback && (
          <div className="mx-3 mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f59e0b]/8 border border-[#f59e0b]/15 text-xs text-[#f59e0b] font-body flex-shrink-0">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Using curated fallback — Radio Browser unreachable
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-[#475569] font-body">No stations found</p>
              {hasFilters && (
                <Button size="sm" variant="ghost" onClick={clearFilters} className="mt-2">Clear filters</Button>
              )}
            </div>
          ) : (
            displayed.map((s) => (
              <StationCard
                key={s.id}
                station={s}
                active={selected?.id === s.id}
                onClick={() => setSelected(s)}
                isFav={favIds.includes(s.id)}
                onFav={() => handleFav(s.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Player */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <AudioPlayer station={selected} />

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold font-heading text-[#e2e8f0]">{selected.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {selected.countryCode && (
                    <span className="text-base">{getCountryFlag(selected.countryCode)}</span>
                  )}
                  <span className="text-sm text-[#475569] font-body">{selected.country}</span>
                  {selected.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="purple" size="xs">{tag}</Badge>
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
          </motion.div>
        )}

        {!selected && (
          <div className="h-48 flex flex-col items-center justify-center text-center gap-3">
            <Radio className="w-12 h-12 text-[#1e2433]" />
            <p className="text-sm text-[#475569] font-body">Select a station to start listening</p>
          </div>
        )}
      </div>
    </div>
  );
}
