// Country centroids for approximate geo mapping (no paid geocoder required)
export const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number; name: string }> = {
  // North America
  US: { lat: 37.09,   lng: -95.71,  name: "United States" },
  CA: { lat: 56.13,   lng: -106.35, name: "Canada" },
  MX: { lat: 23.63,   lng: -102.55, name: "Mexico" },
  GT: { lat: 15.78,   lng: -90.23,  name: "Guatemala" },
  BZ: { lat: 17.19,   lng: -88.50,  name: "Belize" },
  HN: { lat: 15.20,   lng: -86.24,  name: "Honduras" },
  SV: { lat: 13.79,   lng: -88.90,  name: "El Salvador" },
  NI: { lat: 12.87,   lng: -85.21,  name: "Nicaragua" },
  CR: { lat: 9.75,    lng: -83.75,  name: "Costa Rica" },
  PA: { lat: 8.54,    lng: -80.78,  name: "Panama" },
  CU: { lat: 21.52,   lng: -77.78,  name: "Cuba" },
  JM: { lat: 18.11,   lng: -77.30,  name: "Jamaica" },
  HT: { lat: 18.97,   lng: -72.29,  name: "Haiti" },
  DO: { lat: 18.74,   lng: -70.16,  name: "Dominican Republic" },
  PR: { lat: 18.22,   lng: -66.59,  name: "Puerto Rico" },
  TT: { lat: 10.69,   lng: -61.22,  name: "Trinidad and Tobago" },
  BB: { lat: 13.19,   lng: -59.54,  name: "Barbados" },

  // South America
  CO: { lat: 4.57,    lng: -74.30,  name: "Colombia" },
  VE: { lat: 6.42,    lng: -66.59,  name: "Venezuela" },
  GY: { lat: 4.86,    lng: -58.93,  name: "Guyana" },
  SR: { lat: 3.92,    lng: -56.03,  name: "Suriname" },
  BR: { lat: -14.24,  lng: -51.93,  name: "Brazil" },
  EC: { lat: -1.83,   lng: -78.18,  name: "Ecuador" },
  PE: { lat: -9.19,   lng: -75.02,  name: "Peru" },
  BO: { lat: -16.29,  lng: -63.59,  name: "Bolivia" },
  PY: { lat: -23.44,  lng: -58.44,  name: "Paraguay" },
  UY: { lat: -32.52,  lng: -55.77,  name: "Uruguay" },
  AR: { lat: -38.42,  lng: -63.62,  name: "Argentina" },
  CL: { lat: -35.68,  lng: -71.54,  name: "Chile" },

  // Europe — Western
  GB: { lat: 55.38,   lng: -3.44,   name: "United Kingdom" },
  IE: { lat: 53.41,   lng: -8.24,   name: "Ireland" },
  FR: { lat: 46.23,   lng: 2.21,    name: "France" },
  ES: { lat: 40.46,   lng: -3.75,   name: "Spain" },
  PT: { lat: 39.40,   lng: -8.22,   name: "Portugal" },
  DE: { lat: 51.17,   lng: 10.45,   name: "Germany" },
  NL: { lat: 52.13,   lng: 5.29,    name: "Netherlands" },
  BE: { lat: 50.50,   lng: 4.47,    name: "Belgium" },
  LU: { lat: 49.82,   lng: 6.13,    name: "Luxembourg" },
  CH: { lat: 46.82,   lng: 8.23,    name: "Switzerland" },
  AT: { lat: 47.52,   lng: 14.55,   name: "Austria" },
  IT: { lat: 41.87,   lng: 12.57,   name: "Italy" },
  GR: { lat: 39.07,   lng: 21.82,   name: "Greece" },
  MT: { lat: 35.94,   lng: 14.38,   name: "Malta" },
  CY: { lat: 35.13,   lng: 33.43,   name: "Cyprus" },

  // Europe — Nordic
  SE: { lat: 60.13,   lng: 18.64,   name: "Sweden" },
  NO: { lat: 60.47,   lng: 8.47,    name: "Norway" },
  DK: { lat: 56.26,   lng: 9.50,    name: "Denmark" },
  FI: { lat: 61.92,   lng: 25.75,   name: "Finland" },
  IS: { lat: 64.96,   lng: -19.02,  name: "Iceland" },

  // Europe — Eastern
  PL: { lat: 51.92,   lng: 19.15,   name: "Poland" },
  CZ: { lat: 49.82,   lng: 15.47,   name: "Czech Republic" },
  SK: { lat: 48.67,   lng: 19.70,   name: "Slovakia" },
  HU: { lat: 47.16,   lng: 19.50,   name: "Hungary" },
  RO: { lat: 45.94,   lng: 24.97,   name: "Romania" },
  BG: { lat: 42.73,   lng: 25.49,   name: "Bulgaria" },
  HR: { lat: 45.10,   lng: 15.20,   name: "Croatia" },
  SI: { lat: 46.15,   lng: 14.99,   name: "Slovenia" },
  BA: { lat: 43.92,   lng: 17.67,   name: "Bosnia and Herzegovina" },
  RS: { lat: 44.02,   lng: 21.01,   name: "Serbia" },
  ME: { lat: 42.71,   lng: 19.37,   name: "Montenegro" },
  MK: { lat: 41.61,   lng: 21.75,   name: "North Macedonia" },
  AL: { lat: 41.15,   lng: 20.17,   name: "Albania" },
  XK: { lat: 42.60,   lng: 20.90,   name: "Kosovo" },
  UA: { lat: 48.38,   lng: 31.17,   name: "Ukraine" },
  BY: { lat: 53.71,   lng: 27.95,   name: "Belarus" },
  MD: { lat: 47.41,   lng: 28.37,   name: "Moldova" },
  RU: { lat: 61.52,   lng: 105.32,  name: "Russia" },

  // Europe — Baltic
  EE: { lat: 58.60,   lng: 25.01,   name: "Estonia" },
  LV: { lat: 56.88,   lng: 24.60,   name: "Latvia" },
  LT: { lat: 55.17,   lng: 23.88,   name: "Lithuania" },

  // Caucasus
  GE: { lat: 42.32,   lng: 43.36,   name: "Georgia" },
  AM: { lat: 40.07,   lng: 45.04,   name: "Armenia" },
  AZ: { lat: 40.14,   lng: 47.58,   name: "Azerbaijan" },

  // Middle East
  TR: { lat: 38.96,   lng: 35.24,   name: "Turkey" },
  SY: { lat: 34.80,   lng: 38.99,   name: "Syria" },
  LB: { lat: 33.85,   lng: 35.86,   name: "Lebanon" },
  IL: { lat: 31.05,   lng: 34.85,   name: "Israel" },
  PS: { lat: 31.95,   lng: 35.23,   name: "Palestine" },
  JO: { lat: 30.59,   lng: 36.24,   name: "Jordan" },
  IQ: { lat: 33.22,   lng: 43.68,   name: "Iraq" },
  IR: { lat: 32.43,   lng: 53.69,   name: "Iran" },
  KW: { lat: 29.31,   lng: 47.48,   name: "Kuwait" },
  SA: { lat: 23.89,   lng: 45.08,   name: "Saudi Arabia" },
  YE: { lat: 15.55,   lng: 48.52,   name: "Yemen" },
  OM: { lat: 21.51,   lng: 55.92,   name: "Oman" },
  AE: { lat: 23.42,   lng: 53.85,   name: "UAE" },
  QA: { lat: 25.35,   lng: 51.18,   name: "Qatar" },
  BH: { lat: 26.02,   lng: 50.55,   name: "Bahrain" },

  // Central Asia
  KZ: { lat: 48.02,   lng: 66.92,   name: "Kazakhstan" },
  UZ: { lat: 41.38,   lng: 64.59,   name: "Uzbekistan" },
  TM: { lat: 38.97,   lng: 59.56,   name: "Turkmenistan" },
  TJ: { lat: 38.86,   lng: 71.28,   name: "Tajikistan" },
  KG: { lat: 41.20,   lng: 74.77,   name: "Kyrgyzstan" },
  AF: { lat: 33.94,   lng: 67.71,   name: "Afghanistan" },

  // South Asia
  PK: { lat: 30.38,   lng: 69.35,   name: "Pakistan" },
  IN: { lat: 20.59,   lng: 78.96,   name: "India" },
  BD: { lat: 23.68,   lng: 90.36,   name: "Bangladesh" },
  NP: { lat: 28.39,   lng: 84.12,   name: "Nepal" },
  BT: { lat: 27.51,   lng: 90.43,   name: "Bhutan" },
  LK: { lat: 7.87,    lng: 80.77,   name: "Sri Lanka" },
  MV: { lat: 3.20,    lng: 73.22,   name: "Maldives" },

  // Southeast Asia
  MM: { lat: 17.11,   lng: 96.96,   name: "Myanmar" },
  TH: { lat: 15.87,   lng: 100.99,  name: "Thailand" },
  VN: { lat: 14.06,   lng: 108.28,  name: "Vietnam" },
  LA: { lat: 19.86,   lng: 102.50,  name: "Laos" },
  KH: { lat: 12.57,   lng: 104.99,  name: "Cambodia" },
  MY: { lat: 4.21,    lng: 108.00,  name: "Malaysia" },
  SG: { lat: 1.35,    lng: 103.82,  name: "Singapore" },
  ID: { lat: -0.79,   lng: 113.92,  name: "Indonesia" },
  PH: { lat: 12.88,   lng: 121.77,  name: "Philippines" },
  TL: { lat: -8.87,   lng: 125.73,  name: "Timor-Leste" },
  BN: { lat: 4.54,    lng: 114.73,  name: "Brunei" },

  // East Asia
  CN: { lat: 35.86,   lng: 104.19,  name: "China" },
  TW: { lat: 23.70,   lng: 120.96,  name: "Taiwan" },
  HK: { lat: 22.33,   lng: 114.17,  name: "Hong Kong" },
  MO: { lat: 22.16,   lng: 113.55,  name: "Macau" },
  JP: { lat: 36.20,   lng: 138.25,  name: "Japan" },
  KR: { lat: 35.91,   lng: 127.77,  name: "South Korea" },
  KP: { lat: 40.34,   lng: 127.51,  name: "North Korea" },
  MN: { lat: 46.86,   lng: 103.85,  name: "Mongolia" },

  // Oceania
  AU: { lat: -25.27,  lng: 133.78,  name: "Australia" },
  NZ: { lat: -40.90,  lng: 174.89,  name: "New Zealand" },
  PG: { lat: -6.31,   lng: 143.96,  name: "Papua New Guinea" },
  FJ: { lat: -17.71,  lng: 178.07,  name: "Fiji" },
  WS: { lat: -13.76,  lng: -172.10, name: "Samoa" },
  TO: { lat: -21.18,  lng: -175.20, name: "Tonga" },
  VU: { lat: -15.38,  lng: 166.96,  name: "Vanuatu" },
  SB: { lat: -9.65,   lng: 160.16,  name: "Solomon Islands" },

  // North Africa
  MA: { lat: 31.79,   lng: -7.09,   name: "Morocco" },
  DZ: { lat: 28.03,   lng: 1.66,    name: "Algeria" },
  TN: { lat: 33.89,   lng: 9.54,    name: "Tunisia" },
  LY: { lat: 26.34,   lng: 17.23,   name: "Libya" },
  EG: { lat: 26.82,   lng: 30.80,   name: "Egypt" },
  SD: { lat: 12.86,   lng: 30.22,   name: "Sudan" },
  SS: { lat: 6.88,    lng: 31.31,   name: "South Sudan" },

  // West Africa
  MR: { lat: 21.01,   lng: -10.94,  name: "Mauritania" },
  ML: { lat: 17.57,   lng: -3.99,   name: "Mali" },
  SN: { lat: 14.50,   lng: -14.45,  name: "Senegal" },
  GM: { lat: 13.44,   lng: -15.31,  name: "Gambia" },
  GW: { lat: 11.80,   lng: -15.18,  name: "Guinea-Bissau" },
  GN: { lat: 11.75,   lng: -15.90,  name: "Guinea" },
  SL: { lat: 8.46,    lng: -11.78,  name: "Sierra Leone" },
  LR: { lat: 6.43,    lng: -9.43,   name: "Liberia" },
  CI: { lat: 7.54,    lng: -5.55,   name: "Ivory Coast" },
  GH: { lat: 7.95,    lng: -1.02,   name: "Ghana" },
  BF: { lat: 12.36,   lng: -1.56,   name: "Burkina Faso" },
  NE: { lat: 17.61,   lng: 8.08,    name: "Niger" },
  NG: { lat: 9.08,    lng: 8.68,    name: "Nigeria" },
  TG: { lat: 8.62,    lng: 0.82,    name: "Togo" },
  BJ: { lat: 9.31,    lng: 2.32,    name: "Benin" },

  // Central Africa
  CM: { lat: 3.85,    lng: 11.50,   name: "Cameroon" },
  TD: { lat: 15.45,   lng: 18.73,   name: "Chad" },
  CF: { lat: 6.61,    lng: 20.94,   name: "Central African Republic" },
  GQ: { lat: 1.65,    lng: 10.27,   name: "Equatorial Guinea" },
  GA: { lat: -0.80,   lng: 11.61,   name: "Gabon" },
  CG: { lat: -0.23,   lng: 15.83,   name: "Republic of Congo" },
  CD: { lat: -4.04,   lng: 21.76,   name: "DR Congo" },

  // East Africa
  ET: { lat: 9.15,    lng: 40.49,   name: "Ethiopia" },
  ER: { lat: 15.18,   lng: 39.78,   name: "Eritrea" },
  DJ: { lat: 11.83,   lng: 42.59,   name: "Djibouti" },
  SO: { lat: 5.15,    lng: 46.20,   name: "Somalia" },
  KE: { lat: -0.02,   lng: 37.91,   name: "Kenya" },
  UG: { lat: 1.37,    lng: 32.29,   name: "Uganda" },
  RW: { lat: -1.94,   lng: 29.87,   name: "Rwanda" },
  BI: { lat: -3.38,   lng: 29.92,   name: "Burundi" },
  TZ: { lat: -6.37,   lng: 34.89,   name: "Tanzania" },

  // Southern Africa
  AO: { lat: -11.20,  lng: 17.87,   name: "Angola" },
  ZM: { lat: -13.13,  lng: 27.85,   name: "Zambia" },
  MW: { lat: -13.25,  lng: 34.30,   name: "Malawi" },
  MZ: { lat: -18.67,  lng: 35.53,   name: "Mozambique" },
  ZW: { lat: -19.02,  lng: 29.15,   name: "Zimbabwe" },
  BW: { lat: -22.33,  lng: 24.68,   name: "Botswana" },
  NA: { lat: -22.96,  lng: 18.49,   name: "Namibia" },
  ZA: { lat: -30.56,  lng: 22.94,   name: "South Africa" },
  LS: { lat: -29.61,  lng: 28.23,   name: "Lesotho" },
  SZ: { lat: -26.52,  lng: 31.47,   name: "Eswatini" },

  // Common aliases (non-standard codes used by some data sources)
  UK: { lat: 55.38,   lng: -3.44,   name: "United Kingdom" }, // alias for GB

  // Indian Ocean Islands
  MG: { lat: -18.77,  lng: 46.87,   name: "Madagascar" },
  MU: { lat: -20.35,  lng: 57.55,   name: "Mauritius" },
  SC: { lat: -4.68,   lng: 55.49,   name: "Seychelles" },
  KM: { lat: -11.64,  lng: 43.33,   name: "Comoros" },
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

  for (const [, info] of Object.entries(COUNTRY_CENTROIDS)) {
    if (lower.includes(info.name.toLowerCase())) {
      return { lat: info.lat, lng: info.lng, label: info.name };
    }
  }

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
