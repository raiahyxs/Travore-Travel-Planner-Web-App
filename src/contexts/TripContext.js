// src/contexts/TripContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const TripContext = createContext();

// Caches
const geocodeCache = new Map(); // Cache for geocoding: key = locationName, value = {lat, lon}

export const TripProvider = ({ children }) => {
  const [currentSelectedLocation, setCurrentSelectedLocation] = useState(null); // { name, lat, lon }
  const [stops, setStops] = useState([]); // Array of { id, name, lat, lon, weather }
  const [tripName, setTripName] = useState('');
  const [tripDate, setTripDate] = useState(new Date());
  const [savedTrips, setSavedTrips] = useState(() => {
    const localSavedTrips = localStorage.getItem('savedTrips');
    return localSavedTrips ? JSON.parse(localSavedTrips) : [];
  });
  const [weatherForecastDays, setWeatherForecastDays] = useState(3); // Default 3 days
  const [activeRoute, setActiveRoute] = useState('map'); // 'map' or 'schedule'
  const [isDirty, setIsDirty] = useState(false); // Tracks if there are unsaved changes
  const [editingTripId, setEditingTripId] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // IMPORTANT: Ensure REACT_APP_GEOAPIFY_API_KEY is set in your .env file
  const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;
  useEffect(() => {
    if (!GEOAPIFY_API_KEY) {
      console.error("Geoapify API key (REACT_APP_GEOAPIFY_API_KEY) is missing. Please set it in your .env file and restart the development server.");
      // Optionally, you could set an error state here to inform the user in the UI
    }
  }, [GEOAPIFY_API_KEY]);


  useEffect(() => {
    // Mark as dirty if stops, tripName, or tripDate change after initial load or save
    // This effect should ideally run only after the initial state is set or a trip is loaded/saved.
    // For simplicity, we'll keep it as is, but be mindful of initial renders marking as dirty.
    if (stops.length > 0 || tripName !== '' || tripDate.toISOString() !== new Date(0).toISOString()) { // Compare with a known initial date if needed
        setIsDirty(true);
    }
  }, [stops, tripName, tripDate]);


  useEffect(() => {
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    // setIsDirty(false); // Reset dirty flag only when a save action is successful
  }, [savedTrips]);

  // Helper function to wait for a specified time
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWeatherForLocation = useCallback(async (lat, lon, days = weatherForecastDays, retries = 3) => {
    if (!lat || !lon) {
        console.warn("fetchWeatherForLocation called with invalid lat/lon:", lat, lon);
        return null;
    }
    if (!GEOAPIFY_API_KEY) {
      console.error("Geoapify API key is missing. Weather data cannot be fetched.");
      return null;
    }

    setIsLoadingWeather(true); // Set loading to true before starting the fetch

    for (let i = 0; i < retries; i++) {
      try {
        const url = `https://api.geoapify.com/v1/weather?lat=${lat}&lon=${lon}&type=daily&units=metric&apiKey=${GEOAPIFY_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
          console.error(`Failed to fetch weather from Geoapify (Attempt ${i+1}/${retries}): ${response.status} - ${errorData.message || response.statusText}`);
          if (response.status === 401) { // Unauthorized - API key issue
            console.error("Geoapify API key is invalid or not authorized. Please check your API key.");
            setIsLoadingWeather(false);
            return null; // Stop retrying for auth errors
          }
          if (response.status === 429 && i < retries - 1) {
            console.warn("Rate limit hit. Retrying in 1 second...");
            await wait(1000 + (i * 500)); // Exponential backoff might be better
            continue;
          }
          if (i === retries - 1) { // Last attempt failed
             setIsLoadingWeather(false);
             return null;
          }
          continue; // For other retryable errors
        }

        const data = await response.json();
        if (!data.properties || !data.properties.days) {
            console.error("Geoapify weather data is not in the expected format:", data);
            setIsLoadingWeather(false);
            return null;
        }

        const forecastData = data.properties.days.slice(0, days).map(day => ({
          date: day.date,
          temp_max: day.temp_max,
          temp_min: day.temp_min,
          icon: day.icon, // e.g., "clear-day", "rain", "partly-cloudy-day"
          description: day.weather, // e.g., "clear sky", "light rain"
          precipitation_prob: day.precipitation ? day.precipitation.probability : 0,
          wind_speed: day.wind ? day.wind.speed_max : 0,
        }));
        setIsLoadingWeather(false);
        return forecastData;
      } catch (err) {
        console.error(`Error fetching weather from Geoapify (Attempt ${i+1}/${retries}):`, err);
        if (i < retries - 1) {
            if (err.message && err.message.toLowerCase().includes('failed to fetch')) { // Network error
                console.warn("Network error. Retrying in 1 second...");
                await wait(1000 + (i * 500));
                continue;
            }
            // For other types of errors, you might not want to retry or handle differently
        }
      }
    }
    setIsLoadingWeather(false); // Ensure loading is false if all retries fail
    return null;
  }, [GEOAPIFY_API_KEY, weatherForecastDays]);


  const addStop = async (location) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      console.error("Invalid location data provided to addStop:", location);
      return;
    }

    const newStopId = uuidv4();

    // Fetch weather data for the stop
    const weatherDataArray = await fetchWeatherForLocation(location.lat, location.lon, 1);

    const newStop = {
      ...location,
      id: newStopId,
      weather: weatherDataArray && weatherDataArray.length > 0 ? weatherDataArray[0] : null, // Add weather data
    };

    setStops((prevStops) => [...prevStops, newStop]); // Add the stop to the list
    setIsDirty(true); // Mark the trip as dirty
  };

  const removeStop = (stopId) => {
    setStops(prevStops => prevStops.filter(stop => stop.id !== stopId));
    setIsDirty(true);
  };

  // updateStopWeather is intended to refresh weather for a specific stop,
  // perhaps if the user wants an updated forecast for it.
  const updateStopWeather = async (stopId, days = 1) => {
    const stopToUpdate = stops.find(s => s.id === stopId);
    if (stopToUpdate) {
        const weatherDataArray = await fetchWeatherForLocation(stopToUpdate.lat, stopToUpdate.lon, days);
        setStops(prevStops =>
            prevStops.map(s =>
                s.id === stopId ? { ...s, weather: weatherDataArray && weatherDataArray.length > 0 ? weatherDataArray[0] : s.weather } : s
            )
        );
        setIsDirty(true); // Weather update can be considered a change
    }
  };


  const saveTrip = () => {
    if (!tripName.trim()) {
      alert("Please provide a trip name.");
      return false;
    }
    if (stops.length === 0) {
      alert("Please add at least one stop to save the trip.");
      return false;
    }

    const tripToSave = {
      id: editingTripId || uuidv4(), // Use editingTripId if it exists, otherwise new ID
      name: tripName,
      date: tripDate.toISOString(),
      // Store minimal stop info, weather will be re-fetched on load
      stops: stops.map(s => ({ name: s.name, lat: s.lat, lon: s.lon, id: s.id /* Persist original ID if available */ })),
    };

    setSavedTrips(prev => {
        const existingTripIndex = prev.findIndex(trip => trip.id === tripToSave.id);
        if (existingTripIndex > -1) {
            const updatedTrips = [...prev];
            updatedTrips[existingTripIndex] = tripToSave;
            return updatedTrips;
        }
        return [...prev, tripToSave];
    });

    setIsDirty(false); // Reset dirty flag after saving
    if (!editingTripId) setEditingTripId(tripToSave.id); // If it was a new trip, set its ID as editing
    alert("Trip saved successfully!");
    return true;
  };

  const deleteTrip = (tripId) => {
    setSavedTrips(prev => prev.filter(trip => trip.id !== tripId));
    if (editingTripId === tripId) { // If deleting the currently edited trip
        clearCurrentTripDetails();
    }
  };

  const loadTripForEditing = async (tripId) => {
    const tripToEdit = savedTrips.find(trip => trip.id === tripId);
    if (tripToEdit) {
      setTripName(tripToEdit.name);
      setTripDate(new Date(tripToEdit.date));
      setEditingTripId(tripToEdit.id);

      // Fetch weather for all stops in parallel
      setIsLoadingWeather(true); // Set loading true for the batch operation
      const stopsWithWeatherPromises = tripToEdit.stops.map(async (stopData) => {
        const weatherArray = await fetchWeatherForLocation(stopData.lat, stopData.lon, 1);
        return {
          ...stopData,
          id: stopData.id || uuidv4(), // Ensure ID exists, use persisted one if available
          weather: weatherArray && weatherArray.length > 0 ? weatherArray[0] : null,
        };
      });

      try {
        const loadedStopsWithWeather = await Promise.all(stopsWithWeatherPromises);
        setStops(loadedStopsWithWeather);
      } catch (error) {
        console.error("Error fetching weather for one or more stops during trip load:", error);
        // Set stops without weather or with partial weather if some failed
        setStops(tripToEdit.stops.map(s => ({ ...s, id: s.id || uuidv4(), weather: null })));
      } finally {
        setIsLoadingWeather(false); // Set loading to false after all fetches attempt
      }

      setActiveRoute('schedule');
      setIsDirty(false);
    }
  };

  const clearCurrentTripDetails = () => {
    setTripName('');
    setTripDate(new Date());
    setStops([]);
    setCurrentSelectedLocation(null);
    setEditingTripId(null);
    setIsDirty(false);
    setActiveRoute('map'); // Default to map view for a new trip
  }

  const value = {
    currentSelectedLocation,
    setCurrentSelectedLocation,
    stops,
    setStops,
    addStop,
    removeStop,
    updateStopWeather,
    tripName,
    setTripName,
    tripDate,
    setTripDate,
    savedTrips,
    saveTrip,
    deleteTrip,
    loadTripForEditing,
    weatherForecastDays,
    setWeatherForecastDays,
    fetchWeatherForLocation,
    isLoadingWeather, // Expose this
    activeRoute,
    setActiveRoute,
    isDirty,
    setIsDirty,
    clearCurrentTripDetails,
    editingTripId,
    setEditingTripId,
    GEOAPIFY_API_KEY,
    geocodeCache,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};
