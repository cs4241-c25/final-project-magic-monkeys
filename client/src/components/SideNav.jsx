import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BiMoviePlay, BiGroup, BiHome, BiChevronDown, BiChevronRight, BiPlus } from 'react-icons/bi';
import { MdDashboard, MdFormatListBulleted } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import {JoinGroupModal} from './JoinGroupModal';

import '../styles/SideNav.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const mockGroups = [
  { id: '1', name: 'Movie Buffs' },
  { id: '2', name: 'Sci-Fi Lovers' }
];

export const SideNav = ({ isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAuthenticated  } = useAuth0();
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/${user.sub}/groups`);
        const groups = response.data;

        setUserGroups(groups.map(group => ({
          id: group._id,
          name: group.name
        })));
      } catch (err) {
        console.error('Error fetching user groups:', err);
        setError(err);
        setUserGroups(mockGroups);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, [user, isAuthenticated]);

  const handleMouseLeave = () => {
    if (!isGroupModalOpen) {
      setGroupsOpen(false);
    }
  };

  const handleOpenModal = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling to parent elements
    setIsGroupModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsGroupModalOpen(false);
    setGroupsOpen(false);
  };

  const handleGroupCreated = (newGroup) => {
    setUserGroups(prevGroups => [...prevGroups, newGroup]);
    handleCloseModal();
  };

  const currentGroupId = location.pathname.startsWith('/group/')
      ? location.pathname.split('/')[2]
      : null;

  // const [isModalOpen, setIsModalOpen] = useState(false);

  // const openModal = () => setIsModalOpen(true);
  // const closeModal = () => setIsModalOpen(false);

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
        <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <span className="icon"><MdDashboard /></span>
          <span className="text">Dashboard</span>
        </Link>


        <div className={`nav-section ${groupsOpen ? 'open' : ''}`}>
          <div
              className={`nav-item ${location.pathname.startsWith('/group/') ? 'active' : ''}`}
              onClick={() => setGroupsOpen(!groupsOpen)}
          >
            <span className="icon"><BiGroup/></span>
            <span className="text">Groups</span>
            <BiChevronRight className={`dropdown-arrow ${groupsOpen ? 'open' : ''}`}/>
          </div>
          <div className="sub-items">
            {loading ? (
                <div className="nav-subitem loading">Loading groups...</div>
            ) : userGroups.length === 0 ? (
                <div className="nav-subitem empty">No groups found</div>
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
              <BiPlus className="icon"/>
              <span className="text">Create or Join Group</span>
            </button>

          </div>
        </div>

        <Link
            to="/tierlist"
            className={`nav-item ${location.pathname === '/tierlist' ? 'active' : ''}`}
        >
          <span className="icon"><MdFormatListBulleted/></span>
          <span className="text">Tierlist</span>
        </Link>

        <Link to="/movies" className={`nav-item ${location.pathname === '/movies' ? 'active' : ''}`}>
          <span className="icon"><BiMoviePlay /></span>
          <span className="text">Movies</span>
        </Link>

        <Link to="/profile" className="nav-item">
          <span className="icon"><CgProfile /></span>
          <span className="text">Profile</span>
        </Link>

      </nav>

      <div className="sign-out" onClick={() => logout({returnTo: window.location.origin})}>
        <span className="icon"><FiLogOut/></span>
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