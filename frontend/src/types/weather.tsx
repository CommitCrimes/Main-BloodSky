
export interface Weather {
  description: string;
  windSpeed: number;
  temperature: number;
  icon?: string;
}

export interface WeatherItem {
  icon: string;
}
export interface Wind {
  speed: number; // m/s
}
export interface ForecastEntry {
  dt_txt: string;          // "YYYY-MM-DD HH:mm:ss"
  weather?: WeatherItem[]; // optionnel
  wind?: Wind;             // optionnel
}
