"use client";

import {
  useState, useEffect, useMemo, useCallback, useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv, Radio, X, Search, Globe2, Loader2, Play, RefreshCw,
  Volume2, VolumeX, Maximize2, ExternalLink, Pause,
  AlertTriangle, ChevronDown, Info,
} from "lucide-react";
import { GlobeWrapper } from "@/components/Globe/GlobeWrapper";
import type { GlobeViewHandle } from "@/components/Globe/GlobeView";
import { fetchNewsTV, fetchNewsRadio } from "@/lib/fetchers/news";
import { COUNTRY_CENTROIDS } from "@/lib/geo";
import { getCountryFlag, cn } from "@/lib/utils";
import type { StreamChannel, RadioStation, GlobePoint } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    const fn = (e: MediaQueryListEvent) => {
      setMobile(e.matches);
    };
    mql.addEventListener("change", fn);
    return () => mql.removeEventListener("change", fn);
  }, []);
  return mobile;
}

function useHLSPlayer(
  mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>,
  streamUrl: string | null
) {
  const hlsRef = useRef<import("hls.js").default | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearErrorTimer = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  // Delays showing an error by 10 s so the user sees "Loading…" first.
  const scheduleError = useCallback((msg: string) => {
    clearErrorTimer();
    errorTimerRef.current = setTimeout(() => {
      setError(msg);
      setLoading(false);
    }, 10_000);
  }, [clearErrorTimer]);

  const destroy = useCallback(() => {
    clearErrorTimer();
    hlsRef.current?.destroy();
    hlsRef.current = null;
  }, [clearErrorTimer]);

  const load = useCallback(async () => {
    const el = mediaRef.current;
    if (!el || !streamUrl) return;
    destroy();
    setError(null);
    setLoading(true);

    const isHLS = streamUrl.includes(".m3u8") || streamUrl.includes("/hls/");
    const nativeHLS = (el as HTMLVideoElement).canPlayType?.("application/vnd.apple.mpegurl");

    if (isHLS && !nativeHLS) {
      try {
        const Hls = (await import("hls.js")).default;
        if (!Hls.isSupported()) { setError("HLS not supported."); setLoading(false); return; }
        const hls = new Hls({ enableWorker: false, lowLatencyMode: false });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(el as HTMLVideoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          el.play()
            .then(() => { clearErrorTimer(); setLoading(false); setPlaying(true); })
            .catch(() => setLoading(false));
        });
        hls.on(Hls.Events.ERROR, (_: unknown, d: { fatal?: boolean }) => {
          if (d.fatal) { scheduleError("This stream may be blocked or geo-restricted."); }
        });
      } catch { setError("Failed to load stream."); setLoading(false); }
    } else {
      (el as HTMLVideoElement).src = streamUrl;
      el.load();
      el.play()
        .then(() => { clearErrorTimer(); setLoading(false); setPlaying(true); })
        .catch(() => { scheduleError("This stream may be blocked or geo-restricted."); });
    }
  }, [streamUrl, destroy, scheduleError, clearErrorTimer, mediaRef]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWait = () => setLoading(true);
    const onPlayingEv = () => { clearErrorTimer(); setLoading(false); };
    const onErr = () => { scheduleError("This stream may be blocked or geo-restricted."); };
    el.addEventListener("play", onPlay); el.addEventListener("pause", onPause);
    el.addEventListener("waiting", onWait); el.addEventListener("playing", onPlayingEv);
    el.addEventListener("error", onErr);
    return () => {
      el.removeEventListener("play", onPlay); el.removeEventListener("pause", onPause);
      el.removeEventListener("waiting", onWait); el.removeEventListener("playing", onPlayingEv);
      el.removeEventListener("error", onErr);
    };
  }, [mediaRef, clearErrorTimer, scheduleError]);

  const toggle = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (playing) el.pause(); else el.play().catch(() => {});
  }, [playing, mediaRef]);

  return { playing, loading, error, load, destroy, toggle, setError };
}

// ─── Video Lightbox ───────────────────────────────────────────────────────────

function VideoLightbox({
  channel, onClose,
}: {
  channel: StreamChannel;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playing, loading, error, load, destroy, toggle } = useHLSPlayer(
    videoRef as React.RefObject<HTMLVideoElement>,
    channel.streamUrl
  );

  useEffect(() => { load(); return destroy; }, [channel.streamUrl, load, destroy]);

  // Track slow-loading state for progressive messaging
  useEffect(() => {
    if (!loading || error) { setSlowLoad(false); return; }
    setSlowLoad(false);
    const t = setTimeout(() => setSlowLoad(true), 5000);
    return () => clearTimeout(t);
  }, [loading, error]);

  // Set initial volume
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard + scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") { e.preventDefault(); toggle(); }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handler);
    };
  }, [onClose, toggle]);

  const bumpControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }, [playing]);

  useEffect(() => { if (!playing) setControlsVisible(true); }, [playing]);

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) { videoRef.current.volume = v; setMuted(v === 0); }
  };

  const toggleMute = () => {
    if (videoRef.current) { videoRef.current.muted = !muted; }
    setMuted((m) => !m);
  };

  const countryInfo = COUNTRY_CENTROIDS[channel.countryCode];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-black flex flex-col"
      onMouseMove={bumpControls}
      onTouchStart={bumpControls}
    >
      {/* Video element */}
      <div className="flex-1 relative flex items-center justify-center bg-black" onClick={toggle}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          muted={muted}
          aria-label={`Live stream: ${channel.name}`}
        />

        {/* Loading */}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-[#00d4ff] animate-spin" />
              <p className="text-xs text-white/40 transition-opacity duration-500">
                {slowLoad ? "Taking longer than expected…" : "Loading…"}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/80 p-8">
            <AlertTriangle className="w-10 h-10 text-[#f59e0b]" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-[#e2e8f0]">This stream may be blocked or geo-restricted.</p>
              <p className="text-xs text-[#475569]">Try retrying, or watch on the channel&apos;s official site.</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); load(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e2433] text-[#e2e8f0] text-sm hover:bg-[#2a3347] active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
              {channel.website && (
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(channel.website, "_blank", "noopener"); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 text-sm hover:bg-[#00d4ff]/15 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Watch on site
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top gradient + close */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/70 to-transparent"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white active:scale-90 transition-transform"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                {channel.logoUrl && (
                  <img
                    src={channel.logoUrl}
                    alt=""
                    className="w-6 h-6 rounded object-contain opacity-80"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <p className="text-sm font-medium text-white/90 max-w-[180px] truncate">{channel.name}</p>
              </div>
              {playing && (
                <span className="text-[10px] font-bold tracking-widest text-[#ef4444] bg-[#ef4444]/15 border border-[#ef4444]/20 px-2 py-0.5 rounded">
                  ● LIVE
                </span>
              )}
              {!playing && <div className="w-16" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient + controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
          >
            {/* Channel meta */}
            <div className="px-4 pb-3 flex items-center gap-2">
              <span className="text-xl">{getCountryFlag(channel.countryCode)}</span>
              <span className="text-sm text-white/60">{countryInfo?.name || channel.countryCode}</span>
            </div>
            {/* Control bar */}
            <div className="flex items-center gap-2 px-4 pb-2">
              <button
                onClick={(e) => { e.stopPropagation(); toggle(); }}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md active:scale-90 transition-transform"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : playing ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 active:scale-90 transition-transform"
              >
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolume}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 h-1 accent-white cursor-pointer"
                aria-label="Volume"
              />
              <button
                onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen(); }}
                className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 active:scale-90 transition-transform"
                aria-label="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              {channel.website && (
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(channel.website, "_blank", "noopener"); }}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 active:scale-90 transition-transform"
                  aria-label="Open on website"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Audio Bar ────────────────────────────────────────────────────────────────

function AudioBar({ station, onClose }: { station: RadioStation; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const { playing, loading, error, load, destroy, toggle } = useHLSPlayer(
    audioRef as React.RefObject<HTMLAudioElement>,
    station.streamUrl
  );

  useEffect(() => { load(); return destroy; }, [station.streamUrl, load, destroy]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) { audioRef.current.volume = v; setMuted(v === 0); }
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !muted;
    setMuted((m) => !m);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 360, damping: 32 }}
      className="fixed bottom-0 inset-x-0 z-40 glass border-t border-[#1e2433]/70"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <audio ref={audioRef} className="sr-only" aria-label={`Radio: ${station.name}`} />
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Logo */}
        <div className="w-9 h-9 rounded-lg bg-[#0d0f14] border border-[#1e2433] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {station.favicon ? (
            <img src={station.favicon} alt="" className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <Radio className="w-4 h-4 text-[#00ff88]" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#e2e8f0] truncate">{station.name}</p>
            {playing && (
              <span className="flex-shrink-0 text-[9px] font-bold tracking-widest text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-1.5 py-0.5 rounded">
                ON AIR
              </span>
            )}
            {error && (
              <span className="flex-shrink-0 text-[9px] font-bold text-[#f59e0b]">● ERROR</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{getCountryFlag(station.countryCode || "")}</span>
            <p className="text-[10px] text-[#475569] truncate">
              {[station.bitrate ? `${station.bitrate}k` : null, station.codec].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        {/* Waveform */}
        {playing && (
          <div className="flex items-end gap-px h-5 flex-shrink-0">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-[#00ff88] rounded-full"
                animate={{ scaleY: [0.3, 1, 0.4, 0.8, 0.2] }}
                transition={{
                  duration: 0.6 + i * 0.05,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: i * 0.06,
                }}
                style={{ height: "100%", transformOrigin: "bottom" }}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <button onClick={toggle} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0d0f14] border border-[#1e2433] text-[#94a3b8] hover:text-white active:scale-90 transition-all flex-shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center text-[#475569] hover:text-[#94a3b8] active:scale-90 transition-all flex-shrink-0 hidden sm:flex">
          {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
          onChange={handleVolume} className="w-16 h-0.5 accent-[#00ff88] cursor-pointer hidden sm:block"
          aria-label="Volume" />
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#475569] hover:text-[#ef4444] active:scale-90 transition-all flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Channel / Station Rows ───────────────────────────────────────────────────

function ChannelRow({ channel, isActive, onClick }: {
  channel: StreamChannel; isActive: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors group touch-manipulation",
        isActive ? "bg-[#00d4ff]/6 border-l-2 border-[#00d4ff]" : "active:bg-[#0e1118] hover:bg-[#0e1118] border-l-2 border-transparent"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden",
        isActive ? "bg-[#00d4ff]/10" : "bg-[#0d0f14] border border-[#1e2433]"
      )}>
        {channel.logoUrl ? (
          <img src={channel.logoUrl} alt="" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <Tv className={cn("w-4 h-4", isActive ? "text-[#00d4ff]" : "text-[#2a3347]")} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate transition-colors leading-tight",
          isActive ? "text-[#00d4ff]" : "text-[#e2e8f0]"
        )}>
          {channel.name}
        </p>
        {isActive && (
          <p className="text-[10px] text-[#ef4444] font-semibold mt-0.5">● LIVE</p>
        )}
      </div>
      <div className={cn(
        "w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-all",
        isActive ? "bg-[#00d4ff]/10" : "bg-transparent group-hover:bg-[#1e2433]"
      )}>
        {isActive
          ? <Pause className="w-3.5 h-3.5 text-[#00d4ff]" />
          : <Play className="w-3.5 h-3.5 text-[#2a3347] group-hover:text-[#00d4ff] transition-colors" />
        }
      </div>
    </button>
  );
}

function StationRow({ station, isActive, onClick }: {
  station: RadioStation; isActive: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors group touch-manipulation",
        isActive ? "bg-[#00ff88]/5 border-l-2 border-[#00ff88]" : "active:bg-[#0e1118] hover:bg-[#0e1118] border-l-2 border-transparent"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden",
        isActive ? "bg-[#00ff88]/10" : "bg-[#0d0f14] border border-[#1e2433]"
      )}>
        {station.favicon ? (
          <img src={station.favicon} alt="" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <Radio className={cn("w-4 h-4", isActive ? "text-[#00ff88]" : "text-[#2a3347]")} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate leading-tight transition-colors",
          isActive ? "text-[#00ff88]" : "text-[#e2e8f0]"
        )}>
          {station.name}
        </p>
        <p className="text-[10px] text-[#475569] truncate mt-0.5">
          {[station.bitrate ? `${station.bitrate}k` : null, station.codec, station.language]
            .filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className={cn(
        "w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-all",
        isActive ? "bg-[#00ff88]/10" : "bg-transparent group-hover:bg-[#1e2433]"
      )}>
        {isActive
          ? <Pause className="w-3.5 h-3.5 text-[#00ff88]" />
          : <Play className="w-3.5 h-3.5 text-[#2a3347] group-hover:text-[#00ff88] transition-colors" />
        }
      </div>
    </button>
  );
}

// ─── Disclaimer Modal ─────────────────────────────────────────────────────────

function DisclaimerModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 glass rounded-2xl p-6 max-w-md w-full space-y-4 border border-[#1e2433]/70"
        style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" />
            <h2 className="font-heading font-semibold text-[#e2e8f0] text-base leading-tight">
              About Quozix News
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#475569] hover:text-[#e2e8f0] hover:bg-[#1e2433] transition-all flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 text-sm text-[#94a3b8] leading-relaxed">
          <p>
            <span className="text-[#e2e8f0] font-medium">Quozix News</span> is a free, open-source
            viewer for publicly available IPTV streams and live radio broadcasts from around the
            world. It is built on top of community-maintained stream indexes and the{" "}
            <a href="https://www.radio-browser.info" target="_blank" rel="noopener noreferrer"
              className="text-[#00d4ff] hover:underline">Radio Browser API</a>.
          </p>
          <p>
            Quozix News does <span className="text-[#e2e8f0]">not</span> host, own, or operate any
            of the streams shown. All content belongs to its respective broadcasters and rights
            holders. This site functions solely as a directory and player pointing to existing
            publicly accessible stream URLs.
          </p>
          <p>
            <span className="text-[#e2e8f0] font-medium">Some streams may not work</span> — this
            is normal. Streams can go offline, be geo-restricted to certain countries, or change
            URLs at any time. If a stream doesn&apos;t load after 10 seconds, try the &ldquo;Watch
            on site&rdquo; fallback link.
          </p>
          <p>
            Quozix News is open source and free for anyone to use. No data is collected, no
            accounts required, no ads.
          </p>
        </div>

        <div className="pt-1 border-t border-[#1e2433]/60 space-y-2">
          <p className="text-xs text-[#475569]">
            Questions, suggestions, or want to stay updated?
          </p>
          <a
            href="mailto:yeshayashapiro@gmail.com"
            className="inline-flex items-center gap-1.5 text-xs text-[#00d4ff] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            yeshayashapiro@gmail.com
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const isMobile = useIsMobile();

  const [tvChannels, setTvChannels] = useState<StreamChannel[]>([]);
  const [radioStations, setRadioStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadPhase, setLoadPhase] = useState("Connecting to world feeds...");

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeStream, setActiveStream] = useState<StreamChannel | null>(null);
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [panelTab, setPanelTab] = useState<"tv" | "radio">("tv");
  const [showTv, setShowTv] = useState(true);
  const [showRadio, setShowRadio] = useState(true);
  const [search, setSearch] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const globeRef = useRef<GlobeViewHandle>(null);

  useEffect(() => {
    async function load() {
      setLoadPhase("Loading TV news channels...");
      const [tvResult, radioResult] = await Promise.allSettled([
        fetchNewsTV(),
        fetchNewsRadio(),
      ]);
      if (tvResult.status === "fulfilled") setTvChannels(tvResult.value);
      setLoadPhase("Loading news radio stations...");
      if (radioResult.status === "fulfilled") setRadioStations(radioResult.value);
      setLoading(false);
    }
    load();
  }, []);

  const globePoints = useMemo<GlobePoint[]>(() => {
    const counts = new Map<string, { tv: number; radio: number }>();
    if (showTv) {
      for (const ch of tvChannels) {
        const cc = ch.countryCode?.toUpperCase();
        if (!cc || cc === "XX" || cc.length !== 2 || !COUNTRY_CENTROIDS[cc]) continue;
        const e = counts.get(cc) ?? { tv: 0, radio: 0 };
        e.tv++;
        counts.set(cc, e);
      }
    }
    if (showRadio) {
      for (const st of radioStations) {
        const cc = st.countryCode?.toUpperCase();
        if (!cc || cc.length !== 2 || !COUNTRY_CENTROIDS[cc]) continue;
        const e = counts.get(cc) ?? { tv: 0, radio: 0 };
        e.radio++;
        counts.set(cc, e);
      }
    }
    return Array.from(counts.entries()).map(([cc, c]) => {
      const centroid = COUNTRY_CENTROIDS[cc];
      const type = c.tv > 0 && c.radio > 0 ? "both" : c.tv > 0 ? "tv" : "radio";
      return {
        lat: centroid.lat, lng: centroid.lng,
        type: type as GlobePoint["type"],
        payloadId: cc,
        label: `${getCountryFlag(cc)} ${centroid.name}`,
        intensity: Math.min(0.25 + ((c.tv + c.radio) / 40) * 0.75, 1),
        tvCount: c.tv, radioCount: c.radio,
      };
    });
  }, [tvChannels, radioStations, showTv, showRadio]);

  const selectedTv = useMemo(() => {
    if (!selectedCountry) return [];
    const seen = new Set<string>();
    return tvChannels.filter((ch) => {
      if (ch.countryCode?.toUpperCase() !== selectedCountry) return false;
      if (search && !ch.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (seen.has(ch.id)) return false;
      seen.add(ch.id);
      return true;
    });
  }, [tvChannels, selectedCountry, search]);

  const selectedRadio = useMemo(() => {
    if (!selectedCountry) return [];
    const seen = new Set<string>();
    return radioStations.filter((st) => {
      if (st.countryCode?.toUpperCase() !== selectedCountry) return false;
      if (search && !st.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (seen.has(st.id)) return false;
      seen.add(st.id);
      return true;
    });
  }, [radioStations, selectedCountry, search]);

  const handlePointClick = useCallback((point: GlobePoint) => {
    const cc = point.payloadId;
    setSelectedCountry(cc);
    setSearch("");
    const hasTv = tvChannels.some((ch) => ch.countryCode?.toUpperCase() === cc);
    const hasRadio = radioStations.some((st) => st.countryCode?.toUpperCase() === cc);
    if (!hasTv && hasRadio) setPanelTab("radio"); else setPanelTab("tv");
    if (!isMobile) globeRef.current?.focusPoint(point.lat, point.lng, 1.5);
  }, [tvChannels, radioStations, isMobile]);

  const playChannel = useCallback((ch: StreamChannel) => {
    setActiveStream(ch);
    setActiveStation(null);
  }, []);

  const playStation = useCallback((st: RadioStation) => {
    setActiveStation(st);
    setActiveStream(null);
  }, []);

  const closeStream = useCallback(() => setActiveStream(null), []);
  const closeStation = useCallback(() => setActiveStation(null), []);
  const closePanel = useCallback(() => { setSelectedCountry(null); setSearch(""); }, []);

  const selectedInfo = selectedCountry ? COUNTRY_CENTROIDS[selectedCountry] : null;

  // Audio bar should be above bottom panel on mobile — add bottom offset
  const audioBarVisible = !!activeStation;
  const audioBarH = 68; // approximate height of AudioBar in px

  return (
    <div className="relative w-screen bg-[#08090c]" style={{ height: "100dvh" }}>

      {/* ── Globe ── */}
      <div className="absolute inset-0 z-0">
        <GlobeWrapper
          ref={globeRef}
          points={globePoints}
          onPointClick={handlePointClick}
          className="w-full h-full"
        />
      </div>

      {/* ── Vignette ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(8,9,12,0.65) 100%)" }}
      />

      {/* ── Loading ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#08090c]"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border border-[#00d4ff]/10 flex items-center justify-center">
                <Globe2 className="w-7 h-7 text-[#00d4ff]" />
              </div>
              <motion.div
                animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00d4ff]/50"
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-heading font-semibold text-[#e2e8f0] tracking-widest">QUOZIX NEWS</p>
              <p className="text-xs text-[#475569]">{loadPhase}</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1 h-1 rounded-full bg-[#00d4ff]/40"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-3 px-3 sm:px-4 py-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 glass rounded-xl px-3 py-2 flex-shrink-0">
          <Globe2 className="w-4 h-4 text-[#00d4ff]" />
          <span className="font-heading font-semibold text-xs text-[#e2e8f0] tracking-widest">QUOZIX NEWS</span>
          {!loading && (
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#1e2433]">
              <span className="text-[10px] text-[#475569] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] inline-block" />
                {tvChannels.length.toLocaleString()} TV
              </span>
              <span className="text-[10px] text-[#475569] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] inline-block" />
                {radioStations.length.toLocaleString()} Radio
              </span>
            </div>
          )}
        </div>

        {/* Filter toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTv(!showTv)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all glass touch-manipulation",
              showTv ? "text-[#00d4ff] border border-[#00d4ff]/25 bg-[#00d4ff]/5" : "text-[#475569] border border-[#1e2433]/40"
            )}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TV</span>
          </button>
          <button
            onClick={() => setShowRadio(!showRadio)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all glass touch-manipulation",
              showRadio ? "text-[#00ff88] border border-[#00ff88]/25 bg-[#00ff88]/5" : "text-[#475569] border border-[#1e2433]/40"
            )}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Radio</span>
          </button>
        </div>
      </header>

      {/* ── Country Panel ── */}
      <AnimatePresence>
        {selectedCountry && selectedInfo && (
          <>
            {/* Mobile backdrop (tap to dismiss) */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[25] bg-black/30"
                onClick={closePanel}
              />
            )}

            <motion.aside
              key={selectedCountry}
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className={cn(
                "absolute z-30 flex flex-col glass overflow-hidden",
                isMobile
                  ? "bottom-0 left-0 right-0 rounded-t-2xl border-t border-[#1e2433]/70"
                  : "right-0 top-0 bottom-0 w-[340px] sm:w-[380px] border-l border-[#1e2433]/70"
              )}
              style={isMobile ? {
                height: audioBarVisible ? `calc(72dvh - ${audioBarH}px)` : "72dvh",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              } : {
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              {/* Drag handle (mobile only) */}
              {isMobile && (
                <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
                  <div className="w-10 h-1 rounded-full bg-[#2a3347]" />
                </div>
              )}

              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2433]/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{getCountryFlag(selectedCountry)}</span>
                  <div>
                    <h2 className="text-sm font-heading font-semibold text-[#e2e8f0] leading-tight">
                      {selectedInfo.name}
                    </h2>
                    <p className="text-[10px] text-[#475569] mt-0.5">
                      {selectedTv.length} TV · {selectedRadio.length} Radio
                    </p>
                  </div>
                </div>
                <button
                  onClick={closePanel}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#e2e8f0] hover:bg-[#1e2433] active:scale-90 transition-all touch-manipulation"
                  aria-label="Close"
                >
                  {isMobile ? <ChevronDown className="w-5 h-5" /> : <X className="w-4 h-4" />}
                </button>
              </div>

              {/* Tabs */}
              {(selectedTv.length > 0 || selectedRadio.length > 0) && (
                <div className="flex border-b border-[#1e2433]/50 flex-shrink-0">
                  {selectedTv.length > 0 && (
                    <button
                      onClick={() => setPanelTab("tv")}
                      className={cn(
                        "flex-1 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation",
                        panelTab === "tv" ? "text-[#00d4ff] border-b-2 border-[#00d4ff]" : "text-[#475569]"
                      )}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      TV <span className="opacity-50">({selectedTv.length})</span>
                    </button>
                  )}
                  {selectedRadio.length > 0 && (
                    <button
                      onClick={() => setPanelTab("radio")}
                      className={cn(
                        "flex-1 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation",
                        panelTab === "radio" ? "text-[#00ff88] border-b-2 border-[#00ff88]" : "text-[#475569]"
                      )}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      Radio <span className="opacity-50">({selectedRadio.length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Search */}
              <div className="px-3 py-2.5 border-b border-[#1e2433]/30 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2a3347] pointer-events-none" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search channels..."
                    className="w-full pl-8 pr-8 py-2.5 text-sm bg-[#08090c]/70 border border-[#1e2433]/50 rounded-xl text-[#e2e8f0] placeholder:text-[#2a3347] focus:outline-none focus:border-[#00d4ff]/30 transition-colors"
                  />
                  {search && (
                    <button onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] touch-manipulation">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Channel list */}
              <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
                {panelTab === "tv" && (
                  selectedTv.length > 0 ? (
                    <div className="divide-y divide-[#1e2433]/20">
                      {selectedTv.map((ch) => (
                        <ChannelRow
                          key={ch.id} channel={ch}
                          isActive={activeStream?.id === ch.id}
                          onClick={() => playChannel(ch)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Tv className="w-10 h-10 text-[#1e2433]" />
                      <p className="text-sm text-[#475569]">
                        {search ? "No channels match" : "No TV news channels"}
                      </p>
                    </div>
                  )
                )}
                {panelTab === "radio" && (
                  selectedRadio.length > 0 ? (
                    <div className="divide-y divide-[#1e2433]/20">
                      {selectedRadio.map((st) => (
                        <StationRow
                          key={st.id} station={st}
                          isActive={activeStation?.id === st.id}
                          onClick={() => playStation(st)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Radio className="w-10 h-10 text-[#1e2433]" />
                      <p className="text-sm text-[#475569]">
                        {search ? "No stations match" : "No news radio stations"}
                      </p>
                    </div>
                  )
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Video Lightbox ── */}
      <AnimatePresence>
        {activeStream && (
          <VideoLightbox channel={activeStream} onClose={closeStream} />
        )}
      </AnimatePresence>

      {/* ── Audio Bar ── */}
      <AnimatePresence>
        {activeStation && (
          <AudioBar station={activeStation} onClose={closeStation} />
        )}
      </AnimatePresence>

      {/* ── Legend (desktop only) ── */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-5 right-5 z-20 glass rounded-xl px-3 py-2.5 space-y-1.5 hidden sm:block"
          style={{ pointerEvents: "none" }}
        >
          {[
            { color: "#00d4ff", glow: "rgba(0,212,255,0.6)", label: "TV News" },
            { color: "#00ff88", glow: "rgba(0,255,136,0.6)", label: "News Radio" },
            { color: "#8b5cf6", glow: "rgba(139,92,246,0.6)", label: "Both" },
          ].map(({ color, glow, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${glow}` }} />
              <span className="text-[10px] text-[#475569]">{label}</span>
            </div>
          ))}
          <div className="pt-1 border-t border-[#1e2433]/50">
            <p className="text-[9px] text-[#2a3347]">Tap any dot to explore</p>
          </div>
        </motion.div>
      )}

      {/* ── Bottom-left actions ── */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}
          className="absolute bottom-5 left-5 z-20 flex items-center gap-2"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {/* Disclaimer */}
          <button
            onClick={() => setShowDisclaimer(true)}
            className="flex items-center gap-1.5 glass rounded-xl px-2.5 py-2 text-[#475569] hover:text-[#94a3b8] transition-colors touch-manipulation"
            aria-label="About & Disclaimer"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">About</span>
          </button>

          {/* Buy Me a Coffee */}
          <a
            href="https://www.buymeacoffee.com/yeshayashap"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 glass rounded-xl px-2.5 py-2 text-[#f59e0b] hover:text-[#fbbf24] transition-colors touch-manipulation"
            aria-label="Buy Me a Coffee"
          >
            <span className="text-sm leading-none">☕</span>
            <span className="text-[10px] hidden sm:inline">Support</span>
          </a>
        </motion.div>
      )}

      {/* ── Disclaimer Modal ── */}
      <AnimatePresence>
        {showDisclaimer && (
          <DisclaimerModal onClose={() => setShowDisclaimer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
