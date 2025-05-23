// src/App.js
import React, { useContext, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from "./components/NavBar";
import Home from "./pages/Home/Home";
import Schedule from "./pages/Schedule/Schedule.jsx";
import Map from "./pages/Map/Map.jsx";
import About from "./pages/About/About";
import { ColorThemeProvider } from "./ColorThemeContext";
import { TripProvider, TripContext } from './contexts/TripContext';

function NavigationBlocker() {
  const contextState = useContext(TripContext);
  const location = useLocation(); // Always call hooks at the top level

  const {
    isDirty,
    setActiveRoute,
    activeRoute: currentActiveRoute // Renamed from context to avoid conflict
  } = contextState || {}; // Provide a fallback to avoid errors if contextState is null

  useEffect(() => {
    if (!contextState) {
      console.warn("NavigationBlocker: TripContext not available on this render. This might be normal during initial app load if TripProvider is still mounting.");
      return;
    }

    const newRoute = location.pathname.toLowerCase().includes('/map') ? 'map' :
                     location.pathname.toLowerCase().includes('/schedule') ? 'schedule' : '';
    if (newRoute !== currentActiveRoute) {
      console.log(`NavigationBlocker: Path changed to ${location.pathname}. Setting activeRoute to: '${newRoute}'. Previous context route: '${currentActiveRoute}'`);
      setActiveRoute(newRoute);
    }
  }, [location.pathname, setActiveRoute, currentActiveRoute, contextState]);

  useEffect(() => {
    if (!contextState) return;

    const handleBeforeUnload = (event) => {
      if (isDirty) {
        console.log("NavigationBlocker: beforeunload event triggered, isDirty is true. Preventing navigation.");
        event.preventDefault();
        event.returnValue = ''; // Required for Chrome to show the default prompt
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, contextState]);

  return null;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    console.log(`App.js: Main component navigated to ${location.pathname}`);
  }, [location]);

  return (
    <React.Fragment>
      <ColorThemeProvider>
        <TripProvider>
          <NavBar/>
          <NavigationBlocker />
          {/* Added pt-16 assuming NavBar is fixed height of h-16 (4rem). Adjust if your NavBar height differs. */}
          <main className="page-content-area"> 
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home/>}/>
              <Route path="/Schedule" element={<Schedule />} />
              <Route path="/Map" element={<Map />} />
              <Route path="/About" element={<About/>}/>
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-2xl p-4 text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p>Page Not Found!</p>
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">The page you are looking for does not exist.</p>
                </div>
              }/>
            </Routes>
          </main>
        </TripProvider>
      </ColorThemeProvider>
    </React.Fragment>
  );
}

export default App;
