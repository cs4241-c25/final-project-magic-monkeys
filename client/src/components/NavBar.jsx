import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { BiMoviePlay } from 'react-icons/bi';
import '../styles/NavBar.css';

export const NavBar = ({ currentFont, toggleFont, isDarkTheme, toggleTheme }) => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const handleProtectedClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      loginWithRedirect();
    }
  };

  return (
    <nav className="nav-bar">
      <h1 className="site-title">
        <Link to="/">Movie Mates</Link>
      </h1>

      <div className="nav-items-right">
        <div className="nav-links">
          <Link to="/movies" className="nav-link">
            Movies
          </Link>
          <Link 
            to="/dashboard" 
            className="nav-link"
            onClick={handleProtectedClick}
          >
            Dashboard
          </Link>
          <Link
            to="/groups" 
            className="nav-link"
            onClick={handleProtectedClick}
          >
            Create/Join Group
          </Link>
        </div>
        
        {!isAuthenticated ? (
          <button onClick={() => loginWithRedirect()} className="nav-link">
            Log In
          </button>
        ) : (
          <button onClick={handleLogout} className="nav-link">
            Log Out
          </button>
        )}
      </div>
    </nav>
  );
};
