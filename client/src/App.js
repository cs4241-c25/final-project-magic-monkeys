import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home';
import { MovieDemo } from './pages/MovieDemo';
import { Dashboard } from './pages/Dashboard';
<<<<<<< Updated upstream
import { Tierlist } from './pages/Tierlist';
=======
>>>>>>> Stashed changes
import { Group } from './pages/Group';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';
import React from "react";
// import { useAuth0 } from "@auth0/auth0-react";
import "./App.css";

const AppContent = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [currentFont, setCurrentFont] = useState('Raleway');
  const location = useLocation();

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const toggleFont = () => {
    setCurrentFont(current => {
      switch(current) {
        case 'Raleway':
          return 'Poppins';
        case 'Poppins':
          return 'Cabin';
        default:
          return 'Raleway';
      }
    });
  };

  const hideNavBar = ['/dashboard', '/group', '/groups'].some(path =>
      location.pathname.startsWith(path)
  );

  return (
    <div
      className={`App ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}
      style={{ fontFamily: `${currentFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` }}
    >
<<<<<<< Updated upstream
      {location.pathname !== '/dashboard' & location.pathname !== '/tierlist' && (
        <NavBar
          currentFont={currentFont}
          toggleFont={toggleFont}
          isDarkTheme={isDarkTheme}
          toggleTheme={toggleTheme}
        />)}
=======
>>>>>>> Stashed changes
      {/*{location.pathname !== '/dashboard' && (*/}
      {/*  <NavBar*/}
      {/*    currentFont={currentFont}*/}
      {/*    toggleFont={toggleFont}*/}
      {/*    isDarkTheme={isDarkTheme}*/}
      {/*    toggleTheme={toggleTheme}*/}
      {/*  />*/}
      {/*)}*/}
<<<<<<< Updated upstream
      {/*{!hideNavBar && (*/}
      {/*    <NavBar*/}
      {/*        currentFont={currentFont}*/}
      {/*        toggleFont={toggleFont}*/}
      {/*        isDarkTheme={isDarkTheme}*/}
      {/*        toggleTheme={toggleTheme}*/}
      {/*    />*/}
      {/*)}*/}
=======
      {!hideNavBar && (
          <NavBar
              currentFont={currentFont}
              toggleFont={toggleFont}
              isDarkTheme={isDarkTheme}
              toggleTheme={toggleTheme}
          />
      )}
>>>>>>> Stashed changes
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<MovieDemo />} />
        <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
        />
        <Route
<<<<<<< Updated upstream
            path="/tierlist"
            element={
              <ProtectedRoute>
                <Tierlist />
=======
            path="/group/:groupId"
            element={
              <ProtectedRoute>
                <Group />
>>>>>>> Stashed changes
              </ProtectedRoute>
            }
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );

}

export default App;
