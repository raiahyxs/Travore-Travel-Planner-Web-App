import React from 'react';
import { useNavigate } from 'react-router-dom';
import SuggestCards from './SuggestCards';
import Home2 from './Home2';
import Home3 from './Home3';
import DayBackground from '../../components/DayBackground';
import NightBackground from '../../components/NightBackground';
import SearchBar from '../../components/SearchBar/SearchBar';
import { useDarkMode } from "../../ColorThemeContext";

function Home() {
    const { darkMode } = useDarkMode();
    const navigate = useNavigate();

    const handleAddToTrip = (stop) => {
        navigate('/Map', { state: { stop } });
    };

    return (
        <div className="page-container font-montserrat w-[100vw] min-h-screen bg-white dark:bg-gray">
            <div className="home-content-wrapper w-full">
                <div className="hero-section-content relative flex min-h-screen w-full items-center justify-center bg-cover bg-center px-4 py-16 sm:px-6 lg:px-8">
                    {darkMode ? <NightBackground /> : <DayBackground />}
                    <div className='hero-content relative z-10 w-full max-w-5xl text-center md:text-left md:pl-16'>
                        <h1 className='text-4xl font-bold text-primary-Text-LightMode dark:text-cyan-100 sm:text-5xl lg:text-6xl'>
                            Travel and Explore
                        </h1>
                        <div className="srch-btn-cont mt-8 mb-10 flex w-full flex-col items-center gap-5 md:flex-row md:flex-wrap md:justify-center lg:flex-nowrap lg:justify-between lg:gap-6">
                            <div className="w-full md:flex-1 md:max-w-md lg:max-w-lg xl:max-w-xl">
                                <SearchBar />
                            </div>
                            <div className="btns flex w-full flex-col items-center justify-center gap-4 md:w-auto md:flex-row md:flex-shrink-0 md:gap-4">
                                <button
                                    onClick={() => navigate('/Schedule')}
                                    className='sched-btn w-full whitespace-nowrap rounded-lg border-none bg-gray-100 bg-primary-Button1-LightMode text-primary-Text-DarkMode hover:bg-primary-Button1-LightMode_Hover px-5 py-3 font-sans text-base font-bold shadow-md transition-colors duration-200 ease-in-out hover:bg-gray-200 dark:bg-primary-Text-DarkMode dark:text-primary-Text-DarkMode1 dark:hover:bg-primary-Button-DarkMode_Hover md:w-auto'
                                >
                                    Schedule your Trip
                                </button>
                                <button
                                    onClick={() => navigate('/Map')}
                                    className='chk-map-btn w-full whitespace-nowrap rounded-lg border-2 border-solid border-primary-Button1-LightMode bg-transparent px-5 py-3 font-sans text-base font-bold text-primary-Text-DarkMode1 shadow-md transition-colors duration-200 ease-in-out hover:border-primary-Button-DarkMode_Hover hover:bg-black/10 dark:border-primary-Text-DarkMode dark:text-primary-Text-DarkMode dark:hover:bg-primary-Button-DarkMode_Hover dark:hover:bg-white/10 md:w-auto'
                                >
                                    Check the Map
                                </button>
                            </div>
                        </div>
                        <div className="mt-12 md:mt-14">
                            <SuggestCards onAddToTrip={handleAddToTrip} />
                        </div>
                    </div>
                </div>
                <Home2 />
                <Home3 />
            </div>
        </div>
    );
}

export default Home;