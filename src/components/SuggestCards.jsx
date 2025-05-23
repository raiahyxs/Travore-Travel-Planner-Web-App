import React from 'react';

function SuggestCards({ onAddToTrip }) {
    const recommendations = [
        { id: 1, name: 'Manila City', lat: 14.5995, lon: 120.9842 },
        { id: 2, name: 'Cebu City', lat: 10.3157, lon: 123.8854 },
        { id: 3, name: 'Davao City', lat: 7.1907, lon: 125.4553 },
    ];

    return (
        <div className="suggest-cards-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((location) => (
                <div key={location.id} className="card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{location.name}</h3>
                    <button
                        onClick={() => onAddToTrip(location)}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Add to Trip
                    </button>
                </div>
            ))}
        </div>
    );
}

export default SuggestCards;
