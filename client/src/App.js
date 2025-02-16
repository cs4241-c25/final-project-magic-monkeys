import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home';
import { MovieDemo } from './pages/MovieDemo';
import './App.css';

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [currentFont, setCurrentFont] = useState('Raleway');

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

  return (
    <Router>
      <div 
        className={`App ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}
        style={{ fontFamily: `${currentFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` }}
      >
        <NavBar 
          currentFont={currentFont}
          toggleFont={toggleFont}
          isDarkTheme={isDarkTheme}
          toggleTheme={toggleTheme}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<MovieDemo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
