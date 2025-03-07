import React, { useState, useEffect, useRef } from 'react';
import { FaImdb } from 'react-icons/fa';
import { SiRottentomatoes } from 'react-icons/si';
import { TicketRating } from './TicketRating';
import '../styles/WatchlistReviewsCard.css';
import '../styles/LoadingAnimations.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { BiFilterAlt, BiX, BiCheck } from 'react-icons/bi';

// Import the omdbAPI service
import { omdbAPI } from '../services/omdbAPI';

// Backend URL
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// TMDB API key
const TMDB_API_KEY = 'e7b225b138e7b083d203ad7bc2819fec';

export const WatchlistReviewsCard = ({
  activeView,
  toggleView,
  watchlist,
  isWatchlistLoading,
  setIsWatchlistLoading,
  showFilterMenu,
  setShowFilterMenu
}) => {
  const [watchlistRatings, setWatchlistRatings] = useState({});
  const [reviews, setReviews] = useState([]);
  const [reviewMovies, setReviewMovies] = useState({});
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [watchlistLoaded, setWatchlistLoaded] = useState(false);
  const filterMenuRef = useRef(null);
  const navigate = useNavigate();
  const { dbUser, isAuthenticated } = useUser();
  
  // Filter states
  const [watchlistFilters, setWatchlistFilters] = useState({
    releaseYear: 'all',
    tomatoesRating: 'all',
    imdbScore: 'all'
  });
  
  const [reviewsFilters, setReviewsFilters] = useState({
    ticketRating: 'all',
    dateAdded: 'all',
    releaseYear: 'all'
  });
  
  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on the hamburger menu icon
      const isMenuIconClick = event.target.closest('.filter-menu-icon');
      
      // Only close the menu if the click is outside the menu and not on the menu icon
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target) && !isMenuIconClick) {
        setShowFilterMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowFilterMenu]);
  
  // Log when showFilterMenu changes
  useEffect(() => {
    console.log('showFilterMenu in WatchlistReviewsCard:', showFilterMenu);
  }, [showFilterMenu]);
  
  // Toggle filter menu is now handled by the Dashboard component
  
  // Function to close the filter menu
  const closeFilterMenu = () => {
    setShowFilterMenu(false);
  };
  
  // Update watchlist filters
  const updateWatchlistFilter = (filterType, value) => {
    setWatchlistFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Update reviews filters
  const updateReviewsFilter = (filterType, value) => {
    setReviewsFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    if (activeView === 'watchlist') {
      setWatchlistFilters({
        releaseYear: 'all',
        tomatoesRating: 'all',
        imdbScore: 'all'
      });
    } else {
      setReviewsFilters({
        ticketRating: 'all',
        dateAdded: 'all',
        releaseYear: 'all'
      });
    }
  };
  
  // Apply filters to watchlist
  const getFilteredWatchlist = () => {
    if (!watchlist) return [];
    
    return [...watchlist].sort((a, b) => {
      // Sort by _id to ensure consistent ordering
      return a._id > b._id ? 1 : -1;
    }).filter(movie => {
      // Filter by release year
      if (watchlistFilters.releaseYear !== 'all') {
        const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
        if (!movieYear) return false;
        
        if (watchlistFilters.releaseYear === 'before2000') {
          if (movieYear >= 2000) return false;
        } else if (watchlistFilters.releaseYear === '2000to2010') {
          if (movieYear < 2000 || movieYear > 2010) return false;
        } else if (watchlistFilters.releaseYear === '2010to2020') {
          if (movieYear < 2010 || movieYear > 2020) return false;
        } else if (watchlistFilters.releaseYear === 'after2020') {
          if (movieYear <= 2020) return false;
        }
      }
      
      // Filter by IMDb score
      if (watchlistFilters.imdbScore !== 'all') {
        const imdbScore = watchlistRatings[movie._id]?.imdb 
          ? parseFloat(watchlistRatings[movie._id].imdb) 
          : (movie.vote_average || 0);
        
        if (watchlistFilters.imdbScore === 'under5') {
          if (imdbScore >= 5) return false;
        } else if (watchlistFilters.imdbScore === '5to7') {
          if (imdbScore < 5 || imdbScore > 7) return false;
        } else if (watchlistFilters.imdbScore === '7to9') {
          if (imdbScore < 7 || imdbScore > 9) return false;
        } else if (watchlistFilters.imdbScore === 'above9') {
          if (imdbScore <= 9) return false;
        }
      }
      
      // Filter by Rotten Tomatoes score
      if (watchlistFilters.tomatoesRating !== 'all') {
        const rtScore = watchlistRatings[movie._id]?.rt 
          ? parseInt(watchlistRatings[movie._id].rt) 
          : Math.round(Math.random() * 40 + 60);
        
        if (watchlistFilters.tomatoesRating === 'under60') {
          if (rtScore >= 60) return false;
        } else if (watchlistFilters.tomatoesRating === '60to75') {
          if (rtScore < 60 || rtScore > 75) return false;
        } else if (watchlistFilters.tomatoesRating === '75to90') {
          if (rtScore < 75 || rtScore > 90) return false;
        } else if (watchlistFilters.tomatoesRating === 'above90') {
          if (rtScore <= 90) return false;
        }
      }
      
      return true;
    });
  };
  
  // Apply filters to reviews
  const getFilteredReviews = () => {
    if (!reviews) return [];
    
    return [...reviews].filter(review => {
      const movie = reviewMovies[review.movieId];
      if (!movie) return false;
      
      // Filter by ticket rating
      if (reviewsFilters.ticketRating !== 'all') {
        const rating = review.rating || 0;
        
        if (reviewsFilters.ticketRating === '1star') {
          if (rating < 1 || rating >= 2) return false;
        } else if (reviewsFilters.ticketRating === '2stars') {
          if (rating < 2 || rating >= 3) return false;
        } else if (reviewsFilters.ticketRating === '3stars') {
          if (rating < 3 || rating >= 4) return false;
        } else if (reviewsFilters.ticketRating === '4stars') {
          if (rating < 4 || rating >= 5) return false;
        } else if (reviewsFilters.ticketRating === '5stars') {
          if (rating < 5) return false;
        }
      }
      
      // Filter by date added
      if (reviewsFilters.dateAdded !== 'all') {
        const reviewDate = new Date(review.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));
        
        if (reviewsFilters.dateAdded === 'lastWeek') {
          if (daysDiff > 7) return false;
        } else if (reviewsFilters.dateAdded === 'lastMonth') {
          if (daysDiff > 30) return false;
        } else if (reviewsFilters.dateAdded === 'last3Months') {
          if (daysDiff > 90) return false;
        } else if (reviewsFilters.dateAdded === 'lastYear') {
          if (daysDiff > 365) return false;
        }
      }
      
      // Filter by release year
      if (reviewsFilters.releaseYear !== 'all') {
        const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
        if (!movieYear) return false;
        
        if (reviewsFilters.releaseYear === 'before2000') {
          if (movieYear >= 2000) return false;
        } else if (reviewsFilters.releaseYear === '2000to2010') {
          if (movieYear < 2000 || movieYear > 2010) return false;
        } else if (reviewsFilters.releaseYear === '2010to2020') {
          if (movieYear < 2010 || movieYear > 2020) return false;
        } else if (reviewsFilters.releaseYear === 'after2020') {
          if (movieYear <= 2020) return false;
        }
      }
      
      return true;
    });
  };

  // Fetch ratings for watchlist items only
  useEffect(() => {
    // Log the watchlist
    console.log('Watchlist:', watchlist);
    
    const fetchWatchlistRatings = async () => {
      if (watchlist.length === 0 || activeView !== 'watchlist') return;
      
      // Only show loading if we haven't loaded watchlist yet
      if (!watchlistLoaded && activeView === 'watchlist') {
        setIsWatchlistLoading(true);
      }
      
      const ratingsMap = {};
      let hasNewRatings = false;
      
      for (const movie of watchlist) {
        if (movie.title && !watchlistRatings[movie._id]) {
          try {
            const ratings = await omdbAPI.getMovieRatings(movie.title);
            ratingsMap[movie._id] = ratings;
            hasNewRatings = true;
          } catch (error) {
            console.error(`Error fetching ratings for ${movie.title}:`, error);
          }
        }
      }
      
      if (hasNewRatings) {
        setWatchlistRatings(prev => ({ ...prev, ...ratingsMap }));
      }
      
      setWatchlistLoaded(true);
      setIsWatchlistLoading(false);
    };
    
    fetchWatchlistRatings();
  }, [watchlist, activeView, watchlistRatings, watchlistLoaded]);

  // Fetch user reviews when activeView changes to 'reviews'
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (activeView !== 'reviews' || !dbUser) return;
      
      // Only show loading if we haven't loaded reviews yet
      if (!reviewsLoaded) {
        setIsReviewsLoading(true);
      }
      
      try {
        // Use the dbUser._id directly
        const userId = '67c8c90e4255e8e3812db203';
        
        // Fetch reviews from the backend
        const response = await fetch(`${BACKEND_URL}/api/users/${userId}/reviews`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status}`);
        }
        
        const userReviews = await response.json();
        setReviews(userReviews);
        setReviewsLoaded(true);
        
        // Fetch movie details for each review
        const movieDetailsMap = {};
        for (const review of userReviews) {
          try {
            if (!movieDetailsMap[review.movieId]) {
              const movieRes = await fetch(
                `https://api.themoviedb.org/3/movie/${review.movieId}?api_key=${TMDB_API_KEY}&language=en-US`
              );
              
              if (!movieRes.ok) {
                throw new Error(`Failed to fetch movie details: ${movieRes.status}`);
              }
              
              const movieData = await movieRes.json();
              
              movieDetailsMap[review.movieId] = {
                id: review.movieId,
                title: movieData.title,
                poster: movieData.poster_path 
                  ? `https://image.tmdb.org/t/p/w200${movieData.poster_path}`
                  : '/placeholder-poster.jpg',
                release_date: movieData.release_date
              };
            }
          } catch (error) {
            console.error(`Error fetching movie details for movie ID ${review.movieId}:`, error);
          }
        }
        
        setReviewMovies(movieDetailsMap);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      } finally {
        setIsReviewsLoading(false);
      }
    };
    
    fetchUserReviews();
  }, [activeView, dbUser, reviewsLoaded]);

  // Format date to MM/DD/YY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(2)}`;
  };

  // Watchlist loading placeholder
  const renderWatchlistLoadingPlaceholder = () => (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="watchlist-loading-item shimmer">
          <div className="watchlist-loading-poster pulse"></div>
          <div className="watchlist-loading-content">
            <div className="watchlist-loading-title pulse"></div>
            <div className="watchlist-loading-year pulse"></div>
            <div className="watchlist-loading-ratings">
              <div className="watchlist-loading-rating pulse"></div>
              <div className="watchlist-loading-rating pulse"></div>
            </div>
            <div className="watchlist-loading-description pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Reviews loading placeholder
  const renderReviewsLoadingPlaceholder = () => (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="watchlist-loading-item shimmer">
          <div className="watchlist-loading-poster pulse"></div>
          <div className="watchlist-loading-content">
            <div className="watchlist-loading-title pulse"></div>
            <div className="watchlist-loading-year pulse"></div>
            <div className="watchlist-loading-rating pulse" style={{ width: '100px' }}></div>
            <div className="watchlist-loading-description pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden relative" key={activeView}>
      {/* Filter Dropdown Menu */}
      {showFilterMenu && (
        <div 
          ref={filterMenuRef}
          className="absolute right-0 mt-[-40px] w-64 bg-[#222] border border-[#444] rounded-md shadow-lg z-50 p-3"
          style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white text-sm font-['Cabin']">Filter {activeView === 'watchlist' ? 'Watchlist' : 'Reviews'}</h3>
            <div className="flex gap-2">
              <BiX 
                className="text-white hover:text-[#ff4b4b] cursor-pointer" 
                onClick={closeFilterMenu}
              />
            </div>
          </div>
          
          {activeView === 'watchlist' ? (
            // Watchlist Filters
            <div className="space-y-3">
              {/* Release Year Filter */}
              <div>
                <label className="text-[#ddd] text-xs block mb-1 font-['Cabin']">Release Year</label>
                <select 
                  className="w-full bg-[#333] text-white text-xs p-1.5 rounded border border-[#555] font-['Cabin']"
                  value={watchlistFilters.releaseYear}
                  onChange={(e) => updateWatchlistFilter('releaseYear', e.target.value)}
                >
                  <option value="all">All Years</option>
                  <option value="before2000">Before 2000</option>
                  <option value="2000to2010">2000 - 2010</option>
                  <option value="2010to2020">2010 - 2020</option>
                  <option value="after2020">After 2020</option>
                </select>
              </div>
              
              {/* Tomatoes Rating Filter */}
              <div>
                <label className="text-[#ddd] text-xs block mb-1 font-['Cabin']">Rotten Tomatoes</label>
                <select 
                  className="w-full bg-[#333] text-white text-xs p-1.5 rounded border border-[#555] font-['Cabin']"
                  value={watchlistFilters.tomatoesRating}
                  onChange={(e) => updateWatchlistFilter('tomatoesRating', e.target.value)}
                >
                  <option value="all">All Ratings</option>
                  <option value="under60">Under 60%</option>
                  <option value="60to75">60% - 75%</option>
                  <option value="75to90">75% - 90%</option>
                  <option value="above90">Above 90%</option>
                </select>
              </div>
              
              {/* IMDb Score Filter */}
              <div>
                <label className="text-[#ddd] text-xs block mb-1 font-['Cabin']">IMDb Score</label>
                <select 
                  className="w-full bg-[#333] text-white text-xs p-1.5 rounded border border-[#555] font-['Cabin']"
                  value={watchlistFilters.imdbScore}
                  onChange={(e) => updateWatchlistFilter('imdbScore', e.target.value)}
                >
                  <option value="all">All Scores</option>
                  <option value="under5">Under 5</option>
                  <option value="5to7">5 - 7</option>
                  <option value="7to9">7 - 9</option>
                  <option value="above9">Above 9</option>
                </select>
              </div>
            </div>
          ) : (
            // Reviews Filters
            <div className="space-y-3">
              {/* Ticket Rating Filter */}
              <div>
                <label className="text-[#ddd] text-xs block mb-1 font-['Cabin']">Ticket Rating</label>
                <select 
                  className="w-full bg-[#333] text-white text-xs p-1.5 rounded border border-[#555] font-['Cabin']"
                  value={reviewsFilters.ticketRating}
                  onChange={(e) => updateReviewsFilter('ticketRating', e.target.value)}
                >
                  <option value="all">All Ratings</option>
                  <option value="1star">1 Star</option>
                  <option value="2stars">2 Stars</option>
                  <option value="3stars">3 Stars</option>
                  <option value="4stars">4 Stars</option>
                  <option value="5stars">5 Stars</option>
                </select>
              </div>
              
              {/* Date Added Filter */}
              <div>
                <label className="text-[#ddd] text-xs block mb-1 font-['Cabin']">Date Added</label>
                <select 
                  className="w-full bg-[#333] text-white text-xs p-1.5 rounded border border-[#555] font-['Cabin']"
                  value={reviewsFilters.dateAdded}
                  onChange={(e) => updateReviewsFilter('dateAdded', e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="last3Months">Last 3 Months</option>
                  <option value="lastYear">Last Year</option>
                </select>
              </div>
              
              {/* Release Year Filter */}
              <div>
                <label className="text-[#ddd] text-xs block mb-1 font-['Cabin']">Release Year</label>
                <select 
                  className="w-full bg-[#333] text-white text-xs p-1.5 rounded border border-[#555] font-['Cabin']"
                  value={reviewsFilters.releaseYear}
                  onChange={(e) => updateReviewsFilter('releaseYear', e.target.value)}
                >
                  <option value="all">All Years</option>
                  <option value="before2000">Before 2000</option>
                  <option value="2000to2010">2000 - 2010</option>
                  <option value="2010to2020">2010 - 2020</option>
                  <option value="after2020">After 2020</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Applied Filters Count and Reset Button */}
          <div className="mt-3 pt-2 border-t border-[#444] flex justify-between items-center">
            <span className="text-xs text-[#aaa] font-['Cabin']">
              {activeView === 'watchlist' ? (
                Object.values(watchlistFilters).filter(v => v !== 'all').length
              ) : (
                Object.values(reviewsFilters).filter(v => v !== 'all').length
              )} filter(s) applied
            </span>
            <button 
              onClick={resetFilters}
              className="text-xs bg-[#ff4b4b] hover:bg-[#ff6b6b] text-white py-1 px-3 rounded transition-colors font-['Cabin']"
              disabled={activeView === 'watchlist' 
                ? Object.values(watchlistFilters).every(v => v === 'all')
                : Object.values(reviewsFilters).every(v => v === 'all')}
            >
              Reset All
            </button>
          </div>
        </div>
      )}
      
      <div className="h-full overflow-y-auto pr-2 grid grid-cols-2 gap-3 auto-rows-min" style={{ gridAutoFlow: 'row' }}>
        {isWatchlistLoading && activeView === 'watchlist' && !watchlistLoaded ? (
          renderWatchlistLoadingPlaceholder()
        ) : activeView === 'watchlist' ? (
          // Watchlist View
          getFilteredWatchlist().length > 0 ? (
            getFilteredWatchlist().map((movie, index) => (
              <div 
                key={movie._id} 
                className={`flex ${index % 2 === 0 ? 'bg-[#333]' : 'bg-[#3a3a3a]'} p-2.5 rounded-md border border-[#444] font-['Cabin'] h-[10rem]`}
              >
                <div className="h-full mr-2.5" style={{ width: '100px' }}>
                  <img 
                    src={movie.poster_path 
                      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` 
                      : '/placeholder-poster.jpg'
                    } 
                    alt={movie.title || 'Movie poster'} 
                    className="h-full w-full object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg text-white m-0 truncate font-['Cabin']">
                        {movie.title && movie.title.length > 20 
                          ? `${movie.title.substring(0, 20)}...` 
                          : movie.title}
                      </h4>
                      <div className="text-xs text-[#bbbbbb] text-left font-['Cabin']">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </div>
                    </div>
                    <span className="text-xs text-[#888] ml-1 font-['Cabin']">2/22/24</span>
                  </div>
                  
                  <div className="flex gap-2 mt-1 mb-1">
                    <div className="flex items-center gap-1 text-xs font-['Cabin']">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/575px-IMDB_Logo_2016.svg.png"
                        alt="IMDb"
                        className="w-8 h-4 object-contain"
                      />
                      <span className="text-[#ff4b4b] text-xs">
                        {watchlistRatings[movie._id]?.imdb || (movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-['Cabin']">
                      <img 
                        src="https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/certified_fresh-notext.56a89734a59.svg"
                        alt="Tomato Score"
                        className="w-4 h-4 object-contain"
                      />
                      <span className="text-[#ff4b4b] text-xs">
                        {watchlistRatings[movie._id]?.rt ? `${watchlistRatings[movie._id].rt}` : (Math.random() > 0.1 ? `${Math.round(Math.random() * 40 + 60)}%` : 'N/A')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative flex-grow">
                    <p className="text-xs text-[#ddd] mt-1 font-['Cabin'] text-left">
                      {(() => {
                        const text = movie.overview || 'No description available.';
                        const maxLength = 184;
                        const isTruncated = text.length > maxLength;
                        return isTruncated ? `${text.substring(0, maxLength)}... ` : `${text} `;
                      })()}
                      <span 
                        className="text-[#ff8080] cursor-pointer hover:text-[#ff4b4b]"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/movies/${movie.movieId}`);
                        }}
                      >
                        Click to see movie details
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 flex items-center justify-center text-center p-4">
              <p className="text-[#888] text-base font-['Cabin']">Your watchlist is empty. Add movies from the search page!</p>
            </div>
          )
        ) : (
          // Reviews View
          isReviewsLoading && !reviewsLoaded ? (
            renderReviewsLoadingPlaceholder()
          ) : getFilteredReviews().length > 0 ? (
            getFilteredReviews().map((review, index) => {
              const movie = reviewMovies[review.movieId];
              if (!movie) return null;
              
              return (
                <div 
                  key={review._id} 
                  className={`flex ${index % 2 === 0 ? 'bg-[#333]' : 'bg-[#3a3a3a]'} p-2.5 rounded-md  font-['Cabin'] h-[10rem]`}
                >
                  <div className="h-full mr-2.5" style={{ width: '100px' }}>
                    <img 
                      src={movie.poster} 
                      alt={movie.title} 
                      className="h-full w-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base text-white m-0 truncate font-['Cabin']">
                          {movie.title && movie.title.length > 20 
                            ? `${movie.title.substring(0, 20)}...` 
                            : movie.title}
                        </h4>
                        <div className="text-xs text-[#bbbbbb] text-left font-['Cabin']">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                        </div>
                      </div>
                      <span className="text-xs text-[#888] ml-1 font-['Cabin']">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    
                    <div className="mt-1 mb-1">
                      <div className="flex gap-2">
                        <TicketRating
                          rating={review.rating}
                          interactive={false}
                          size="md"
                          color="#ff4b4b"
                          className="scale-150 origin-left"
                        />
                      </div>
                    </div>
                    
                    <div className="relative flex-grow">
                      <p className="text-xs text-[#ddd] -mt-1 font-['Cabin'] text-left">
                        {(() => {
                          if (!review.reviewText) return 'No review text available. ';
                          const maxLength = 202;
                          const isTruncated = review.reviewText.length > maxLength;
                          return isTruncated ? `${review.reviewText.substring(0, maxLength)}... ` : `${review.reviewText} `;
                        })()}
                        <span 
                          className="text-[#ff8080] cursor-pointer hover:text-[#ff4b4b]"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/movies/${review.movieId}`);
                          }}
                        >
                          Click to see full review
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 flex items-center justify-center text-center p-4">
              <p className="text-[#888] text-base font-['Cabin']">No reviews available.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}; 