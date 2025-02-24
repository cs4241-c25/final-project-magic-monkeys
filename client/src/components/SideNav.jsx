import { Link, useNavigate } from 'react-router-dom';
import { BiMoviePlay, BiGroup, BiHome, BiChevronDown, BiChevronRight } from 'react-icons/bi';
import { MdDashboard, MdFormatListBulleted } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import '../styles/SideNav.css';

export const SideNav = ({ isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();
  const { logout } = useAuth0();
  const [groupsOpen, setGroupsOpen] = useState(false);

  const handleMouseLeave = () => {
    setGroupsOpen(false);
  };

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
          <div className="nav-item" onClick={() => setGroupsOpen(!groupsOpen)}>
            <span className="icon"><BiGroup /></span>
            <span className="text">Groups</span>
            <BiChevronRight className={`dropdown-arrow ${groupsOpen ? 'open' : ''}`} />
          </div>
          <div className="sub-items">
            <div className="nav-subitem">Group 1</div>
            <div className="nav-subitem">Group 2</div>
            <div className="nav-subitem">Group 3</div>
          </div>
        </div>

        <Link to="/movies" className="nav-item">
          <span className="icon"><BiMoviePlay /></span>
          <span className="text">Movies</span>
        </Link>

        <div className="nav-item">
          <span className="icon"><MdFormatListBulleted /></span>
          <span className="text">Tierlist</span>
        </div>

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