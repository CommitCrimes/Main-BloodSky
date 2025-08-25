import { format } from 'date-fns';

// src/api/weather.ts
export const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const getDemoCurrentWeather = (lat: number, lon: number) => {
  const variations = [
    { temp: 15, wind: 8, desc: "partiellement nuageux", main: "Clouds", icon: "02d" },
    { temp: 18, wind: 12, desc: "couvert", main: "Clouds", icon: "04d" },
    { temp: 12, wind: 6, desc: "ensoleillé", main: "Clear", icon: "01d" },
    { temp: 16, wind: 15, desc: "pluvieux", main: "Rain", icon: "10d" },
    { temp: 14, wind: 10, desc: "brumeux", main: "Mist", icon: "50d" },
  ];
  
  const baseVariation = variations[Math.floor(lat * lon) % variations.length];
  const tempOffset = Math.sin(lat + lon) * 3;
  const windOffset = Math.cos(lat + lon) * 4;
  
  return {
    main: {
      temp: Math.round(baseVariation.temp + tempOffset),
      feels_like: Math.round(baseVariation.temp + tempOffset - 2),
      humidity: Math.round(65 + Math.sin(lat) * 20),
      pressure: Math.round(1013 + Math.cos(lon) * 15),
    },
    wind: {
      speed: Math.max(0, Math.round(baseVariation.wind + windOffset)),
      deg: Math.round(Math.abs(lat + lon) * 180) % 360,
    },
    weather: [{
      description: baseVariation.desc,
      main: baseVariation.main,
      icon: baseVariation.icon,
    }],
    visibility: Math.round(8000 + Math.sin(lat) * 2000),
    clouds: { all: Math.round(Math.abs(Math.sin(lat + lon)) * 100) },
    name: lat === 47.2184 ? "Nantes" : "Région Nantaise",
  };
};

export async function getCurrentWeather(lat: number, lon: number, lang = 'fr') {
  if (!OPENWEATHER_API_KEY) {
    console.warn('Clé API manquante - Utilisation du mode démo');
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    return getDemoCurrentWeather(lat, lon);
  }

  const response = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
  );
  if (!response.ok) throw new Error('Erreur lors du chargement de la météo actuelle');
  return response.json();
}

const getDemoForecast = (lat: number, lon: number) => {
  const forecasts = [];
  const now = new Date();
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(now.getDate() + day);
    
    const baseTemp = 15 + Math.sin(day + lat) * 5;
    const baseWind = 8 + Math.cos(day + lon) * 6;
    const weatherTypes = ["Clear", "Clouds", "Rain", "Mist"];
    const weatherType = weatherTypes[day % weatherTypes.length];
    
    forecasts.push({
      dt: Math.floor(date.getTime() / 1000),
      dt_txt: date.toISOString().slice(0, 19).replace('T', ' '),
      main: {
        temp: Math.round(baseTemp),
        temp_min: Math.round(baseTemp - 3),
        temp_max: Math.round(baseTemp + 4),
        humidity: Math.round(60 + Math.sin(day) * 20),
      },
      wind: {
        speed: Math.max(0, Math.round(baseWind)),
        deg: Math.round((day * 45 + lat) % 360),
      },
      weather: [{
        main: weatherType,
        description: weatherType === "Clear" ? "ensoleillé" : 
                    weatherType === "Clouds" ? "nuageux" : 
                    weatherType === "Rain" ? "pluvieux" : "brumeux",
        icon: weatherType === "Clear" ? "01d" : 
              weatherType === "Clouds" ? "03d" : 
              weatherType === "Rain" ? "10d" : "50d",
      }],
      visibility: Math.round(7000 + Math.sin(day) * 3000),
      pop: weatherType === "Rain" ? 0.7 : 0.1,
    });
  }
  
  return forecasts;
};

export async function getForecast(lat: number, lon: number, lang = 'fr') {
  if (!OPENWEATHER_API_KEY) {
    console.warn('Clé API manquante - Utilisation du mode démo');
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    return getDemoForecast(lat, lon);
  }

  const response = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
  );
  if (!response.ok) throw new Error('Erreur lors du chargement des prévisions');
  const data = await response.json();
  return data.list.filter((_: unknown, i: number) => i % 8 === 0).slice(0, 7);
}

interface ForecastEntry {
  dt_txt: string;
  // add other properties as needed, e.g. main, weather, etc.
}

const getDemoForecastByDate = (lat: number, lon: number, targetDate: Date) => {
  const forecasts = [];
  const targetDay = format(targetDate, 'yyyy-MM-dd');
  
  for (let hour = 0; hour < 24; hour += 3) {
    const datetime = new Date(targetDate);
    datetime.setHours(hour, 0, 0, 0);
    
    const hourFactor = Math.sin(hour / 24 * Math.PI * 2) * 0.5 + 0.5;
    const baseTemp = 15 + Math.sin(lat + lon + hour) * 6 + hourFactor * 4;
    const baseWind = 5 + Math.cos(lat + lon + hour) * 8 + (1 - hourFactor) * 3;
    
    const weatherTypes = ["Clear", "Clouds", "Rain", "Mist"];
    const weatherIndex = Math.floor(Math.abs(Math.sin(lat + lon + hour)) * weatherTypes.length);
    const weatherType = weatherTypes[weatherIndex];
    
    forecasts.push({
      dt: Math.floor(datetime.getTime() / 1000),
      dt_txt: `${targetDay} ${hour.toString().padStart(2, '0')}:00:00`,
      main: {
        temp: Math.round(baseTemp),
        temp_min: Math.round(baseTemp - 2),
        temp_max: Math.round(baseTemp + 2),
        humidity: Math.round(55 + Math.sin(hour + lat) * 25),
      },
      wind: {
        speed: Math.max(0, Math.round(baseWind)),
        deg: Math.round((hour * 15 + lat + lon) % 360),
      },
      weather: [{
        main: weatherType,
        description: weatherType === "Clear" ? "ensoleillé" : 
                    weatherType === "Clouds" ? "nuageux" : 
                    weatherType === "Rain" ? "pluvieux" : "brumeux",
        icon: weatherType === "Clear" ? (hour >= 6 && hour <= 18 ? "01d" : "01n") : 
              weatherType === "Clouds" ? (hour >= 6 && hour <= 18 ? "03d" : "03n") : 
              weatherType === "Rain" ? "10d" : "50d",
      }],
      visibility: Math.round(6000 + Math.sin(hour + lat) * 4000),
      pop: weatherType === "Rain" ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3,
    });
  }
  
  return forecasts;
};

export async function getForecastByDate(lat: number, lon: number, targetDate: Date, lang = 'fr') {
  if (!OPENWEATHER_API_KEY) {
    console.warn('Clé API manquante - Utilisation du mode démo');
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 800));
    return getDemoForecastByDate(lat, lon, targetDate);
  }

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
