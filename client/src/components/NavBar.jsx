import { Link } from 'react-router-dom';

export const NavBar = ({ currentFont, toggleFont, isDarkTheme, toggleTheme }) => {
  return (
    <nav className="nav-bar">
      <button 
        onClick={toggleFont} 
        className="font-toggle"
        style={{ fontFamily: currentFont }}
      >
        {currentFont}
      </button>
      <Link to="/" className="site-title-link">
        <h1 className="site-title">Movie Mates</h1>
      </Link>
      <button onClick={toggleTheme} className="theme-toggle">
        {isDarkTheme ? '🌙' : '☀️'}
      </button>
    </nav>
  );
}; 