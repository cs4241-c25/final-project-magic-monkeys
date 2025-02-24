import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";



export const NavBar = ({ currentFont, toggleFont, isDarkTheme, toggleTheme }) => {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
    const handleLogout = () => {
        console.log("Logging out...");
        logout({ logoutParams: { returnTo: window.location.origin } });
    };

    return (
    <nav className="nav-bar">
      <button 
        onClick={toggleFont} 
        className="font-toggle"
        style={{ fontFamily: currentFont }}
      >
        {currentFont}
      </button>
        {/*<Link to={isAuthenticated ? "/dashboard" : "/"} className="site-title-link">*/}
            <h1 className="site-title">Movie Mates</h1>
        {/*</Link>*/}
        {/*{!isAuthenticated ? (*/}
        {/*    <button onClick={() => loginWithRedirect()}>Log In</button>*/}
        {/*) : (*/}
        {/*    <>*/}
        {/*        <p>Welcome, {user?.name}!</p>*/}
        {/*        <button onClick={handleLogout}>Log Out</button>*/}
        {/*    </>*/}
        {/*)}*/}
        <button onClick={toggleTheme} className="theme-toggle">
        {isDarkTheme ? '🌙' : '☀️'}
      </button>
    </nav>
  );
}; 