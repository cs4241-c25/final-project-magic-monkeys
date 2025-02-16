import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
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
    <ThemeContext.Provider value={{ 
      isDarkTheme, 
      currentFont, 
      toggleTheme, 
      toggleFont 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 