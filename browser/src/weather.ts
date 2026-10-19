import { storage } from "./ext";
import type { MessageKey } from "./locales/en";

export type Sky = "clear" | "partly" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "storm";

/** WMO weather interpretation codes as used by Open-Meteo. */
export function skyOf(code: number): Sky {
  if (code === 0) return "clear";
  if (code <= 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

export const skyLabel = (s: Sky): MessageKey => `wc_${s}` as MessageKey;

export interface Forecast {
  temp: number;
  wind: number;
  sky: Sky;
  min: number;
  max: number;
  days: { date: string; min: number; max: number; sky: Sky }[];
}

export interface Place { name: string; country: string; lat: number; lon: number }

export async function findCity(name: string, lang: string): Promise<Place[]> {
  const u = new URL("https://geocoding-api.open-meteo.com/v1/search");
  u.searchParams.set("name", name);
  u.searchParams.set("count", "5");
  u.searchParams.set("language", lang);
  const res = await fetch(u);
  if (!res.ok) throw new Error(`geocoding ${res.status}`);
  const json = await res.json();
  return (json.results ?? []).map((r: { name: string; country?: string; admin1?: string; latitude: number; longitude: number }) => ({
    name: r.name,
    country: [r.admin1, r.country].filter(Boolean).join(", "),
    lat: r.latitude,
    lon: r.longitude,
  }));
}

const CACHE_KEY = "weatherCache";
const TTL = 30 * 60 * 1000;

export function parseForecast(json: any): Forecast { // eslint-disable-line @typescript-eslint/no-explicit-any
  const d = json.daily;
  return {
    temp: Math.round(json.current.temperature_2m),
    wind: Math.round(json.current.wind_speed_10m),
    sky: skyOf(json.current.weather_code),
    min: Math.round(d.temperature_2m_min[0]),
    max: Math.round(d.temperature_2m_max[0]),
    days: d.time.slice(1).map((date: string, i: number) => ({
      date,
      min: Math.round(d.temperature_2m_min[i + 1]),
      max: Math.round(d.temperature_2m_max[i + 1]),
      sky: skyOf(d.weather_code[i + 1]),
    })),
  };
}

export async function forecast(lat: number, lon: number, units: "c" | "f"): Promise<Forecast> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)},${units}`;
  const cached = (await storage.get(CACHE_KEY)) as { key: string; at: number; data: Forecast } | undefined;
  if (cached && cached.key === key && Date.now() - cached.at < TTL) return cached.data;

  const u = new URL("https://api.open-meteo.com/v1/forecast");
  u.searchParams.set("latitude", String(lat));
  u.searchParams.set("longitude", String(lon));
  u.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
  u.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
  u.searchParams.set("wind_speed_unit", "ms");
  u.searchParams.set("timezone", "auto");
  u.searchParams.set("forecast_days", "6");
  if (units === "f") u.searchParams.set("temperature_unit", "fahrenheit");
  const res = await fetch(u);
  if (!res.ok) throw new Error(`forecast ${res.status}`);
  const data = parseForecast(await res.json());
  await storage.set(CACHE_KEY, { key, at: Date.now(), data });
  return data;
}
