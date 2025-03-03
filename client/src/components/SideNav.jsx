import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BiMoviePlay, BiGroup, BiHome, BiChevronDown, BiChevronRight } from 'react-icons/bi';
import { MdDashboard, MdFormatListBulleted } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import '../styles/SideNav.css';

export const SideNav = ({ isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth0();
  const [groupsOpen, setGroupsOpen] = useState(false);

  const [userGroups, setUserGroups] = useState([
    { id: '1', name: 'Movie Buffs' },
    { id: '2', name: 'Sci-Fi Lovers' },
    ]);

  const handleMouseLeave = () => {
    setGroupsOpen(false);
  };


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
        <Link to="/dashboard" className="nav-item active">
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
            {userGroups.map(group => (
                <Link
                    key={group.id}
                    to={`/group/${group.id}`}
                    className={`nav-subitem ${currentGroupId === group.id ? 'active' : ''}`}
                >
                  {group.name}
                </Link>
            ))}

          </div>
        </div>

        <Link
            to="/tierlist"
            className="nav-item"
        >
          <span className="icon"><MdFormatListBulleted /></span>
          <span className="text">Tierlist</span>
        </Link>

        <Link to="/movies" className="nav-item">
          <span className="icon"><BiMoviePlay /></span>
          <span className="text">Movies</span>
        </Link>

        <div className="nav-item">
          <span className="icon"><CgProfile /></span>
          <span className="text">Profile</span>
        </div>

      </nav>

      <div className="sign-out" onClick={() => logout({returnTo: window.location.origin})}>
        <span className="icon"><FiLogOut/></span>
        <span className="text">Sign out</span>
      </div>
    </aside>
  );
}; 