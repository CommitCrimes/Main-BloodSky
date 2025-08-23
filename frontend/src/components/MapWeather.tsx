import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
//import ReactDOMServer from 'react-dom/server';

import 'weather-icons/css/weather-icons.css';

/*import {
  WiDaySunny, WiNightClear, WiDayCloudy, WiNightAltCloudy,
  WiCloud, WiDayRain, WiNightAltRain, WiDayThunderstorm, WiNightAltThunderstorm,
  WiDaySnow, WiNightAltSnow, WiFog
} from "react-icons/wi";*/

const weatherIcons: Record<string, string> = {
  "01d": "wi-day-sunny",
  "01n": "wi-night-clear",
  "02d": "wi-day-cloudy",
  "02n": "wi-night-alt-cloudy",
  "03d": "wi-cloud",
  "03n": "wi-cloud",
  "04d": "wi-cloudy",
  "04n": "wi-cloudy",
  "09d": "wi-showers",
  "09n": "wi-showers",
  "10d": "wi-day-rain",
  "10n": "wi-night-alt-rain",
  "11d": "wi-thunderstorm",
  "11n": "wi-thunderstorm",
  "13d": "wi-snow",
  "13n": "wi-snow",
  "50d": "wi-fog",
  "50n": "wi-fog"
};




const API_KEY = '063abe19913c9d0022b08f3b3d3c86aa';
//const MAPTILER_API_KEY = '6J5IE8oWNPhHMODFenBI';

const regionCoordinates: Record<string, [number, number]> = {
  'Ile-de-France': [48.85, 2.35],
  'Provence-Alpes-Côte d\'Azur': [43.93, 6.07],
  'Nouvelle-Aquitaine': [45.83, -0.57],
  'Auvergne-Rhône-Alpes': [45.5, 4.5],
  'Occitanie': [43.6, 1.44],
  'Hauts-de-France': [50.45, 2.83],
  'Grand Est': [48.5, 6.2],
  'Bourgogne-Franche-Comté': [47.1, 4.7],
  'Bretagne': [48.2, -2.9],
  'Centre-Val de Loire': [47.5, 1.75],
  'Pays de la Loire': [47.5, -0.8],
  'Normandie': [49.1, -0.1],
  'Corse': [42.0, 9.0]
};


const FitBounds = ({ geojson }: { geojson: any }) => {
  const map = useMap();
  useEffect(() => {
    if (geojson?.features?.length) {
      const layer = L.geoJSON(geojson);
      map.fitBounds(layer.getBounds());
    }
  }, [geojson, map]);
  return null;
};

type WeatherEntry = {
  temp: number;
  icon: string;
  description: string;
  wind: number;
  windDeg: number;
  hourly: { dt: number; temp_min: number; temp_max: number; icon: string }[];
  todayHourly: { dt: number; temp: number; icon: string }[]; // Ajout pour la journée
};

export default function MapRegions() {
  const [regions, setRegions] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherEntry>>({});
  const [selectedRegion, setSelectedRegion] = useState<string>('Ile-de-France');

  useEffect(() => {
    fetch('/regions-version-simplifiee.geojson')
      .then(res => res.json())
      .then(data => setRegions(data))
      .catch(err => console.error('Erreur GeoJSON régions :', err));
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      const entries = Object.entries(regionCoordinates);
      const newData: Record<string, WeatherEntry> = {};

      for (const [region, [lat, lon]] of entries) {
        try {
          const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
          );
          const current = await currentRes.json();

          const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
          );
          const forecastData = await forecastRes.json();

          const dailyForecast = forecastData.list
            .filter((_: any, index: number) => index % 8 === 0)
            .slice(0, 5);

          const todayForecast = forecastData.list.slice(0, 8); // Prévisions sur 24h

          newData[region] = {
            temp: Math.round(current.main.temp),
            icon: current.weather?.[0]?.icon ?? '01d',
            description: current.weather?.[0]?.description ?? 'Inconnu',
            wind: current.wind?.speed,
            windDeg: current.wind?.deg ?? 0,
            hourly: dailyForecast.map((d: any) => ({
              dt: d.dt,
              temp_min: Math.round(d.main.temp_min),
              temp_max: Math.round(d.main.temp_max),
              icon: d.weather?.[0]?.icon ?? '01d',
            })),
            todayHourly: todayForecast.map((d: any) => ({
              dt: d.dt,
              temp: Math.round(d.main.temp),
              icon: d.weather?.[0]?.icon ?? '01d',
            })),
          };
        } catch (err) {
          console.error(`Erreur météo pour ${region}:`, err);
        }
      }

      setWeatherData(newData);
    };

    fetchWeatherData();
  }, []);

  const normalize = (str: string) =>
    str[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "") + str.slice(1);

  const getRegionCenter = (feature: any) => {
    const layer = L.geoJSON(feature);
    return layer.getBounds().getCenter();
  };

  const createLabelIcon = (text: string, iconCode: string, temp: number, regionName: string) =>
    L.divIcon({
      className: '',
      html: `
      <div style="
        position: absolute; /* Leaflet va gérer la position */
        transform: translate(-50%, -100%);
        pointer-events: auto;
      ">
        <div style="
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          background: linear-gradient(145deg, #fefefe, #dbe9f7);
          border: 3px solid ${regionName === selectedRegion ? '#000000' : '#aac7e0'}; /* bordure noire si sélectionnée */
          border-radius: 14px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.35);
          color: #333;
        ">
          <i class="wi ${weatherIcons[iconCode]}" style="font-size:26px;"></i>
          <span>${text}</span>

          <!-- Flèche attachée -->
          <div style="
            position: absolute;
            bottom: -12px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-top: 14px solid #fefefe;
            z-index: 2;
          "></div>

          <!-- Contour de la flèche -->
          <div style="
            position: absolute;
            bottom: -14px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 14px solid transparent;
            border-right: 14px solid transparent;
            border-top: 16px solid ${regionName === selectedRegion ? '#000000' : '#aac7e0'};
            z-index: 1;
          "></div>
        </div>
      </div>
    `,
      iconSize: undefined,
      iconAnchor: [0, 0],
    });


  const getWindDirection = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  return (
    <div className="h-full p-4 relative">
      <MapContainer className="z-0" center={[46.5, 2.5]} zoom={6} style={{ height: '650px', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution="&copy; CARTO"
        />
        <TileLayer
          url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
          opacity={0.7}
        />
        <TileLayer
          url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
          attribution="Précipitations &copy; OpenWeatherMap"
        />
        {regions && (
          <>
            <GeoJSON data={regions} style={{ color: '#000000', weight: 2, fillOpacity: 0 }} />
            {regions.features.map((feature: any, index: number) => {
              const regionName = normalize(feature.properties.nom);
              const center = getRegionCenter(feature);
              const data = weatherData[regionName];
              const temp = data?.temp ?? NaN;
              const icon = data?.icon || '01d';
              const label = `${regionName} - ${isNaN(temp) ? '?°C' : `${temp}°C`}`;
              return (
                <Marker
                  key={index}
                  position={center}
                  icon={createLabelIcon(label, icon, temp, regionName)}
                  eventHandlers={{
                    click: () => {
                      setSelectedRegion(regionName);
                    }
                  }}
                />
              );
            })}
            <FitBounds geojson={regions} />
          </>
        )}
      </MapContainer>

      {/* Bloc météo actuelle + prévisions horaires */}
      {weatherData[selectedRegion] && (
        <div className="absolute bottom-10 right-10 z-50 w-[300px] bg-white rounded-xl shadow-md p-4 border border-gray-300">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Météo actuelle - {selectedRegion}</h2>

          <div className="flex items-center gap-3 bg-gray-50 rounded-md p-2 border mb-2">
            <i className={`wi ${weatherIcons[weatherData[selectedRegion].icon]} p-2 text-4xl`} />

            <div>
              <div className="text-2xl font-bold">
                {weatherData[selectedRegion].temp}°C
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {weatherData[selectedRegion].description}
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-700 mt-2">
            💨 Vent : <span className="font-semibold ml-1">{weatherData[selectedRegion].wind} m/s</span>
            <div className="ml-2 flex items-center gap-1">
              <span>({getWindDirection(weatherData[selectedRegion].windDeg)})</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="text-gray-600"
                style={{
                  transform: `rotate(${weatherData[selectedRegion].windDeg}deg)`,
                  transition: 'transform 0.3s ease',
                }}
                viewBox="0 0 16 16"
              >
                <path fillRule="evenodd" d="M8 1.5l4 6H4l4-6zm0 13a.5.5 0 0 0 .5-.5V8.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 8.707V14a.5.5 0 0 0 .5.5z" />
              </svg>
            </div>
          </div>

          {/* Prévisions horaires sur la journée */}
          {weatherData[selectedRegion]?.todayHourly && (
            <>
              <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-700">Aujourd'hui</h3>
              <div className="flex gap-3 overflow-x-auto">
                {weatherData[selectedRegion].todayHourly.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-xs min-w-[50px]">
                    <span className="text-gray-500">
                      {new Date(item.dt * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit' })}
                    </span>
                    <i className={`wi ${weatherIcons[item.icon]} p-2 text-2xl`} />
                    <span className="text-gray-800 font-medium">{item.temp}°</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Bloc prévisions semaine */}
      {weatherData[selectedRegion]?.hourly && (
        <div className="absolute bottom-10 left-10 z-50 w-[360px] bg-white rounded-xl shadow-md p-4 border border-gray-300">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Prévisions 5 jours - {selectedRegion}</h2>

          <div className="flex gap-3 overflow-x-auto">
            {weatherData[selectedRegion].hourly.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-sm min-w-[60px]">
                <div className="text-gray-600 font-semibold">
                  {new Date(item.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <i className={`wi ${weatherIcons[item.icon]} p-2 text-3xl`} />

                <div className="text-gray-800 font-medium">
                  {item.temp_max}° / {item.temp_min}°
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2 italic">
            Températures max / min
          </p>
        </div>
      )}
    </div>
  );
}
