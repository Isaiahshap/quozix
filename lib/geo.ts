// Country centroids for approximate geo mapping (no paid geocoder required)
export const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number; name: string }> = {
  US: { lat: 37.09, lng: -95.71, name: "United States" },
  GB: { lat: 55.38, lng: -3.44, name: "United Kingdom" },
  DE: { lat: 51.17, lng: 10.45, name: "Germany" },
  FR: { lat: 46.23, lng: 2.21, name: "France" },
  RU: { lat: 61.52, lng: 105.32, name: "Russia" },
  CN: { lat: 35.86, lng: 104.19, name: "China" },
  IN: { lat: 20.59, lng: 78.96, name: "India" },
  BR: { lat: -14.24, lng: -51.93, name: "Brazil" },
  AU: { lat: -25.27, lng: 133.78, name: "Australia" },
  CA: { lat: 56.13, lng: -106.35, name: "Canada" },
  IR: { lat: 32.43, lng: 53.69, name: "Iran" },
  IQ: { lat: 33.22, lng: 43.68, name: "Iraq" },
  SY: { lat: 34.80, lng: 38.99, name: "Syria" },
  UA: { lat: 48.38, lng: 31.17, name: "Ukraine" },
  TR: { lat: 38.96, lng: 35.24, name: "Turkey" },
  IL: { lat: 31.05, lng: 34.85, name: "Israel" },
  SA: { lat: 23.89, lng: 45.08, name: "Saudi Arabia" },
  PK: { lat: 30.38, lng: 69.35, name: "Pakistan" },
  AF: { lat: 33.94, lng: 67.71, name: "Afghanistan" },
  KP: { lat: 40.34, lng: 127.51, name: "North Korea" },
  KR: { lat: 35.91, lng: 127.77, name: "South Korea" },
  JP: { lat: 36.2, lng: 138.25, name: "Japan" },
  NG: { lat: 9.08, lng: 8.68, name: "Nigeria" },
  EG: { lat: 26.82, lng: 30.8, name: "Egypt" },
  ZA: { lat: -30.56, lng: 22.94, name: "South Africa" },
  MX: { lat: 23.63, lng: -102.55, name: "Mexico" },
  AR: { lat: -38.42, lng: -63.62, name: "Argentina" },
  ID: { lat: -0.79, lng: 113.92, name: "Indonesia" },
  PH: { lat: 12.88, lng: 121.77, name: "Philippines" },
  VN: { lat: 14.06, lng: 108.28, name: "Vietnam" },
  TH: { lat: 15.87, lng: 100.99, name: "Thailand" },
  ES: { lat: 40.46, lng: -3.75, name: "Spain" },
  IT: { lat: 41.87, lng: 12.57, name: "Italy" },
  PL: { lat: 51.92, lng: 19.15, name: "Poland" },
  NL: { lat: 52.13, lng: 5.29, name: "Netherlands" },
  SE: { lat: 60.13, lng: 18.64, name: "Sweden" },
  NO: { lat: 60.47, lng: 8.47, name: "Norway" },
  CH: { lat: 46.82, lng: 8.23, name: "Switzerland" },
  BE: { lat: 50.5, lng: 4.47, name: "Belgium" },
  PT: { lat: 39.4, lng: -8.22, name: "Portugal" },
  GR: { lat: 39.07, lng: 21.82, name: "Greece" },
  RO: { lat: 45.94, lng: 24.97, name: "Romania" },
  CZ: { lat: 49.82, lng: 15.47, name: "Czech Republic" },
  HU: { lat: 47.16, lng: 19.5, name: "Hungary" },
  AT: { lat: 47.52, lng: 14.55, name: "Austria" },
  LB: { lat: 33.85, lng: 35.86, name: "Lebanon" },
  YE: { lat: 15.55, lng: 48.52, name: "Yemen" },
};

// City coordinates for common OSINT mentions
export const CITY_COORDS: Record<string, { lat: number; lng: number; country: string }> = {
  tehran: { lat: 35.69, lng: 51.39, country: "IR" },
  moscow: { lat: 55.75, lng: 37.62, country: "RU" },
  beijing: { lat: 39.91, lng: 116.39, country: "CN" },
  washington: { lat: 38.9, lng: -77.04, country: "US" },
  "new york": { lat: 40.71, lng: -74.01, country: "US" },
  london: { lat: 51.51, lng: -0.13, country: "GB" },
  paris: { lat: 48.86, lng: 2.35, country: "FR" },
  berlin: { lat: 52.52, lng: 13.4, country: "DE" },
  kyiv: { lat: 50.45, lng: 30.52, country: "UA" },
  baghdad: { lat: 33.34, lng: 44.4, country: "IQ" },
  damascus: { lat: 33.51, lng: 36.29, country: "SY" },
  "tel aviv": { lat: 32.09, lng: 34.79, country: "IL" },
  jerusalem: { lat: 31.77, lng: 35.22, country: "IL" },
  istanbul: { lat: 41.01, lng: 28.96, country: "TR" },
  ankara: { lat: 39.93, lng: 32.86, country: "TR" },
  riyadh: { lat: 24.69, lng: 46.72, country: "SA" },
  islamabad: { lat: 33.72, lng: 73.04, country: "PK" },
  kabul: { lat: 34.53, lng: 69.17, country: "AF" },
  pyongyang: { lat: 39.02, lng: 125.75, country: "KP" },
  tokyo: { lat: 35.69, lng: 139.69, country: "JP" },
  seoul: { lat: 37.57, lng: 126.98, country: "KR" },
  cairo: { lat: 30.06, lng: 31.25, country: "EG" },
  sanaa: { lat: 15.35, lng: 44.21, country: "YE" },
  beirut: { lat: 33.89, lng: 35.5, country: "LB" },
};

export function inferGeoFromText(
  text: string
): { lat: number; lng: number; label: string } | null {
  const lower = text.toLowerCase();

  // Check city names first (more precise)
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) {
      const countryInfo = COUNTRY_CENTROIDS[coords.country];
      return {
        lat: coords.lat,
        lng: coords.lng,
        label: `${city.charAt(0).toUpperCase() + city.slice(1)}, ${countryInfo?.name || coords.country}`,
      };
    }
  }

  // Check country names
  for (const [code, info] of Object.entries(COUNTRY_CENTROIDS)) {
    if (lower.includes(info.name.toLowerCase())) {
      return { lat: info.lat, lng: info.lng, label: info.name };
    }
  }

  // Check country codes in text (e.g., "US", "IR")
  const codeMatch = text.match(/\b([A-Z]{2})\b/);
  if (codeMatch) {
    const info = COUNTRY_CENTROIDS[codeMatch[1]];
    if (info) return { lat: info.lat, lng: info.lng, label: info.name };
  }

  return null;
}

export function getCountryCentroid(code: string): { lat: number; lng: number } | null {
  const info = COUNTRY_CENTROIDS[code.toUpperCase()];
  return info ? { lat: info.lat, lng: info.lng } : null;
}
