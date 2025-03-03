import { useState } from 'react';
import { SideNav } from '../components/SideNav';
import '../styles/Dashboard.css';
import { BiChevronDown, BiChevronUp, BiFilterAlt } from 'react-icons/bi';
import { BsTicketFill, BsTicket } from "react-icons/bs";
import { useAuth0 } from '@auth0/auth0-react';


export const Dashboard = () => {
  const { user, isLoading } = useAuth0();

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('Group Name');

  if (isLoading) return <div>Loading Dashboard...</div>;

  const movieData = [
    {
      id: 1,
      title: "Oppenheimer",
      poster: "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"
    },
    {
      id: 2,
      title: "Interstellar",
      poster: "https://image.tmdb.org/t/p/w200/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
    },
    {
      id: 3,
      title: "Arrival",
      poster: "https://image.tmdb.org/t/p/w200/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg"
    },
    {
      id: 4,
      title: "Midsommar",
      poster: "https://image.tmdb.org/t/p/w200/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg"
    }
  ];

  const dummyMovies = Array(12).fill(null).map((_, i) => movieData[i % 4]);

  const dummyHappenings = [
    { user: 'John', movie: 'Oppenheimer', rating: 4.5, tickets: 5 },
    { user: 'Sarah', movie: 'Interstellar', rating: 5, tickets: 5 },
    { user: 'Mike', movie: 'Arrival', rating: 4.5, tickets: 5 },
    { user: 'Emma', movie: 'Midsommar', rating: 5, tickets: 5 },
    { user: 'Alex', movie: 'Arrival', rating: 5, tickets: 5 },
    { user: 'Rachel', movie: 'Interstellar', rating: 4.5, tickets: 5 }
  ];

  return (
    <div className="dashboard-container">
      <SideNav 
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome Back, {user?.name || "User"}!</h1>
          {/*<div className="user-avatar">F</div>*/}
          <div className="user-avatar">{user?.name ? user.name.charAt(0) : "U"}</div>
        </header>

        <div className="dashboard-content">
          <div className="content-section showtime">
            <h2>Showtimes</h2>
            <div className="showtime-card">
              <div className="nav-arrows">
                <BiChevronUp className="nav-arrow" />
                <BiChevronDown className="nav-arrow" />
              </div>
              <h3>Feb 16th</h3>
              <div className="time">8:00 PM</div>
              <div className="group-name">{selectedGroup}</div>
            </div>
          </div>

          <div className="content-section groups">
            <h2>Group(s)</h2>
            <div className="group-card">
              <div className="nav-arrows">
                <BiChevronUp className="nav-arrow" />
                <BiChevronDown className="nav-arrow" />
              </div>
              <h3>Group Name</h3>
            </div>
          </div>

          <div className="content-section happenings">
            <h2>Happenings</h2>
            <div className="happenings-content">
              {dummyHappenings.map((event, index) => (
                <div key={index} className="happening-item">
                  <span className="user">{event.user}</span>
                  <span className="action">gave</span>
                  <span className="movie">{event.movie}</span>
                  <span className="action">a</span>
                  <span className="rating-value">{event.rating}</span>
                  <span className="action">out of</span>
                  <span className="rating-max">{event.tickets}</span>
                  <span className="action">tickets</span>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section mini-tierlist">
            <h2>Tier List</h2>
            <div className="mini-tier-container">
              {[
                { tier: 'S', movies: [movieData[2], movieData[3], movieData[0], movieData[1]] },  // Arrival, Midsommar, Oppenheimer, Interstellar
                { tier: 'A', movies: [movieData[0], movieData[1]] },  // Oppenheimer, Interstellar
                { tier: 'B', movies: [movieData[0]] },  // Oppenheimer
              ].map(({ tier, movies }) => (
                <div key={tier} className="mini-tier-row">
                  <div className="mini-tier-label">{tier}</div>
                  <div className="mini-tier-movies">
                    {movies.map((movie, i) => (
                      <img 
                        key={`${tier}-${i}`}
                        src={movie.poster}
                        alt={movie.title}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section watchlist">
            <h2>
              Watchlist
              <BiChevronDown className="section-chevron" />
              <BiFilterAlt className="menu-dots" />
            </h2>
            <div className="watchlist-grid">
              {dummyMovies.map(movie => (
                <div key={movie.id} className="watchlist-item">
                  <img src={movie.poster} alt={movie.title} />
                  <div className="movie-title">{movie.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section reviews">
            <h2>
              Reviews
              <BiChevronDown className="section-chevron" />
              <BiFilterAlt className="menu-dots" />
            </h2>
            <div className="reviews-list">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="review-card">
                  <img 
                    src={movieData[(i-1) % 4].poster}
                    alt={movieData[(i-1) % 4].title} 
                  />
                  <div className="review-content">
                    <h4>{movieData[(i-1) % 4].title}</h4>
                    <div className="rating-tickets flex flex-row gap-1 mb-2">
                      <BsTicketFill /><BsTicketFill /><BsTicketFill /><BsTicketFill />{i === 4 ? <BsTicketFill /> : <BsTicket />}
                    </div>
                    <p>{"A masterpiece of modern cinema. The cinematography and acting..."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 