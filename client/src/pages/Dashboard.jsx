import { useState, useEffect, useRef } from 'react';
import { SideNav } from '../components/SideNav';
import '../styles/Dashboard.css';
import { BiChevronDown, BiChevronUp, BiFilterAlt, BiChevronRight, BiTransfer, BiMenu } from 'react-icons/bi';
import { BsTicketFill, BsTicket } from "react-icons/bs";
import { useAuth0 } from '@auth0/auth0-react';
import { TicketRating } from '../components/TicketRating';
import '../styles/TicketRating.css';
import { useUser } from '../context/UserContext';
import { FaImdb } from 'react-icons/fa';
import { SiRottentomatoes } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';
// Import the new card components
import { ShowtimeCard } from '../components/ShowtimeCard';
import { GroupCard } from '../components/GroupCard';
import { HappeningsCard } from '../components/HappeningsCard';
import { TierListCard } from '../components/TierListCard';
import { WatchlistReviewsCard } from '../components/WatchlistReviewsCard';
import { FiEdit } from 'react-icons/fi';

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
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [userMovieNights, setUserMovieNights] = useState([]);
  const [isMovieNightsLoading, setIsMovieNightsLoading] = useState(false);
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
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [isHappeningsLoading, setIsHappeningsLoading] = useState(false);
  const [happenings, setHappenings] = useState([]);

  // Fetch user groups
  useEffect(() => {
    if (!dbUser) return;

    const fetchUserGroups = async () => {
      try {
        setIsGroupsLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/groups`);
        if (response.ok) {
          const data = await response.json();
          setUserGroups(data);
        } else {
          console.error('Failed to fetch user groups');
        }
      } catch (error) {
        console.error('Error fetching user groups:', error);
      } finally {
        setIsGroupsLoading(false);
      }
    };
    
    fetchUserGroups();
  }, [dbUser]);

  // Fetch user's watchlist
  useEffect(() => {
    if (!dbUser) return;
    
    const fetchWatchlist = async () => {
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
    if (!dbUser) return;

    const fetchUserMovieNights = async () => {
      try {
        setIsMovieNightsLoading(true);
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
      } finally {
        setIsMovieNightsLoading(false);
      }
    };
    
    fetchUserMovieNights();
  }, [dbUser]);

  // Fetch user happenings
  useEffect(() => {
    if (!dbUser) return;
    
    const fetchHappenings = async () => {
      setIsHappeningsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/67c8c90e4255e8e3812db203/user-happenings`);
        if (response.ok) {
          const happeningsData = await response.json();
          
          // Just use the happening string directly
          const formattedHappenings = happeningsData.map(item => ({
            happening: item.happening
          }));
          
          setHappenings(formattedHappenings);
        } else {
          console.error('Failed to fetch happenings:', await response.text());
          setHappenings([]);
        }
      } catch (error) {
        console.error('Error fetching happenings:', error);
        setHappenings([]);
      } finally {
        setIsHappeningsLoading(false);
      }
    };

    fetchHappenings();
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
    
    setAnimationDirection('down');
    setCurrentGroupIndex((prevIndex) => 
      prevIndex === userGroups.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevGroup = () => {
    if (userGroups.length <= 1) return;
    
    setAnimationDirection('up');
    setCurrentGroupIndex((prevIndex) => 
      prevIndex === 0 ? userGroups.length - 1 : prevIndex - 1
    );
  };

  const handleRatingChange = (movieId, newRating) => {
    setMovieRatings(prevRatings => ({
      ...prevRatings,
      [movieId]: newRating
    }));

    console.log(`Movie ${movieId} rating updated to ${newRating}`);
  };

  const toggleView = () => {
    setActiveView(prev => prev === 'watchlist' ? 'reviews' : 'watchlist');
  };

  const handleFilterClick = (e) => {
    // Toggle the filter menu
    setShowFilterMenu(prevState => !prevState);
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
    
    setMovieNightAnimationDirection('down');
    setCurrentMovieNightIndex((prevIndex) => 
      prevIndex === userMovieNights.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevMovieNight = (e) => {
    if (e) e.stopPropagation();
    if (userMovieNights.length <= 1) return;
    
    setMovieNightAnimationDirection('up');
    setCurrentMovieNightIndex((prevIndex) => 
      prevIndex === 0 ? userMovieNights.length - 1 : prevIndex - 1
    );
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
    
    try {
      // Create date object
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return dateString; // Return the original string if it's not a valid date
      }
      
      // Get the day number
      const day = date.getDate();
      
      // Determine the ordinal suffix
      let suffix = "th";
      if (day % 10 === 1 && day !== 11) {
        suffix = "st";
      } else if (day % 10 === 2 && day !== 12) {
        suffix = "nd";
      } else if (day % 10 === 3 && day !== 13) {
        suffix = "rd";
      }
      
      // Format the month
      const options = { 
        timeZone: 'America/New_York',
        month: 'short'
      };
      
      const month = date.toLocaleDateString('en-US', options);
      
      // Return formatted date with ordinal suffix
      return `${month} ${day}${suffix}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || "TBD";
    }
  };

  // Format time for display in EST
  const formatMovieNightTime = (schedule) => {
    if (!schedule) return "No time available";
    
    try {
      // If schedule is a string, it might be a time string or a full date string
      if (typeof schedule === 'string') {
        return schedule;
      }
      
      // If schedule has a displayTime property, use that
      if (schedule.displayTime) {
        return schedule.displayTime;
      }
      
      // If schedule has a time property, use that
      if (schedule.time) {
        return schedule.time;
      }
      
      // If schedule is an object with recurring property
      if (schedule.recurring) {
        // For recurring schedules, parse and format the startTime
        if (schedule.startTime) {
          // Check if startTime is a full ISO date string
          if (typeof schedule.startTime === 'string' && schedule.startTime.includes('T')) {
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
      }
      
      // If schedule has a startTime property
      if (schedule.startTime) {
        return schedule.startTime;
      }
      
      // If schedule has a dateTime property
      if (schedule.dateTime) {
        const options = {
          timeZone: 'America/New_York',
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true
        };
        
        return new Date(schedule.dateTime).toLocaleTimeString('en-US', options);
      }
      
      // If we have a date property, try to extract time from it
      if (schedule.date) {
        const dateObj = new Date(schedule.date);
        if (!isNaN(dateObj.getTime())) {
          const options = {
            timeZone: 'America/New_York',
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true
          };
          return dateObj.toLocaleTimeString('en-US', options);
        }
      }
      
      return "Time unavailable";
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Time unavailable";
    }
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
    ,
    {
      id: 5,
      title: "Arrival",
      poster: "https://image.tmdb.org/t/p/w200/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg"
    },
    {
      id: 6,
      title: "Midsommar",
      poster: "https://image.tmdb.org/t/p/w200/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg"
    }
  ];

  const dummyMovies = Array(12).fill(null).map((_, i) => movieData[i % 4]);

  return (
    <div className="dashboard-container">
      <SideNav 
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 className="text-2xl font-['Cabin'] font-semibold">Welcome Back, {dbUser?.username || "User"}!</h1>
          <div className="user-avatar">{dbUser?.username ? dbUser.username.charAt(0) : "U"}</div>
        </header>

        <div className="dashboard-content">
          {/* Showtime Card - col 1, row 1 */}
          <ShowtimeCard
            userMovieNights={userMovieNights}
            currentMovieNight={currentMovieNight}
            currentMovieNightIndex={currentMovieNightIndex}
            isMovieNightAnimating={isMovieNightAnimating}
            movieNightAnimationDirection={movieNightAnimationDirection}
            handlePrevMovieNight={handlePrevMovieNight}
            handleNextMovieNight={handleNextMovieNight}
            handleMovieNightClick={handleMovieNightClick}
            formatMovieNightDate={formatMovieNightDate}
            formatMovieNightTime={formatMovieNightTime}
            isLoading={isMovieNightsLoading}
          />

          {/* Group Card - col 2, row 1 */}
          <GroupCard
            userGroups={userGroups}
            currentGroupName={currentGroupName}
            currentGroupIndex={currentGroupIndex}
            isAnimating={isAnimating}
            animationDirection={animationDirection}
            handlePrevGroup={handlePrevGroup}
            handleNextGroup={handleNextGroup}
            handleGroupCardClick={handleGroupCardClick}
            isLoading={isGroupsLoading}
          />

          {/* Happenings Card - col 3-4, row 1 */}
          <HappeningsCard 
            happenings={happenings} 
            isLoading={isHappeningsLoading}
          />

          {/* Watchlist/Reviews Card - col 3-4, row 2-3 */}
          <WatchlistReviewsCard
            activeView={activeView}
            toggleView={toggleView}
            watchlist={watchlist}
            isWatchlistLoading={isWatchlistLoading}
            setIsWatchlistLoading={setIsWatchlistLoading}
            showFilterMenu={showFilterMenu}
            setShowFilterMenu={setShowFilterMenu}
          />

          {/* Tier List Card - col 1-2, row 2-3 */}
                    <TierListCard
            tierListData={tierListData}
            isTierListLoading={isTierListLoading}
          />
        </div>
      </main>
    </div>
  );
}; 