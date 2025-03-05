import { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth0();
    const [dbUser, setDbUser ] = useState(null);

    useEffect(() => {
        if(user){
            fetch(`${process.env.REACT_APP_API_URL}/api/users/auth0/${user.sub}`)
                .then(res => res.json())
                .then(data => setDbUser(data))
                .catch(err => console.error("Error fetching user:", err));
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ dbUser, isAuthenticated }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);