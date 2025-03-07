import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BiMoviePlay, BiGroup, BiHome, BiChevronDown, BiChevronRight, BiPlus } from 'react-icons/bi';
import { MdDashboard, MdFormatListBulleted } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
import { BiAward } from "react-icons/bi";
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { JoinGroupModal } from './JoinGroupModal';

import '../styles/SideNav.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const SideNav = ({ isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth0();
  const { dbUser } = useUser();

  const [groupsOpen, setGroupsOpen] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Fetch user groups
  const fetchUserGroups = async () => {
    if (!isAuthenticated || !dbUser) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/users/${dbUser._id}/groups`);
      const groups = response.data;
      setUserGroups(groups.map(group => ({
        id: group._id,
        name: group.name
      })));
    } catch (err) {
      console.error('Error fetching user groups:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, [dbUser, isAuthenticated]);

  // Hide group dropdown when mouse leaves, unless the modal is open
  const handleMouseLeave = () => {
    if (!isGroupModalOpen) {
      setGroupsOpen(false);
    }
  };

  const handleOpenModal = (e) => {
    e.stopPropagation();
    setIsGroupModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsGroupModalOpen(false);
    setGroupsOpen(false);
  };

  const handleGroupCreated = async (newGroup) => {
    await fetchUserGroups();
    handleCloseModal();
  };

  // If user isn't loaded or not authenticated, don't render the side nav yet
  if (!isAuthenticated || !dbUser) {
    return null;
  }

  const currentGroupId = location.pathname.startsWith('/group/')
    ? location.pathname.split('/')[2]
    : null;

  return (
    <aside
      className="sidenav"
      onMouseLeave={handleMouseLeave}
    >
      <Link to="/" state={{ stayOnHome: true }} className="logo">
        <span className="icon"><BiMoviePlay /></span>
        <span className="text">Movie Mates</span>
      </Link>

      <nav className="nav-menu">
        <Link
          to="/dashboard"
          className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <span className="icon"><MdDashboard /></span>
          <span className="text">Dashboard</span>
        </Link>

        <div className={`nav-section ${groupsOpen ? 'open' : ''}`}>
          <div
            className={`nav-item ${location.pathname.startsWith('/group/') ? 'active' : ''}`}
            onClick={() => setGroupsOpen(!groupsOpen)}
          >
            <span className="icon"><BiGroup /></span>
            <span className="text">Groups</span>
            <BiChevronRight className={`dropdown-arrow ${groupsOpen ? 'open' : ''}`} />
          </div>
          <div className="sub-items">
            {loading ? (
              <div className="nav-subitem loading">Loading groups...</div>
            ) : (
              userGroups.map(group => (
                <Link
                  key={group.id}
                  to={`/group/${group.id}`}
                  className={`nav-subitem ${currentGroupId === group.id ? 'active' : ''}`}
                >
                  {group.name}
                </Link>
              ))
            )}
            <button
              onClick={handleOpenModal}
              className="nav-subitem create-group-button"
            >
              <BiPlus className="icon" />
              <span className="text">Create or Join Group</span>
            </button>
          </div>
        </div>

        <Link
          to="/tierlist"
          className={`nav-item ${location.pathname === '/tierlist' ? 'active' : ''}`}
        >
          <span className="icon"><MdFormatListBulleted /></span>
          <span className="text">Tierlist</span>
        </Link>

        <Link
          to="/movies"
          className={`nav-item ${location.pathname === '/movies' ? 'active' : ''}`}
        >
          <span className="icon"><BiMoviePlay /></span>
          <span className="text">Movies</span>
        </Link>

        <Link
          to={`/user/${dbUser.username}`}
          className={`nav-item ${location.pathname === `/user/${dbUser.username}` ? 'active' : ''}`}
        >
          <span className="icon"><BiAward /></span>
          <span className="text">Profile</span>
        </Link>

        <Link
          to="/profile"
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          <span className="icon"><CgProfile /></span>
          <span className="text">Settings</span>
        </Link>
      </nav>

      <div
        className="sign-out"
        onClick={() => logout({ returnTo: window.location.origin })}
      >
        <span className="icon"><FiLogOut /></span>
        <span className="text">Sign out</span>
      </div>

      <JoinGroupModal
        isOpen={isGroupModalOpen}
        onClose={handleCloseModal}
        onGroupCreated={handleGroupCreated}
      />
    </aside>
  );
};
