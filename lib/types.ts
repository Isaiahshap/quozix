export interface StreamChannel {
  id: string;
  name: string;
  countryCode: string;
  languages: string[];
  categories: string[];
  logoUrl?: string;
  streamUrl: string;
  groupTitle?: string;
}

export interface RadioStation {
  id: string;
  name: string;
  country: string;
  countryCode?: string;
  language?: string;
  tags: string[];
  streamUrl: string;
  favicon?: string;
  bitrate?: number;
  codec?: string;
  votes?: number;
  clickCount?: number;
}

export interface Signal {
  id: string;
  title: string;
  url: string;
  source: string;
  domain: string;
  publishedAt: string;
  geo?: { lat: number; lng: number; label: string };
  keywords: string[];
  imageUrl?: string;
  sourceCount?: number;
}

export interface GlobePoint {
  lat: number;
  lng: number;
  type: "signal" | "air" | "stream" | "radio";
  payloadId: string;
  label?: string;
  intensity?: number;
}

export interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  label?: string;
  color?: string;
}

export interface AircraftPosition {
  icao24: string;
  callsign?: string;
  originCountry: string;
  longitude: number;
  latitude: number;
  altitude?: number;
  velocity?: number;
  heading?: number;
  onGround: boolean;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  status: "ok" | "degraded" | "error" | "loading";
  lastChecked?: number;
  message?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export type LayerType = "signals" | "air" | "streams" | "radio";

export interface AppSettings {
  lowPowerMode: boolean;
  activeLayers: LayerType[];
  autoRotateGlobe: boolean;
  timeWindow: "1h" | "6h" | "24h" | "7d";
}
