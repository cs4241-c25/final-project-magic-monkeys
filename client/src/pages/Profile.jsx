import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { SideNav } from "../components/SideNav";
import "../styles/Profile.css";

export const Profile = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { dbUser, isAuthenticated } = useUser();
  
    // If the user isn't authenticated or dbUser is not loaded
    if (!isAuthenticated || !dbUser) {
      return <div className="profile-loading">Loading...</div>;
    }
  
    // Destructure the fields you need
    const { username, email } = dbUser;
    const firstLetter = username ? username.charAt(0).toUpperCase() : "?";
  
    return (
      <div className="profile-page-container">
        {/* Side Navigation */}
        <div className={`profile-sidenav ${isExpanded ? "expanded" : ""}`}>
          <SideNav isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        </div>
  
        {/* Main Content Area */}
        <div className="profile-main">
          <div className="profile-header">
            {/* Avatar Circle */}
            <div className="profile-avatar">{firstLetter}</div>
          </div>
  
          {/* Profile Info Section */}
          <div className="profile-info">
            <h2>User Info</h2>
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Email:</strong> {email}</p>
          </div>
  
          {/* Settings (Fake / Placeholder) */}
          <div className="profile-settings">
            <h2>Settings</h2>
            <ul>
              <li>Notification Preferences</li>
              <li>Privacy Settings</li>
              <li>Subscription Plan</li>
              <li>Other Settings</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
