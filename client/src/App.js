import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./App.css";

function App() {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

    const handleLogout = () => {
        console.log("Logging out...");
        logout({ logoutParams: { returnTo: window.location.origin } });
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to MovieMates</h1>

                {!isAuthenticated ? (
                    <button onClick={() => loginWithRedirect()}>Log In</button>
                ) : (
                    <>
                        <p>Welcome, {user?.name}!</p>
                        <button onClick={handleLogout}>Log Out</button>
                    </>
                )}
            </header>
        </div>
    );
}

export default App;
