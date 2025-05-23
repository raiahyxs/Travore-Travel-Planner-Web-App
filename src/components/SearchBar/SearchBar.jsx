import React, { useState, useEffect, useCallback, useContext } from 'react';
import { FaSearch } from "react-icons/fa"; // Import search icon
import { TripContext } from '../../contexts/TripContext'; // Import TripContext for map search functionality

function SearchBar({ onSelectLocation }) {
    const { geocodeCache, setCurrentSelectedLocation } = useContext(TripContext);
    const [searchInput, setSearchInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    const fetchLocationSuggestions = useCallback(async (query) => {
        if (!query) {
            setSuggestions([]);
            return;
        }
        const cacheKey = `nominatim-${query.toLowerCase()}`;
        if (geocodeCache && geocodeCache.has(cacheKey)) {
            setSuggestions(geocodeCache.get(cacheKey));
            return;
        }
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1&countrycodes=ph`
            );
            const data = await response.json();
            const formattedSuggestions = data.map((item) => ({
                name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
            }));
            if (geocodeCache) {
                geocodeCache.set(cacheKey, formattedSuggestions);
            }
            setSuggestions(formattedSuggestions);
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
            setSuggestions([]);
        }
    }, [geocodeCache]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchInput.trim().length >= 3) {
                setDebouncedSearchTerm(searchInput.trim());
            } else {
                setSuggestions([]);
            }
        }, 800);
        return () => clearTimeout(handler);
    }, [searchInput]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            fetchLocationSuggestions(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm, fetchLocationSuggestions]);

    const handleInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSelectSuggestion = (location) => {
        setSearchInput(location.name);
        setSuggestions([]);
        setCurrentSelectedLocation({ name: location.name, lat: location.lat, lon: location.lon });
        if (onSelectLocation) {
            onSelectLocation(location);
        }
    };

    const handleSearchButtonClick = async () => {
        if (!searchInput.trim()) return;
        if (suggestions.length > 0 && suggestions[0].name.toLowerCase().includes(searchInput.toLowerCase())) {
            handleSelectSuggestion(suggestions[0]);
        } else {
            const query = searchInput.trim();
            const cacheKey = `nominatim-${query.toLowerCase()}`;
            if (geocodeCache && geocodeCache.has(cacheKey) && geocodeCache.get(cacheKey).length > 0) {
                handleSelectSuggestion(geocodeCache.get(cacheKey)[0]);
                return;
            }
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1&countrycodes=ph`);
                const data = await response.json();
                if (data.length > 0) {
                    const { lat, lon, display_name: name } = data[0];
                    const locationItem = { name, lat: parseFloat(lat), lon: parseFloat(lon) };
                    if (geocodeCache) {
                        geocodeCache.set(cacheKey, [locationItem]);
                    }
                    handleSelectSuggestion(locationItem);
                } else {
                    alert("Location not found!");
                }
            } catch (error) {
                alert("Failed to fetch location.");
            }
        }
    };

    return (
        <div className="relative w-full">
            {/* Icon positioned inside the input padding area */}
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 md:h-5 md:w-5 text-primary-Text-LightMode dark:text-primary-Text-DarkMode" aria-hidden="true" />
            </div>

            {/* Input Field */}
            <input
                type="search"
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchButtonClick(); }}
                className={`
                    block w-full
                    min-w-[280px]
                    pl-10 md:pl-12
                    pr-3 py-2 md:py-3
                    text-base md:text-lg font-medium
                    dark:text-primary-Text-DarkMode
                    border
                    rounded-full
                    outline-none
                    transition-colors duration-200 ease-in-out
                    bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode
                    border-primary-Outline-DarkMode dark:border-primary-Outline-DarkMode
                    focus:ring-2
                    focus:ring-primary-Button1-LightMode
                    dark:focus:ring-primary-Text-DarkMode
                `}
                placeholder="Search Places..."
                aria-label="Search Places"
            />

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((locationItem, index) => (
                        <div
                            key={index}
                            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                            onClick={() => handleSelectSuggestion(locationItem)}
                        >
                            {locationItem.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchBar;