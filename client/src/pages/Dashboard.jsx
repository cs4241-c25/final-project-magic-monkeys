import { useState, useEffect } from 'react';
import { SideNav } from '../components/SideNav';
import '../styles/Dashboard.css';
import { BiChevronDown, BiChevronUp, BiFilterAlt, BiChevronRight, BiTransfer } from 'react-icons/bi';
import { BsTicketFill, BsTicket } from "react-icons/bs";
import { useAuth0 } from '@auth0/auth0-react';
import { TicketRating } from '../components/TicketRating';
import '../styles/TicketRating.css';
import { useUser } from '../context/UserContext';
import { FaImdb } from 'react-icons/fa';
import { SiRottentomatoes } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL;

export const Dashboard = () => {
  const { isLoading } = useAuth0();
  const { dbUser, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('');
  const [movieRatings, setMovieRatings] = useState({
    1: 4,
    2: 5,
    3: 4,
    4: 5
  });
  const [activeView, setActiveView] = useState('watchlist');
  const [watchlist, setWatchlist] = useState([]);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [userMovieNights, setUserMovieNights] = useState([]);
  const [currentMovieNightIndex, setCurrentMovieNightIndex] = useState(0);
  const [isMovieNightAnimating, setIsMovieNightAnimating] = useState(false);
  const [movieNightAnimationDirection, setMovieNightAnimationDirection] = useState('');
  const [tierListData, setTierListData] = useState({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: []
  });
  const [isTierListLoading, setIsTierListLoading] = useState(false);

  // Fetch user groups
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!dbUser) return;
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/groups`);
        if (response.ok) {
          const data = await response.json();
          setUserGroups(data);
        } else {
          console.error('Failed to fetch user groups');
        }
      } catch (error) {
        console.error('Error fetching user groups:', error);
      }
    };
    
    fetchUserGroups();
  }, [dbUser]);

  // Fetch user's watchlist
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!dbUser) return;
      
      setIsWatchlistLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/watch-lists`);
        if (response.ok) {
          const watchlistItems = await response.json();
          
          // For each watchlist item, fetch the movie details from TMDB
          const movieDetailsPromises = watchlistItems.map(async (item) => {
            const movieRes = await fetch(
              `https://api.themoviedb.org/3/movie/${item.movieId}?api_key=e7b225b138e7b083d203ad7bc2819fec&append_to_response=external_ids,release_dates`
            );
            if (movieRes.ok) {
              const movieData = await movieRes.json();
              
              // Get US certification if available
              let certification = "";
              if (movieData.release_dates && movieData.release_dates.results) {
                const usRelease = movieData.release_dates.results.find(r => r.iso_3166_1 === "US");
                if (usRelease && usRelease.release_dates.length > 0) {
                  certification = usRelease.release_dates[0].certification || "";
                }
              }
              
              return {
                ...item,
                title: movieData.title,
                poster_path: movieData.poster_path,
                overview: movieData.overview,
                vote_average: movieData.vote_average,
                imdb_id: movieData.external_ids?.imdb_id || "",
                release_date: movieData.release_date,
                certification: certification
              };
            }
            return item;
          });
          
          const watchlistWithDetails = await Promise.all(movieDetailsPromises);
          setWatchlist(watchlistWithDetails);
        } else {
          console.error('Failed to fetch watchlist');
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setIsWatchlistLoading(false);
      }
    };
    
    fetchWatchlist();
  }, [dbUser]);

  // Fetch user's movie nights
  useEffect(() => {
    const fetchUserMovieNights = async () => {
      if (!dbUser) return;
      
      try {
        console.log("Fetching movie night schedules for user:", dbUser._id);
        const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/movie-night-schedules`);
        
        console.log("Movie night schedules response status:", response.status);
        
        if (response.ok) {
          const schedules = await response.json();
          console.log("Movie night schedules fetched:", schedules);
          
          if (schedules.length === 0) {
            console.log("No movie night schedules found for this user");
            setUserMovieNights([]);
            return;
          }
          
          // Sort from soonest to latest
          schedules.sort((a, b) => {
            // Convert dates to EST for comparison
            const getESTDate = (schedule) => {
              if (schedule.recurring) {
                return new Date(schedule.startDate);
              } else {
                return new Date(schedule.dateTime);
              }
            };
            
            // Sort from soonest to latest
            return getESTDate(a) - getESTDate(b);
          });
          
          // Fetch group details for each schedule
          const schedulesWithDetails = await Promise.all(
            schedules.map(async (schedule) => {
              try {
                // Get group details
                const groupRes = await fetch(`${BACKEND_URL}/api/groups/${schedule.groupId}`);
                if (!groupRes.ok) {
                  console.error(`Failed to fetch group details for group ${schedule.groupId}`);
                  return null;
                }
                const group = await groupRes.json();
                
                // For recurring schedules, calculate the next occurrence
                let displayDate = schedule.dateTime;
                if (schedule.recurring) {
                  // Use startTime for recurring schedules
                  displayDate = schedule.startDate;
                }
                
                return {
                  ...schedule,
                  groupName: group.name,
                  displayDate: displayDate,
                  // We'll add movie details later if needed
                };
              } catch (error) {
                console.error("Error processing movie night schedule:", error);
                return null;
              }
            })
          );
          
          // Filter out any null values from failed fetches
          const validSchedules = schedulesWithDetails.filter(schedule => schedule !== null);
          console.log("Movie night schedules with details:", validSchedules);
          
          setUserMovieNights(validSchedules);
        } else {
          console.error('Failed to fetch movie night schedules:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching movie night schedules:', error);
      }
    };
    
    fetchUserMovieNights();
  }, [dbUser]);

  // Add this temporary test function
  const testRoutes = async () => {
    try {
      // Test movie night routes
      const movieNightTest = await fetch(`${BACKEND_URL}/api/test-movie-night-route`);
      console.log("Movie night test route:", movieNightTest.status, await movieNightTest.text());
      
      // Test another working route for comparison
      const watchlistTest = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/watch-lists`);
      console.log("Watchlist route:", watchlistTest.status);
    } catch (error) {
      console.error("Route test error:", error);
    }
  };

  // Call this in useEffect
  useEffect(() => {
    if (dbUser) {
      testRoutes();
    }
  }, [dbUser]);

  const handleNextGroup = () => {
    if (userGroups.length <= 1) return;
    
    setAnimationDirection('next');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentGroupIndex((prevIndex) => 
        prevIndex === userGroups.length - 1 ? 0 : prevIndex + 1
      );
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 300);
  };

  const handlePrevGroup = () => {
    if (userGroups.length <= 1) return;
    
    setAnimationDirection('prev');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentGroupIndex((prevIndex) => 
        prevIndex === 0 ? userGroups.length - 1 : prevIndex - 1
      );
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 300);
  };

  const handleRatingChange = (movieId, newRating) => {
    setMovieRatings(prevRatings => ({
      ...prevRatings,
      [movieId]: newRating
    }));

    console.log(`Movie ${movieId} rating updated to ${newRating}`);
  };

  const toggleView = () => {
    setActiveView(prevView => prevView === 'watchlist' ? 'reviews' : 'watchlist');
  };

  const handleGroupCardClick = () => {
    if (userGroups.length > 0) {
      const currentGroup = userGroups[currentGroupIndex];
      navigate(`/group/${currentGroup._id}`);
    }
  };

  // Handle navigation between movie nights
  const handleNextMovieNight = (e) => {
    if (e) e.stopPropagation();
    if (userMovieNights.length <= 1) return;
    
    setMovieNightAnimationDirection('next');
    setIsMovieNightAnimating(true);
    
    setTimeout(() => {
      setCurrentMovieNightIndex((prevIndex) => 
        prevIndex === userMovieNights.length - 1 ? 0 : prevIndex + 1
      );
      
      setTimeout(() => {
        setIsMovieNightAnimating(false);
      }, 300);
    }, 300);
  };

  const handlePrevMovieNight = (e) => {
    if (e) e.stopPropagation();
    if (userMovieNights.length <= 1) return;
    
    setMovieNightAnimationDirection('prev');
    setIsMovieNightAnimating(true);
    
    setTimeout(() => {
      setCurrentMovieNightIndex((prevIndex) => 
        prevIndex === 0 ? userMovieNights.length - 1 : prevIndex - 1
      );
      
      setTimeout(() => {
        setIsMovieNightAnimating(false);
      }, 300);
    }, 300);
  };

  const handleMovieNightClick = () => {
    if (userMovieNights.length > 0) {
      const currentMovieNight = userMovieNights[currentMovieNightIndex];
      if (currentMovieNight && currentMovieNight.groupId) {
        console.log("Navigating to group:", currentMovieNight.groupId);
        navigate(`/group/${currentMovieNight.groupId}`);
      } else {
        console.error("Invalid movie night data:", currentMovieNight);
      }
    }
  };

  // Format date for display in EST
  const formatMovieNightDate = (dateString) => {
    if (!dateString) return "TBD";
    
    // Create date in EST
    const options = { 
      timeZone: 'America/New_York',
      month: 'short', 
      day: 'numeric'
    };
    
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time for display in EST
  const formatMovieNightTime = (schedule) => {
    if (schedule.recurring) {
      // For recurring schedules, parse and format the startTime
      if (schedule.startTime) {
        // Check if startTime is a full ISO date string
        if (schedule.startTime.includes('T')) {
          const timeDate = new Date(schedule.startTime);
          const options = {
            timeZone: 'America/New_York',
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true
          };
          return timeDate.toLocaleTimeString('en-US', options);
        } 
        // If it's just a time string like "19:30"
        else {
          return schedule.startTime;
        }
      }
      return "TBD";
    } else if (schedule.dateTime) {
      // For specific schedules, convert to EST
      const options = {
        timeZone: 'America/New_York',
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      };
      
      return new Date(schedule.dateTime).toLocaleTimeString('en-US', options);
    }
    return "TBD";
  };

  // Get current movie night details
  const currentMovieNight = userMovieNights.length > 0 
    ? userMovieNights[currentMovieNightIndex] 
    : null;

  // Add this useEffect to fetch the user's tier list
  useEffect(() => {
    const fetchTierList = async () => {
      if (!dbUser) return;
      
      setIsTierListLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/tier-lists`);
        
        if (response.ok) {
          const tierListItems = await response.json();
          
          // For each tier list item, fetch the movie details from TMDB
          const movieDetailsPromises = tierListItems.map(async (item) => {
            try {
              const movieRes = await fetch(
                `https://api.themoviedb.org/3/movie/${item.movieId}?api_key=e7b225b138e7b083d203ad7bc2819fec`
              );
              if (movieRes.ok) {
                const movieData = await movieRes.json();
                return {
                  ...item,
                  title: movieData.title,
                  poster: `https://image.tmdb.org/t/p/w200${movieData.poster_path}`
                };
              }
            } catch (error) {
              console.error(`Error fetching movie ${item.movieId}:`, error);
            }
            return null;
          });
          
          const moviesWithDetails = (await Promise.all(movieDetailsPromises)).filter(m => m !== null);
          
          // Group movies by rank (S, A, B, C, D, F)
          const groupedByRank = {
            S: [],
            A: [],
            B: [],
            C: [],
            D: [],
            F: []
          };
          
          moviesWithDetails.forEach(movie => {
            if (groupedByRank[movie.rank]) {
              groupedByRank[movie.rank].push(movie);
            }
          });
          
          // Sort movies within each rank by their order property
          Object.keys(groupedByRank).forEach(rank => {
            groupedByRank[rank].sort((a, b) => a.order - b.order);
          });
          
          setTierListData(groupedByRank);
        } else {
          // If 404, just leave the empty state
          if (response.status !== 404) {
            console.error('Error fetching tier list');
          }
        }
      } catch (error) {
        console.error('Error fetching tier list:', error);
      } finally {
        setIsTierListLoading(false);
      }
    };
    
    fetchTierList();
  }, [dbUser]);

  // Add a function to handle tier list card click
  const handleTierListClick = () => {
    navigate('/tierlist');
  };

  if (isLoading) return <div>Loading Dashboard...</div>;

  // Get current group name
  const currentGroupName = userGroups.length > 0 
    ? userGroups[currentGroupIndex]?.name || "No Group Name" 
    : "No Groups";

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
          <h1>Welcome Back, {dbUser?.username || "User"}!</h1>
          <div className="user-avatar">{dbUser?.username ? dbUser.username.charAt(0) : "U"}</div>
        </header>

        <div className="dashboard-content">
          <div className="content-section showtime">
            <h2>Showtimes</h2>
            <div 
              className="showtime-card"
              onClick={handleMovieNightClick}
              style={{ cursor: userMovieNights.length > 0 ? 'pointer' : 'default' }}
            >
              <div className="nav-arrows">
                <BiChevronUp 
                  className={`nav-arrow ${userMovieNights.length <= 1 ? 'disabled' : ''}`} 
                  onClick={handlePrevMovieNight}
                />
                <BiChevronDown 
                  className={`nav-arrow ${userMovieNights.length <= 1 ? 'disabled' : ''}`} 
                  onClick={handleNextMovieNight}
                />
              </div>
              <div className="showtime-card-content">
                <div 
                  className={`showtime-content ${isMovieNightAnimating ? `slide-${movieNightAnimationDirection}` : ''}`}
                >
                  {currentMovieNight ? (
                    <>
                      <h3>{formatMovieNightDate(currentMovieNight.displayDate)}</h3>
                      <div className="time">{formatMovieNightTime(currentMovieNight)}</div>
                      <div className="group-name">{currentMovieNight.groupName}</div>
                    </>
                  ) : (
                    <h3>No Upcoming Showtimes</h3>
                  )}
                </div>
                {userMovieNights.length > 0 && (
                  <div className="showtime-pagination">
                    {currentMovieNightIndex + 1} / {userMovieNights.length}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="content-section groups">
            <h2>Group(s)</h2>
            <div 
              className="group-card"
              onClick={handleGroupCardClick}
              style={{ cursor: userGroups.length > 0 ? 'pointer' : 'default' }}
            >
              <div className="nav-arrows">
                <BiChevronUp 
                  className={`nav-arrow ${userGroups.length <= 1 ? 'disabled' : ''}`} 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the card click
                    handlePrevGroup();
                  }}
                />
                <BiChevronDown 
                  className={`nav-arrow ${userGroups.length <= 1 ? 'disabled' : ''}`} 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the card click
                    handleNextGroup();
                  }}
                />
              </div>
              <div className="group-card-content">
                <div 
                  className={`group-name-container ${isAnimating ? `slide-${animationDirection}` : ''}`}
                >
                  {userGroups.length > 0 ? (
                    <h3>{currentGroupName}</h3>
                  ) : (
                    <h3>No Groups</h3>
                  )}
                </div>
                {userGroups.length > 0 && (
                  <div className="group-pagination">
                    {currentGroupIndex + 1} / {userGroups.length}
                  </div>
                )}
              </div>
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

          <div 
            className="content-section mini-tierlist"
            onClick={handleTierListClick}
            style={{ cursor: 'pointer' }}
          >
            <h2>Tier List</h2>
            {isTierListLoading ? (
              <div className="loading-state">Loading tier list...</div>
            ) : (
              <div className="mini-tier-container">
                {Object.entries(tierListData)
                  .filter(([tier, movies]) => movies.length > 0) // Only show tiers with movies
                  .slice(0, 3) // Show at most 3 tiers to fit in the card
                  .map(([tier, movies]) => (
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
                {Object.values(tierListData).every(movies => movies.length === 0) && !isTierListLoading && (
                  <div className="empty-state">
                    <p>Click to create your tier list!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="content-section combined-card">
            <h2>
              {activeView === 'watchlist' ? 'Watchlist' : 'Reviews'}
              <BiTransfer 
                className="view-toggle-icon" 
                onClick={toggleView}
              />
              <BiFilterAlt className="menu-dots" />
            </h2>
            
            {activeView === 'watchlist' ? (
              <div className="reviews-list">
                {isWatchlistLoading ? (
                  <div className="loading-state">Loading watchlist...</div>
                ) : watchlist.length > 0 ? (
                  watchlist.map(movie => (
                    <div key={movie._id} className="review-card">
                      <img 
                        src={movie.poster_path 
                          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` 
                          : '/placeholder-poster.jpg'
                        } 
                        alt={movie.title || 'Movie poster'} 
                      />
                      <div className="review-content">
                        <div className="movie-info">
                          <h4>{movie.title || `Movie ID: ${movie.movieId}`}</h4>
                          <div className="movie-year">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                          </div>
                        </div>
                        
                        <p className="movie-overview">
                          {movie.overview || 'No description available.'}
                        </p>

                        <div className="external-ratings">
                          {movie.imdb_id && (
                            <div className="rating-item">
                              <FaImdb className="rating-icon imdb" />
                              <span className="rating-value">
                                {movie.vote_average ? (movie.vote_average/2).toFixed(1) : 'N/A'}/5
                              </span>
                            </div>
                          )}
                          {movie.certification && (
                            <div className="rating-item">
                              <SiRottentomatoes className="rating-icon tomato" />
                              <span className="rating-value">{movie.certification}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>Your watchlist is empty. Add movies from the search page!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="reviews-list">
                {movieData.map((movie, i) => (
                  <div key={movie.id} className="review-card">
                    <img src={movie.poster} alt={movie.title} />
                    <div className="review-content">
                      <div className="movie-info">
                        <h4>{movie.title}</h4>
                        <span className="movie-year">(2018)</span>
                      </div>
                      
                      <div className="review-date">2/22/25</div>
                      
                      <div className="ticket-rating-container">
                        <TicketRating
                          rating={5}
                          interactive={false}
                          size="sm"
                          color="#ff4b4b"
                        />
                      </div>
                      
                      <p className="movie-overview">
                        That is my only way of explaining why this film is so highly regarded. I went to the user review area of IMDB just to see if I was missing something or if others thought this good looking, atmospheric, well acted two hour slog sucked as well. To my relief I found I was not alone...
                      </p>
                      
                      <a href="#" className="review-link">Click to see full review</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}; 