import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { TripContext } from '../../contexts/TripContext';
import { Plus, Minus, Trash2, Cloud, Thermometer, MapPin } from 'lucide-react';

const getWeatherVisual = (iconCode, description) => {
  if (!iconCode && !description) return '❓';
  const desc = description ? description.toLowerCase() : "";
  if (iconCode) {
    if (iconCode.includes('clear')) return '☀️';
    if (iconCode.includes('cloud')) return '☁️';
    if (iconCode.includes('rain')) return '🌧️';
    if (iconCode.includes('snow')) return '❄️';
    if (iconCode.includes('thunderstorm') || desc.includes('thunder')) return '⛈️';
    if (iconCode.includes('fog') || desc.includes('fog')) return '🌫️';
  }
  if (desc.includes("clear")) return "☀️";
  if (desc.includes("cloud")) return "☁️";
  if (desc.includes("rain")) return "🌧️";
  if (desc.includes("snow")) return "❄️";
  return '🌍';
};

function RightSidebar() {
  const {
    currentSelectedLocation,
    stops,
    removeStop,
    weatherForecastDays,
    setWeatherForecastDays,
    activeRoute,
  } = useContext(TripContext);

  const [selectedLocationWeather, setSelectedLocationWeather] = useState(null);
  const [error, setError] = useState('');
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const stopsWeatherCache = useRef({});

  const openWeatherApiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;

  const fetchSelectedLocationWeather = useCallback(async () => {
    if (!openWeatherApiKey) {
      setError("OpenWeather API key is missing.");
      setSelectedLocationWeather(null);
      return;
    }
    if (!currentSelectedLocation || (!currentSelectedLocation.lat && !currentSelectedLocation.lon && !currentSelectedLocation.name)) {
      setSelectedLocationWeather(null);
      setError("No location selected.");
      return;
    }
    setError('');
    setIsLoadingWeather(true);

    try {
      let url = '';
      if (currentSelectedLocation.lat && currentSelectedLocation.lon) {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${currentSelectedLocation.lat}&lon=${currentSelectedLocation.lon}&appid=${openWeatherApiKey}&units=metric`;
      } else if (currentSelectedLocation.name) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(currentSelectedLocation.name)}&appid=${openWeatherApiKey}&units=metric`;
      } else {
        setError("Selected location has no valid coordinates or name.");
        setSelectedLocationWeather(null);
        setIsLoadingWeather(false);
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        setError(`Failed to fetch weather for ${currentSelectedLocation.name || "selected location"}.`);
        setSelectedLocationWeather(null);
        setIsLoadingWeather(false);
        return;
      }
      const data = await response.json();
      if (data.cod !== "200") {
        setError(`OpenWeather error: ${data.message}`);
        setSelectedLocationWeather(null);
        setIsLoadingWeather(false);
        return;
      }

      const dailyData = [];
      const now = new Date();

      data.list.forEach(item => {
        const itemDate = new Date(item.dt_txt);
        const dayDiff = Math.floor((itemDate - now) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < weatherForecastDays && itemDate.getHours() === 12) {
          dailyData.push({
            date: item.dt_txt,
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            icon: item.weather?.[0]?.icon || '',
            description: item.weather?.[0]?.description || ''
          });
        }
      });

      setSelectedLocationWeather(dailyData);
    } catch (err) {
      setError("Failed to fetch weather data. Please try again later.");
      setSelectedLocationWeather(null);
    } finally {
      setIsLoadingWeather(false);
    }
  }, [currentSelectedLocation, weatherForecastDays, openWeatherApiKey]);

  // Fetch weather for stops, cache results by stop name + days
  const fetchWeatherForStops = useCallback(async () => {
    if (!openWeatherApiKey) return;
    if (!stops.length) return;

    await Promise.all(stops.map(async (stop) => {
      const cacheKey = `${stop.name}_${weatherForecastDays}`;
      if (stopsWeatherCache.current[cacheKey]) return; // Use cached

      try {
        let url = '';
        if (stop.lat && stop.lon) {
          url = `https://api.openweathermap.org/data/2.5/forecast?lat=${stop.lat}&lon=${stop.lon}&appid=${openWeatherApiKey}&units=metric`;
        } else if (stop.name) {
          url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(stop.name)}&appid=${openWeatherApiKey}&units=metric`;
        } else {
          return;
        }
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();
        if (data.cod !== "200") return;

        const dailyData = [];
        const now = new Date();
        data.list.forEach(item => {
          const itemDate = new Date(item.dt_txt);
          const dayDiff = Math.floor((itemDate - now) / (1000 * 60 * 60 * 24));
          if (dayDiff >= 0 && dayDiff < weatherForecastDays && itemDate.getHours() === 12) {
            dailyData.push({
              date: item.dt_txt,
              temp_min: item.main.temp_min,
              temp_max: item.main.temp_max,
              icon: item.weather?.[0]?.icon || '',
              description: item.weather?.[0]?.description || ''
            });
          }
        });

        stopsWeatherCache.current[cacheKey] = dailyData;
      } catch {
        
      }
    }));
  }, [stops, weatherForecastDays, openWeatherApiKey]);

  useEffect(() => {
    if (activeRoute === 'map') {
      fetchSelectedLocationWeather();
    }
  }, [activeRoute, fetchSelectedLocationWeather]);

  useEffect(() => {
    fetchWeatherForStops();
  }, [stops, weatherForecastDays, fetchWeatherForStops]);

  const handleForecastDaysChange = (increment) => {
    setWeatherForecastDays(prev => {
      const newDays = prev + increment;
      if (newDays >= 1 && newDays <= 5) return newDays;
      return prev;
    });
  };

  return (
    <div className="w-full lg:w-[300px] xl:w-[350px] bg-primary-Bg-LightMode2 dark:bg-primary-Bg-DarkMode2 p-4 rounded-xl shadow-lg flex flex-col space-y-4 text-primary-Text-LightMode dark:text-primary-Text-DarkMode overflow-y-auto h-screen lg:h-[calc(100vh-4rem-env(safe-area-inset-bottom))]">
      {activeRoute === 'map' && (
        <div className="border border-gray-300 dark:border-gray-700 p-3 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-center">
            Weather at {currentSelectedLocation ? currentSelectedLocation.name : "Selected Location"}
          </h3>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <button
              onClick={() => handleForecastDaysChange(-1)}
              disabled={weatherForecastDays <= 1}
              className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm w-20 text-center">{weatherForecastDays} Day{weatherForecastDays > 1 ? 's' : ''} Forecast</span>
            <button
              onClick={() => handleForecastDaysChange(1)}
              disabled={weatherForecastDays >= 5}
              className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>

          {isLoadingWeather && <p className="text-sm text-center">Loading weather...</p>}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {!isLoadingWeather && selectedLocationWeather && selectedLocationWeather.length > 0 ? (
            <ul className="space-y-2 text-xs">
              {selectedLocationWeather.map((dayWeather, index) => (
                <li key={index} className="p-2 bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode rounded-md shadow">
                  <p className="font-semibold">{new Date(dayWeather.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl">{getWeatherVisual(dayWeather.icon, dayWeather.description)}</span>
                    <div className="text-right">
                      <p className="flex items-center justify-end"><Thermometer size={12} className="mr-1" /> {dayWeather.temp_min?.toFixed(0)}°C - {dayWeather.temp_max?.toFixed(0)}°C</p>
                      <p className="flex items-center justify-end"><Cloud size={12} className="mr-1" /> {dayWeather.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !isLoadingWeather && !error && <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Select a location on the map to see weather.</p>
          )}
        </div>
      )}

      {activeRoute === 'schedule' && (
        <div className="border border-gray-300 dark:border-gray-700 p-3 rounded-lg text-center">
          <MapPin size={24} className="mx-auto mb-2 text-blue-500" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Go to the Map section to see detailed weather for a selected location.
          </p>
        </div>
      )}

      <div className="border border-gray-300 dark:border-gray-700 p-3 rounded-lg flex-grow">
        <h3 className="text-lg font-semibold mb-3 text-center">Added Stops</h3>
        {stops.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {stops.map(stop => {
              const cacheKey = `${stop.name}_${weatherForecastDays}`;
              const cachedWeather = stopsWeatherCache.current[cacheKey];
              const weather = cachedWeather && cachedWeather.length > 0 ? cachedWeather[0] : null;
              return (
                <li key={stop.id} className="flex items-center justify-between p-2 bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode rounded-md shadow">
                  <div className="flex-grow overflow-hidden mr-2">
                    <p className="font-semibold truncate" title={stop.name}>{stop.name}</p>
                    {weather ? (
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        <span className="text-lg mr-1">{getWeatherVisual(weather.icon, weather.description)}</span>
                        <span>{weather.temp_max?.toFixed(0)}°C</span>
                        <span className="mx-1">|</span>
                        <span className="truncate" title={weather.description}>{weather.description}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Weather N/A</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeStop(stop.id)}
                    title="Remove stop"
                    className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No stops added yet. Search and add locations from the map.</p>
        )}
      </div>
    </div>
  );
}

export default RightSidebar;
