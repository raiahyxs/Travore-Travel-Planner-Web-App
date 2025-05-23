// src/pages/Schedule/SchedulePage.jsx
import React, { useContext, useEffect } from 'react';
import Calendar from 'react-calendar';
import './Calendar.css';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import { TripContext } from '../../contexts/TripContext';
import { Edit3, Trash2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function Schedule() {
  const {
    tripName,
    setTripName,
    tripDate,
    setTripDate,
    stops,
    savedTrips,
    saveTrip,
    deleteTrip,
    loadTripForEditing,
    setActiveRoute,
    isDirty,
    setIsDirty,
    clearCurrentTripDetails,
    editingTripId,
    setEditingTripId,
  } = useContext(TripContext);

  const navigate = useNavigate();

  useEffect(() => {
    let currentlyDirty = false;
    if (editingTripId) {
      const originalTrip = savedTrips.find(t => t.id === editingTripId);
      if (originalTrip) {
        const nameChanged = tripName !== originalTrip.name;
        const dateChanged =
          tripDate &&
          new Date(tripDate).toISOString().split('T')[0] !==
            new Date(originalTrip.date).toISOString().split('T')[0];
        const currentStopsSimplified = stops.map(s => ({
          name: s.name,
          lat: s.lat,
          lon: s.lon,
        }));
        const originalStopsSimplified = originalTrip.stops.map(s => ({
          name: s.name,
          lat: s.lat,
          lon: s.lon,
        }));
        const stopsChanged =
          JSON.stringify(currentStopsSimplified) !==
          JSON.stringify(originalStopsSimplified);
        if (nameChanged || dateChanged || stopsChanged) {
          currentlyDirty = true;
        }
      }
    } else {
      if (
        tripName ||
        stops.length > 0 ||
        (tripDate && tripDate.toDateString() !== new Date().toDateString())
      ) {
        currentlyDirty = true;
      }
    }
    if (isDirty !== currentlyDirty) {
      setIsDirty(currentlyDirty);
    }
  }, [tripName, tripDate, stops, editingTripId, savedTrips, setIsDirty, isDirty]);

  const handleDateChange = newDate => {
    setTripDate(newDate);
  };

  const handleTripNameChange = e => {
    setTripName(e.target.value);
  };

  const handleSaveTrip = () => {
    if (!tripName.trim() || !tripDate || stops.length === 0) {
      alert('Please provide a trip name, select a date, and add at least one stop.');
      return;
    }

    let tripDataToSave;
    if (editingTripId) {
      deleteTrip(editingTripId);
      tripDataToSave = {
        id: editingTripId,
        name: tripName,
        date: tripDate,
        stops: stops,
      };
    } else {
      tripDataToSave = {
        id: uuidv4(),
        name: tripName,
        date: tripDate,
        stops: stops,
      };
    }

    const success = saveTrip(tripDataToSave);

    if (success) {
      alert(editingTripId ? 'Trip updated successfully!' : 'Trip saved successfully!');
      setEditingTripId(null);
      clearCurrentTripDetails();
    }
  };

  const handleEditTrip = tripId => {
    loadTripForEditing(tripId);
    setEditingTripId(tripId);
    setActiveRoute('schedule');
  };

  const handleDeleteTrip = tripId => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      deleteTrip(tripId);
      if (editingTripId === tripId) {
        clearCurrentTripDetails();
        setEditingTripId(null);
      }
    }
  };

  const handleCheckMap = () => {
    if (isDirty) {
      if (
        !window.confirm(
          'You have unsaved changes in the schedule. These will be kept if you go to the map. Continue?'
        )
      ) {
        return;
      }
    }
    setActiveRoute('map');
    navigate('/Map');
  };

  // New Trip button function
  const startNewTrip = () => {
    if (isDirty) {
      if (
        !window.confirm(
          'You have unsaved changes. Are you sure you want to start a new trip? This will clear the current form.'
        )
      ) {
        return;
      }
    }
    setTripName('');
    setTripDate(null);
    clearCurrentTripDetails();
    setEditingTripId(null);
  };

  return (
    <div className="font-montserrat w-full flex-1 bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode p-3 md:p-4 min-h-screen lg:pl-24 flex flex-col xl:flex-row gap-4 md:gap-6">
      <div className="w-full max-w-[86rem] mx-auto flex flex-col lg:flex-row gap-5 md:gap-5">
        <div className="flex-grow bg-primary-Bg-LightMode2 dark:bg-primary-Bg-DarkMode2 p-5 rounded-xl shadow-lg flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-Text-LightMode dark:text-primary-Text-DarkMode">
              {editingTripId ? 'Edit Your Journey' : 'Schedule Your Journey'}
            </h1>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={startNewTrip}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg text-sm sm:text-base transition duration-150 ease-in-out"
              >
                New Trip
              </button>
              <button
                onClick={handleCheckMap}
                className="bg-primary-Button2-LightMode dark:bg-primary-Button1-DarkMode hover:bg-primary-Button2-LightMode_Hover dark:hover:bg-primary-Button-DarkMode_Hover text-primary-Text-LightMode dark:text-primary-Text-DarkMode font-medium py-2 px-4 rounded-lg text-sm sm:text-base transition duration-150 ease-in-out"
              >
                <MapPin size={18} className="inline mr-2" /> Check Map
              </button>
              <button
                onClick={handleSaveTrip}
                className="bg-primary-Button1-LightMode dark:bg-primary-Button2-LightMode hover:bg-primary-Button1-LightMode_Hover dark:hover:bg-primary-Button-DarkMode_Hover text-primary-Text-DarkMode dark:text-primary-Text-DarkMode1 font-medium py-2 px-4 rounded-lg text-sm sm:text-base transition duration-150 ease-in-out"
              >
                {editingTripId ? 'Update Trip' : 'Save Trip'}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5 md:gap-5 flex-grow">
            <div className="w-full md:w-1/3 bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode p-4 rounded-xl shadow-md flex flex-col min-h-[300px] md:min-h-[400px]">
              <h2 className="text-xl font-semibold text-primary-Text-LightMode dark:text-primary-Text-DarkMode mb-3 text-center">
                Saved Trips
              </h2>
              {savedTrips.length > 0 ? (
                <ul className="space-y-2 overflow-y-auto flex-grow">
                  {savedTrips.map(trip => (
                    <li
                      key={trip.id}
                      className="p-3 bg-primary-Bg-LightMode2 dark:bg-primary-Bg-DarkMode2 rounded-lg shadow flex justify-between items-center"
                    >
                      <div>
                        <p
                          className="font-semibold text-primary-Text-LightMode dark:text-primary-Text-DarkMode truncate max-w-[150px] sm:max-w-xs"
                          title={trip.name}
                        >
                          {trip.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(trip.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {trip.stops.length} stop{trip.stops.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleEditTrip(trip.id)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-700"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center border border-dashed border-gray-300 dark:border-primary-Outline-DarkMode rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">No trips saved yet.</p>
                </div>
              )}
            </div>

            <div className="w-full md:w-2/3 flex flex-col space-y-6">
              <div className="bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode p-4 rounded-xl shadow-md border border-gray-200 dark:border-primary-Outline-DarkMode">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-primary-Text-DarkMode mb-3">
                  Trip Name
                </h3>
                <input
                  type="text"
                  placeholder="Enter trip name..."
                  value={tripName}
                  onChange={handleTripNameChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 text-primary-Text-LightMode dark:text-primary-Text-DarkMode bg-primary-Bg-LightMode2 dark:bg-primary-Bg-DarkMode2 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition duration-150 ease-in-out"
                />
              </div>

              <div className="bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode p-3 rounded-xl shadow-md border border-gray-200 dark:border-primary-Outline-DarkMode flex-grow flex flex-col overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-primary-Text-DarkMode mb-2 text-center">
                  Select Date
                </h3>
                <div className="flex justify-center items-center flex-grow w-full max-w-md mx-auto min-h-0">
                  <Calendar
                    onChange={handleDateChange}
                    value={tripDate}
                    className="custom-react-calendar"
                    tileClassName={({ date, view }) =>
                      view === 'month' && tripDate && date.toDateString() === tripDate.toDateString()
                        ? 'react-calendar__tile--active'
                        : null
                    }
                    minDate={new Date()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <RightSidebar />
      </div>
    </div>
  );
}

export default Schedule;
