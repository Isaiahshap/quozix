"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RadioStation } from "@/lib/types";
import { getCountryFlag } from "@/lib/utils";
import { Badge } from "@/components/UI/Badge";
import { IconButton, Button } from "@/components/UI/Button";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  station: RadioStation | null;
  onError?: (msg: string) => void;
}

export function AudioPlayer({ station, onError }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<import("hls.js").default | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setPlaying(false);
    setLoading(false);
    setError(null);
  }, []);

  const loadStream = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !station) return;

    cleanup();
    setLoading(true);
    setError(null);

    const url = station.streamUrl;
    if (!url) {
      setError("No stream URL available.");
      setLoading(false);
      return;
    }

    const isHLS = url.endsWith(".m3u8") || url.includes("/hls/");
    const nativeHLS = audio.canPlayType("application/vnd.apple.mpegurl");

    if (isHLS && !nativeHLS) {
      try {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: false });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(audio);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.volume = volume;
            audio.play().then(() => { setLoading(false); setPlaying(true); }).catch(() => {
              setLoading(false);
            });
          });
          hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal?: boolean }) => {
            if (data.fatal) {
              setError("Stream unavailable.");
              setLoading(false);
              onError?.("Stream error");
            }
          });
        } else {
          setError("HLS not supported.");
          setLoading(false);
        }
      } catch {
        setError("Failed to load stream.");
        setLoading(false);
      }
    } else {
      audio.src = url;
      audio.volume = volume;
      audio.load();
      audio
        .play()
        .then(() => { setLoading(false); setPlaying(true); })
        .catch(() => {
          setError("Stream unavailable or blocked by CORS.");
          setLoading(false);
          onError?.("Stream error");
        });
    }
  }, [station, cleanup, onError, volume]);

  useEffect(() => {
    if (station) loadStream();
    return cleanup;
  }, [station]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onErr = () => { setError("Stream error."); setLoading(false); };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("error", onErr);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("error", onErr);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play().catch(() => {});
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      setMuted(v === 0);
    }
  };

  if (!station) {
    return (
      <div className="w-full rounded-xl border border-[#1e2433] bg-[#0d0f14] p-6 flex items-center justify-center gap-3">
        <Radio className="w-8 h-8 text-[#475569]" />
        <p className="text-sm text-[#475569] font-body">Select a station to listen</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-[#1e2433] bg-[#0d0f14] overflow-hidden">
      <audio ref={audioRef} className="hidden" aria-label={`Radio: ${station.name}`} />

      {/* Visualizer / Station art */}
      <div className="relative h-24 bg-gradient-to-br from-[#08090c] to-[#0d0f14] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
        {playing && (
          <div className="flex items-end gap-0.5 h-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-[#8b5cf6] rounded-sm"
                animate={{
                  height: [
                    `${Math.random() * 60 + 10}%`,
                    `${Math.random() * 80 + 20}%`,
                    `${Math.random() * 40 + 5}%`,
                  ],
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        )}
        {!playing && (
          <Radio className="w-10 h-10 text-[#1e2433]" />
        )}
        {station.favicon && (
          <img
            src={station.favicon}
            alt=""
            className="absolute top-2 right-2 w-6 h-6 rounded opacity-40"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-3 border-t border-[#1e2433]">
        <div className="flex items-center gap-3">
          {/* Play */}
          <IconButton aria-label={playing ? "Pause" : "Play"} onClick={togglePlay} size="sm">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : playing ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </IconButton>

          {/* Station info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {station.countryCode && (
                <span className="text-sm">{getCountryFlag(station.countryCode)}</span>
              )}
              <p className="text-sm font-medium text-[#e2e8f0] font-heading truncate">
                {station.name}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {station.bitrate && (
                <Badge variant="ghost" size="xs">{station.bitrate}k</Badge>
              )}
              {station.codec && (
                <Badge variant="ghost" size="xs">{station.codec}</Badge>
              )}
              {playing && (
                <Badge variant="purple" size="xs" dot>ON AIR</Badge>
              )}
              {error && (
                <Badge variant="amber" size="xs" dot>Error</Badge>
              )}
            </div>
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <IconButton aria-label={muted ? "Unmute" : "Mute"} onClick={toggleMute} size="sm">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </IconButton>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="w-20 h-1 accent-[#8b5cf6] cursor-pointer"
              aria-label="Volume"
            />
          </div>

          {/* External */}
          <IconButton
            aria-label="Open stream in new tab"
            onClick={() => window.open(station.streamUrl, "_blank", "noopener")}
            size="sm"
          >
            <ExternalLink className="w-4 h-4" />
          </IconButton>
        </div>

        {error && (
          <div className="mt-2 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
            <p className="text-xs text-[#94a3b8] font-body flex-1">{error}</p>
            <Button size="xs" variant="secondary" onClick={loadStream}>
              <RefreshCw className="w-3 h-3" /> Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
