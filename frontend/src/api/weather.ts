import { format } from 'date-fns';

// src/api/weather.ts
export const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function getCurrentWeather(lat: number, lon: number, lang = 'fr') {
  const response = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
  );
  if (!response.ok) throw new Error('Erreur lors du cnhargement de la météo actuelle');
  return response.json();
}

export async function getForecast(lat: number, lon: number, lang = 'fr') {
  const response = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
  );
  if (!response.ok) throw new Error('Erreur lors du chargement des prévisions');
  const data = await response.json();
  // extraire un point météo par jour (toutes les 24h environ => 8 * 3h)
  return data.list.filter((_: unknown, i: number) => i % 8 === 0).slice(0, 7);
}

interface ForecastEntry {
  dt_txt: string;
  // add other properties as needed, e.g. main, weather, etc.
}

export async function getForecastByDate(lat: number, lon: number, targetDate: Date, lang = 'fr') {
  const response = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
  );
  if (!response.ok) throw new Error('Erreur lors du chargement des prévisions');

  const data = await response.json();

  const targetDay = format(targetDate, 'yyyy-MM-dd');

  // Filtre les entrées dont la date correspond à la date cible (au format "yyyy-MM-dd")
  const dayForecasts = data.list.filter((entry: ForecastEntry) =>
    entry.dt_txt && entry.dt_txt.startsWith(targetDay)
  );

  return dayForecasts;
}
