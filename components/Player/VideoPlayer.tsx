"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreamChannel } from "@/lib/types";
import { getCountryFlag } from "@/lib/utils";
import { Badge } from "@/components/UI/Badge";
import { IconButton, Button } from "@/components/UI/Button";

interface VideoPlayerProps {
  channel: StreamChannel | null;
  onError?: (msg: string) => void;
}

export function VideoPlayer({ channel, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import("hls.js").default | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [hlsReady, setHlsReady] = useState(false);

  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setPlaying(false);
    setLoading(false);
    setError(null);
  }, []);

  const loadStream = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !channel) return;

    cleanup();
    setLoading(true);
    setError(null);

    const url = channel.streamUrl;

    // Check if HLS
    const isHLS = url.includes(".m3u8") || url.includes("hls");
    const nativeHLS = video.canPlayType("application/vnd.apple.mpegurl");

    if (isHLS && !nativeHLS) {
      try {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: false,
            lowLatencyMode: false,
            xhrSetup: (xhr: XMLHttpRequest) => {
              xhr.timeout = 15000;
            },
          });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false);
            video.play().then(() => setPlaying(true)).catch(() => {
              setPlaying(false);
            });
          });
          hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal?: boolean; type?: string }) => {
            if (data.fatal) {
              setError("Stream unavailable. Try another channel.");
              setLoading(false);
              onError?.("Stream error");
            }
          });
        } else {
          setError("HLS not supported in this browser.");
          setLoading(false);
        }
      } catch {
        setError("Failed to load stream player.");
        setLoading(false);
      }
    } else {
      video.src = url;
      video.load();
      video
        .play()
        .then(() => {
          setLoading(false);
          setPlaying(true);
        })
        .catch(() => {
          setError("Stream unavailable or blocked by CORS.");
          setLoading(false);
          onError?.("Stream error");
        });
    }
  }, [channel, cleanup, onError]);

  useEffect(() => {
    if (channel) loadStream();
    return cleanup;
  }, [channel, loadStream, cleanup]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onError = () => {
      setError("Stream error. The channel may be offline.");
      setLoading(false);
    };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      setMuted(v === 0);
    }
  };

  const openInNewTab = () => {
    if (channel) window.open(channel.streamUrl, "_blank", "noopener");
  };

  const fullscreen = () => {
    videoRef.current?.requestFullscreen();
  };

  if (!channel) {
    return (
      <div className="w-full aspect-video bg-[#08090c] rounded-xl border border-[#1e2433] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#1e2433] flex items-center justify-center mx-auto">
            <Play className="w-5 h-5 text-[#475569]" />
          </div>
          <p className="text-sm text-[#475569] font-body">Select a channel to watch</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#1e2433] bg-[#08090c]">
      {/* Video */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          muted={muted}
          aria-label={`Live stream: ${channel.name}`}
        />

        {/* Loading overlay */}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 p-4">
            <AlertTriangle className="w-8 h-8 text-[#f59e0b]" />
            <p className="text-sm text-[#94a3b8] text-center font-body max-w-xs">{error}</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={loadStream}>
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </Button>
              <Button size="sm" variant="glow" onClick={openInNewTab}>
                <ExternalLink className="w-3.5 h-3.5" /> Open direct
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-3 bg-[#0d0f14] border-t border-[#1e2433]">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <IconButton aria-label={playing ? "Pause" : "Play"} onClick={togglePlay} size="sm">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : playing ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </IconButton>

          {/* Channel info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {channel.countryCode && (
                <span className="text-sm">{getCountryFlag(channel.countryCode)}</span>
              )}
              <p className="text-sm font-medium text-[#e2e8f0] font-heading truncate">
                {channel.name}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {channel.categories[0] && (
                <Badge variant="ghost" size="xs">{channel.categories[0]}</Badge>
              )}
              {playing && (
                <Badge variant="red" size="xs" dot>LIVE</Badge>
              )}
            </div>
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <IconButton aria-label={muted ? "Unmute" : "Mute"} onClick={toggleMute} size="sm">
              {muted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </IconButton>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 accent-[#00d4ff] cursor-pointer"
              aria-label="Volume"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <IconButton aria-label="Fullscreen" onClick={fullscreen} size="sm">
              <Maximize2 className="w-4 h-4" />
            </IconButton>
            <IconButton aria-label="Open stream in new tab" onClick={openInNewTab} size="sm">
              <ExternalLink className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
