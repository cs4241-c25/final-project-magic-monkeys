import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home';
import { MovieDemo } from './pages/MovieDemo';
import { Dashboard } from './pages/Dashboard';
import { Tierlist } from './pages/Tierlist';
import { Group } from './pages/Group';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Profile } from './pages/Profile';
import { PublicProfile } from './pages/PublicProfile';
import './App.css';
import React from "react";
import { UserProvider } from './context/UserContext';
import { useAuth0 } from "@auth0/auth0-react";
import {ToastProvider} from "./components/Toast";
import './styles/Toast.css';

const AppContent = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [currentFont, setCurrentFont] = useState('Raleway');
  const location = useLocation();
  const { isAuthenticated } = useAuth0();

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const toggleFont = () => {
    setCurrentFont(current => {
      switch (current) {
        case 'Raleway':
          return 'Poppins';
        case 'Poppins':
          return 'Cabin';
        default:
          return 'Raleway';
      }
    });
  };

  // If the user is logged in, always hide the NavBar
  const hideNavBar = isAuthenticated;

  return (
    <div
      className={`App ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}
      style={{ fontFamily: `${currentFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` }}
    >
      {/* Only show NavBar if user is NOT authenticated */}
      {!hideNavBar && (
        <NavBar
          currentFont={currentFont}
          toggleFont={toggleFont}
          isDarkTheme={isDarkTheme}
          toggleTheme={toggleTheme}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<MovieDemo />} />
        <Route path="/movies/:movieId" element={<MovieDemo />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tierlist"
          element={
            <ProtectedRoute>
              <Tierlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId"
          element={
            <ProtectedRoute>
              <Group />
            </ProtectedRoute>
          }
        />
        <Route path="/user/:username" element={<PublicProfile />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <UserProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
    </UserProvider>
  );
}

export default App;
