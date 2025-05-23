// src/components/Recommendations/Recommendations.jsx
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { TripContext } from '../../contexts/TripContext'; // Adjust path as needed
import { MapPin, ChevronLeft, ChevronRight, PlusSquare, Image as AlertTriangle } from 'lucide-react';

// Placeholder image function (fallback)
const getPlaceholderImageUrl = (name) => {
  const bgColor = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  const textColor = 'ffffff';
  return `https://placehold.co/600x400/${bgColor}/${textColor}?text=${encodeURIComponent(name.substring(0, 20))}&font=montserrat`;
};

// Function to fetch an image from Openverse
const fetchImageFromOpenverse = async (placeName, categories = []) => {
  // Construct a query. Prioritize place name, add categories for more context.
  let query = placeName;
  if (categories.length > 0) {
    // Take the first relevant category, clean it up.
    const primaryCategory = categories[0].split('.')[0].replace(/_/g, ' ');
    query += ` ${primaryCategory}`;
  }

  // Filter for photos, and licenses that are generally more permissive.
  // IMPORTANT: Always verify image licenses and provide attribution as required.
  // This example uses 'commercial' and 'modification' for broader usability,
  // but you might need to adjust based on your app's needs and Openverse API capabilities.
  // Refer to Openverse API docs for current license filters.
  // const licenses = "commercial,modification"; // Example: "BY,BY-SA,BY-ND,BY-NC,BY-NC-SA,BY-NC-ND,PDM,CC0"
  const url = `https://api.openverse.engineering/v1/images/?q=${encodeURIComponent(query)}&license_type=all-creative-commons&aspect_ratio=wide,square&page_size=1&source=flickr,wikimedia`; // Added source filter

  console.log(`Openverse INFO: Fetching image for query: "${query}" from URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        // Openverse encourages authentication for higher rate limits,
        // but it's not strictly required for basic use.
        // 'Authorization': 'Bearer YOUR_OPENVERSE_API_TOKEN' // If you have a token
      }
    });
    if (!response.ok) {
      console.error(`Openverse ERROR: API request failed with status ${response.status} for query "${query}"`);
      return null;
    }
    const data = await response.json();
    if (data.results && data.results.length > 0 && data.results[0].url) {
      console.log(`Openverse INFO: Found image for "${query}": ${data.results[0].url}`);
      // IMPORTANT: In a real app, you would also store/use:
      // data.results[0].license_url (to link to the license)
      // data.results[0].creator (for attribution)
      // data.results[0].title (for attribution)
      // console.log("Openverse INFO: License - ", data.results[0].license, "Creator - ", data.results[0].creator);
      return data.results[0].url;
    }
    console.log(`Openverse INFO: No image found for query "${query}"`);
    return null;
  } catch (error) {
    console.error(`Openverse ERROR: Failed to fetch or parse image for query "${query}":`, error);
    return null;
  }
};


function Recommendations() {
  const {
    GEOAPIFY_API_KEY,
    currentSelectedLocation,
    addStop,
  } = useContext(TripContext);

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollContainerRef = useRef(null);

  const fetchRecommendations = useCallback(async (lat, lon) => {
    if (!GEOAPIFY_API_KEY) {
      setError("Geoapify API key is missing. Cannot fetch recommendations.");
      console.error("Recommendations ERROR: Geoapify API key is missing.");
      return;
    }
    if (!lat || !lon) {
      setRecommendations([]);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');
    console.log(`Recommendations INFO: Fetching recommendations for lat: ${lat}, lon: ${lon}`);

    const categories = "tourism,catering.restaurant,accommodation.hotel,entertainment.museum,commercial.shopping_mall";
    const limit = 15;

    try {
      const geoapifyUrl = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},5000&bias=proximity:${lon},${lat}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;
      const response = await fetch(geoapifyUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown API error" }));
        console.error("Recommendations ERROR: Geoapify API error:", response.status, errorData);
        throw new Error(`Failed to fetch recommendations: ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      console.log("Recommendations INFO: Raw data from Geoapify Places API:", data);

      if (data.features && data.features.length > 0) {
        // Fetch images from Openverse for each recommendation
        const recommendationsWithImagePromises = data.features.map(async (feature) => {
          const placeName = feature.properties.name || feature.properties.address_line1 || "Unnamed Place";
          const placeCategories = feature.properties.categories || [];
          let imageUrl = await fetchImageFromOpenverse(placeName, placeCategories);

          if (!imageUrl) { // Fallback to placeholder if Openverse fails or returns no image
            imageUrl = getPlaceholderImageUrl(placeName);
          }
          
          return {
            id: feature.properties.place_id,
            name: placeName,
            address: feature.properties.formatted || feature.properties.address_line2 || "Address not available",
            lat: feature.properties.lat,
            lon: feature.properties.lon,
            categories: placeCategories,
            imageUrl: imageUrl, // Use fetched image or placeholder
            distance: feature.properties.distance,
            // Store license info if you fetch it from Openverse for attribution
            // licenseInfo: openverseImageDetails ? { url: openverseImageDetails.license_url, creator: openverseImageDetails.creator } : null,
          };
        });

        // Wait for all image fetches to settle
        const settledImageFetches = await Promise.allSettled(recommendationsWithImagePromises);
        
        const formattedRecommendations = settledImageFetches
          .filter(result => result.status === 'fulfilled') // Only take successful ones
          .map(result => result.value);

        setRecommendations(formattedRecommendations);

      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Recommendations ERROR: Catch block:", err);
      setError(err.message || "An unexpected error occurred while fetching recommendations.");
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [GEOAPIFY_API_KEY]);

  useEffect(() => {
    if (currentSelectedLocation && currentSelectedLocation.lat && currentSelectedLocation.lon) {
      fetchRecommendations(currentSelectedLocation.lat, currentSelectedLocation.lon);
    } else {
      setRecommendations([]);
      setError('');
    }
  }, [currentSelectedLocation, fetchRecommendations]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleAddStop = (place) => {
    if (place && place.lat && place.lon) {
      addStop({
        name: place.name,
        lat: place.lat,
        lon: place.lon,
      });
      console.log(`Recommendations INFO: Added "${place.name}" to trip.`);
    }
  };

  if (!GEOAPIFY_API_KEY) {
    return (
        <div className="w-full max-w-full mx-auto mt-10 py-6 px-4 sm:px-6 lg:px-8 bg-red-100/50 dark:bg-red-900/30 backdrop-blur-sm shadow-md rounded-xl flex flex-col items-center text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mb-3" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-1">Recommendations Unavailable</h3>
            <p className="text-sm text-red-600 dark:text-red-400">Geoapify API key is not configured. Please contact support or check application settings.</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto mt-10 py-6 px-0 sm:px-2 lg:px-4">
      <div className="bg-primary-Bg-LightMode2/70 dark:bg-primary-Bg-DarkMode2/70 backdrop-blur-md shadow-lg dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] rounded-xl p-4 sm:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-primary-Text-LightMode dark:text-primary-Text-DarkMode mb-1">
          Recommendations
        </h2>
        {!currentSelectedLocation && (
           <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select a location on the searchbar to see nearby recommendations.</p>
        )}
         {currentSelectedLocation && recommendations.length === 0 && !isLoading && !error && (
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No recommendations found near {currentSelectedLocation.name}. Try a different location.</p>
        )}
        {isLoading && (
          <div className="flex justify-center items-center h-48"> {/* Increased height for loader */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-primary-Text-LightMode dark:text-primary-Text-DarkMode">Loading recommendations & images...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-40 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400 mb-2" />
            <p className="text-red-600 dark:text-red-400 font-medium">Could not load recommendations.</p>
            <p className="text-xs text-red-500 dark:text-red-500">{error}</p>
          </div>
        )}

        {!isLoading && !error && recommendations.length > 0 && (
          <div className="relative">
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md transition-opacity opacity-75 hover:opacity-100 focus:outline-none -ml-3 md:-ml-4"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md transition-opacity opacity-75 hover:opacity-100 focus:outline-none -mr-3 md:-mr-4"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex space-x-4 overflow-x-auto py-4 scrollbar-hide"
            >
              {recommendations.map((place) => (
                <div
                  key={place.id}
                  className="flex-shrink-0 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  <img
                    src={place.imageUrl} // This will now be the Openverse image or placeholder
                    alt={place.name} // More descriptive alt text
                    className="w-full h-48 object-cover" // Increased image height
                    onError={(e) => { 
                        console.warn(`Recommendations WARN: Error loading image for ${place.name} from ${e.target.src}. Falling back to placeholder.`);
                        e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                        e.target.src = getPlaceholderImageUrl(place.name); 
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={place.name}>
                      {place.name}
                    </h3>
                    {/* IMPORTANT: ATTRIBUTION FOR OPENVERSE IMAGES
                      If using images from Openverse, you MUST provide attribution
                      according to the image's specific license.
                      This typically involves displaying the title, creator, and a link to the license.
                      Example: <a href={place.licenseInfo.url} target="_blank" rel="noopener noreferrer">
                                Image by {place.licenseInfo.creator} / {place.licenseInfo.license_short_name}
                               </a>
                      You would need to fetch and store this information from Openverse.
                    */}
                    <div className="flex items-start text-xs text-gray-600 dark:text-gray-400 mt-1 mb-2">
                      <MapPin size={14} className="mr-1.5 flex-shrink-0 mt-0.5" />
                      <p className="truncate" title={place.address}>{place.address}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 capitalize">
                      {place.categories.slice(0, 2).join(', ').replace(/_/g, ' ')}
                       {place.distance && ` - ${(place.distance / 1000).toFixed(1)} km away`}
                    </p>
                    <button
                      onClick={() => handleAddStop(place)}
                      className="w-full mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm flex items-center justify-center transition-colors duration-200"
                    >
                      <PlusSquare size={16} className="mr-2" />
                      Add to Trip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
