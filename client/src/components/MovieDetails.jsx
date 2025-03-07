import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from '../context/UserContext';
import { ReviewModal } from './ReviewModal';
import { BsTicket } from "react-icons/bs";
import { TicketRating } from './TicketRating';
import { FiX } from "react-icons/fi";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const MovieDetails = ({ 
  movie, 
  ratings, 
  selectedTrailer, 
  handleCloseMovie,
  renderWatchProviders,
  renderCast,
  renderReviews 
}) => {
  const [showApiDetails, setShowApiDetails] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [director, setDirector] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { dbUser } = useUser();
  const { loginWithRedirect } = useAuth0();
  const [userReview, setUserReview] = useState(null);

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [watchlistEntryId, setWatchlistEntryId] = useState(null);
  const [isInTierList, setIsInTierList] = useState(false);
  const [tierListEntryId, setTierListEntryId] = useState(null);

  const checkMovieStatus = async () => {
    try {
      if (!dbUser) return;
      // Get user's watchlist
      console.log(`Checking movie status for movie ID: ${movie.id}`);
      const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/watch-lists`);
      console.log("Watchlist response status:", response.status);
      if (response.ok) {
        const watchlist = await response.json();
        console.log("Full watchlist data:", watchlist);
        const entry = watchlist.find(item => item.movieId === movie.id);
        console.log('Found entry for this movie:', entry);
        if (entry) {
          setIsInWatchlist(true);
          setIsWatched(Boolean(entry.seenMovie));
          setWatchlistEntryId(entry._id);
        } else {
          setIsInWatchlist(false);
          setIsWatched(false);
          setWatchlistEntryId(null);
        }
      } else {
        console.error("Failed to fetch watchlist:", response.status);
      }
      // Also check if movie is in tier list
      await checkIsInTierList();
    } catch (error) {
      console.error('Error checking movie status:', error);
    }
  };

  const checkIsInTierList = async () => {
    try {
      console.log(`Checking if movie ${movie.id} is in tier list`);
      const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/tier-lists`);
      if (response.ok) {
        const tierList = await response.json();
        console.log("Full tier list data:", tierList);
        const entry = tierList.find(item => item.movieId === movie.id);
        console.log('Found tier list entry:', entry);
        if (entry) {
          setIsInTierList(true);
          setTierListEntryId(entry._id);
        } else {
          setIsInTierList(false);
          setTierListEntryId(null);
        }
      } else {
        console.error("Failed to fetch tier list:", response.status);
      }
    } catch (error) {
      console.error('Error checking tier list status:', error);
    }
  };

  useEffect(() => {
    if (dbUser && movie.id) {
      checkMovieStatus();
    }
  }, [movie.id, dbUser]);

  // Rate & Review Button handler
  const handleReviewButtonClick = () => {
    if (!dbUser) {
      loginWithRedirect();
      return;
    }
    setShowReviewModal(true);
  };

  // Add to Watchlist function with auth check
  const addToWatchlist = async () => {
    if (!dbUser) {
      loginWithRedirect();
      return;
    }
    try {
      console.log("Adding to watchlist with seenMovie=false");
      const response = await fetch(`${BACKEND_URL}/api/watch-lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: dbUser._id,
          movieId: movie.id,
          seenMovie: false
        })
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Watchlist entry created:", data);
        setIsInWatchlist(true);
        setIsWatched(false);
        setWatchlistEntryId(data._id);
        alert('Added to watchlist successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert(`Failed to add to watchlist: ${error.message}`);
    }
  };

  const removeFromWatchlist = async () => {
    if (!dbUser) {
      loginWithRedirect();
      return;
    }
    try {
      if (!isInWatchlist || !watchlistEntryId) {
        throw new Error('Movie is not in your watchlist');
      }
      console.log("Removing from watchlist");
      const response = await fetch(`${BACKEND_URL}/api/watch-lists/${watchlistEntryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Failed to remove from watchlist: ' + (errorData.message || 'Unknown error'));
      }
      setIsInWatchlist(false);
      setIsWatched(false);
      setWatchlistEntryId(null);
      await checkMovieStatus();
      alert('Removed from watchlist!');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      alert(`Failed to remove from watchlist: ${error.message}`);
    }
  };

  // Add to Tier List function with auth check
  const addToTierList = async () => {
    if (!dbUser) {
      loginWithRedirect();
      return;
    }
    try {
      console.log("Adding to tier list with rank U");
      const response = await fetch(`${BACKEND_URL}/api/tier-lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: dbUser._id,
          movieId: movie.id,
          rank: "U",
          order: 1
        })
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Tier list entry created:", data);
        setIsInTierList(true);
        setTierListEntryId(data._id);
        await checkMovieStatus();
        alert('Added to tier list successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error adding to tier list:', error);
      alert(`Failed to add to tier list: ${error.message}`);
    }
  };

  const removeFromTierList = async () => {
    if (!dbUser) {
      loginWithRedirect();
      return;
    }
    try {
      if (!isInTierList || !tierListEntryId) {
        throw new Error('Movie is not in your tier list');
      }
      console.log("Removing from tier list");
      const response = await fetch(`${BACKEND_URL}/api/tier-lists/${tierListEntryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Failed to remove from tier list: ' + (errorData.message || 'Unknown error'));
      }
      setIsInTierList(false);
      setTierListEntryId(null);
      await checkMovieStatus();
      alert('Removed from tier list!');
    } catch (error) {
      console.error('Error removing from tier list:', error);
      alert(`Failed to remove from tier list: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchDirector = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=e7b225b138e7b083d203ad7bc2819fec`
        );
        const data = await res.json();
        const director = data.crew.find(person => person.job === 'Director');
        setDirector(director);
      } catch (err) {
        console.error('Error fetching director:', err);
      }
    };
    fetchDirector();
  }, [movie.id]);

  const fetchApiDetails = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US&api_key=e7b225b138e7b083d203ad7bc2819fec`
      );
      const data = await res.json();
      setApiData(data);
      setShowApiDetails(true);
    } catch (err) {
      console.error('Error fetching API details:', err);
    }
  };

  const handleReviewSubmitted = async () => {
    if (renderReviews) {
      renderReviews();
    }
  };

  const fetchUserReview = async () => {
    try {
      if (!dbUser) return;
      const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/movie/${movie.id}`);
      if (response.ok) {
        const review = await response.json();
        setUserReview(review);
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  useEffect(() => {
    fetchUserReview();
  }, [movie.id, dbUser]);

  const toggleWatchlist = async () => {
    if (!dbUser) {
      loginWithRedirect();
      return;
    }
    try {
      if (isInWatchlist) {
        const response = await fetch(`${BACKEND_URL}/api/watch-lists/${watchlistEntryId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await checkMovieStatus();
          alert('Removed from watchlist!');
        }
      } else {
        const response = await fetch(`${BACKEND_URL}/api/watch-lists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: dbUser._id,
            movieId: movie.id,
            seenMovie: false
          })
        });
        if (response.ok) {
          await checkMovieStatus();
          alert('Added to watchlist successfully!');
        }
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      alert(`Failed to update watchlist: ${error.message}`);
    }
  };

  const toggleWatched = async () => {
    if (!dbUser) {
      loginWithRedirect();
      return;
    }
    try {
      if (isWatched) {
        const watchlistResponse = await fetch(`${BACKEND_URL}/api/watch-lists/${watchlistEntryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seenMovie: false })
        });
        if (watchlistResponse.ok) {
          const tierlistResponse = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/tier-lists`);
          if (tierlistResponse.ok) {
            const tierlist = await tierlistResponse.json();
            const tierEntry = tierlist.find(item => item.movieId === movie.id);
            if (tierEntry) {
              const deleteResponse = await fetch(`${BACKEND_URL}/api/tier-lists/${tierEntry._id}`, {
                method: 'DELETE'
              });
              if (!deleteResponse.ok) {
                console.error('Failed to remove from tier list');
              }
            }
          }
          setIsWatched(false);
          await checkMovieStatus();
          alert('Movie marked as unwatched!');
        }
      } else {
        if (!isInWatchlist) {
          const createWatchlistResponse = await fetch(`${BACKEND_URL}/api/watch-lists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: dbUser._id,
              movieId: movie.id,
              seenMovie: true
            })
          });
          if (!createWatchlistResponse.ok) {
            throw new Error('Failed to create watchlist entry');
          }
          await checkMovieStatus();
        } else {
          const watchlistResponse = await fetch(`${BACKEND_URL}/api/watch-lists/${watchlistEntryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seenMovie: true })
          });
          if (!watchlistResponse.ok) {
            throw new Error('Failed to update watchlist');
          }
        }
        const tierlistResponse = await fetch(`${BACKEND_URL}/api/tier-lists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: dbUser._id,
            movieId: movie.id,
            rank: 'U',
            order: 1
          })
        });
        if (tierlistResponse.ok) {
          setIsWatched(true);
          await checkMovieStatus();
          alert('Movie marked as watched!');
        }
      }
    } catch (error) {
      console.error('Error updating movie status:', error);
      alert(`Failed to update movie status: ${error.message}`);
    }
  };

  return (
    <div className="search-result">
      <button onClick={handleCloseMovie} className="close-button"><FiX /></button>
      <div className="movie-details">
        {movie.poster_path && (
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="movie-poster"
          />
        )}
        <div className="movie-info">
          <div className="flex items-center justify-between">
            <h1 className="movie-title">{movie.title}</h1>
            <div className="flex items-center gap-4">
              {userReview ? (
                <>
                  <div className="flex items-center mb-3">
                    <TicketRating
                        rating={userReview.rating}
                        size="md"
                        color="#ff4b4b"
                        interactive={false}
                        variant={'condensed'}
                    />
                  </div>
                  <button
                      onClick={() => {
                        if (!dbUser) {
                          loginWithRedirect();
                          return;
                        }
                        setShowReviewModal(true);
                      }}
                      className="flex items-center gap-2 px-2 py-2 mb-5 hover:bg-[#444444] rounded-lg transition-colors group"
                  >
                    <span className="text-white font-medium">Edit</span>
                  </button>
                </>
              ) : (
                <button
                    onClick={() => {
                      if (!dbUser) {
                        loginWithRedirect();
                        return;
                      }
                      setShowReviewModal(true);
                    }}
                    className="rate-review-button flex items-center gap-2 px-2 py-2 mb-5 hover:bg-[#444444] rounded-lg transition-colors group"
                >
                  <BsTicket className="text-2xl text-[#ff4b4b] group-hover:text-[#ff716d] transition-colors"/>
                  <span className="text-white font-medium">Rate & Review</span>
                </button>
              )}
            </div>
          </div>
            <button
                onClick={() => {
                  if (!dbUser) {
                    loginWithRedirect();
                    return;
                  }
                  isInWatchlist ? removeFromWatchlist() : addToWatchlist();
                }}
                className="api-details-button mx-2"
            >
              {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </button>
            <button
                onClick={() => {
                  if (!dbUser) {
                    loginWithRedirect();
                    return;
                  }
                  isInTierList ? removeFromTierList() : addToTierList();
                }}
                className="api-details-button mx-2"
            >
              {isInTierList ? "Haven't Watched" : 'Have Watched'}
            </button>
            <p className="overview">{movie.overview}</p>
            {director && (
                <p className="director">
                  <span>Director:</span> {director.name}
                </p>
            )}
            <p className="release-date">
              <span>Release Date:</span> {new Date(movie.release_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            </p>
            <div className="ratings">
              {ratings.rt && (
                  <a
                      href={`https://www.rottentomatoes.com/m/${movie.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rating rt-rating"
                  >
                    <img
                      src={parseInt(ratings.rt) >= 60 ? 
                        'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/certified_fresh-notext.56a89734a59.svg' : 
                        'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-rotten.f1ef4f02ce3.svg'
                      } 
                      alt="Tomato Score"
                      className="tomato-icon"
                  />
                    <span>Score:</span> {ratings.rt}
                  </a>
              )}
              {ratings.imdb && ratings.imdbId && (
                  <a
                      href={`https://www.imdb.com/title/${ratings.imdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rating imdb-rating"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/575px-IMDB_Logo_2016.svg.png"
                      alt="IMDb"
                      className="imdb-icon"
                  />
                    <span>Rating:</span> {ratings.imdb}/10
                  </a>
              )}
            </div>
          </div>
          {selectedTrailer && (
            <div className="trailer-container">
              <iframe
                title="Movie Trailer"
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${selectedTrailer.key}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
      </div>
      {renderWatchProviders()}
      {renderCast()}
      {renderReviews()}
      <Modal 
        isOpen={showApiDetails} 
        onClose={() => setShowApiDetails(false)}
      >
        <h2>Movie Details: {movie.title}</h2>
        {apiData && (
          <div className="api-details">
            <div className="api-section">
              <h3 className="section-header">Movie IDs</h3>
              <ul>
                <li><strong>TMDB ID:</strong> {apiData.id}</li>
                <li><strong>IMDB ID:</strong> 
                  <a 
                    href={`https://www.imdb.com/title/${apiData.imdb_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {apiData.imdb_id}
                  </a>
                </li>
                {apiData.original_title !== apiData.title && (
                  <li><strong>Original Title:</strong> {apiData.original_title}</li>
                )}
              </ul>
            </div>

            <div className="api-section">
              <h3 className="section-header">Basic Information</h3>
              <ul>
                <li><strong>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</li>
                <li><strong>Runtime:</strong> {apiData.runtime} minutes</li>
                <li><strong>Status:</strong> {apiData.status}</li>
                <li><strong>Original Language:</strong> {apiData.spoken_languages.find(
                  lang => lang.iso_639_1 === apiData.original_language
                )?.english_name || apiData.original_language}</li>
                {apiData.homepage && (
                  <li><strong>Official Website:</strong> 
                    <a 
                      href={apiData.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      {apiData.homepage}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div className="api-section">
              <h3 className="section-header">Ratings & Metrics</h3>
              <ul>
                <li><strong>Vote Average:</strong> {apiData.vote_average.toFixed(1)} ({apiData.vote_count} votes)</li>
                <li><strong>Popularity Score:</strong> {apiData.popularity.toFixed(1)}</li>
                <li><strong>Adult Content:</strong> {apiData.adult ? 'Yes' : 'No'}</li>
              </ul>
            </div>

            <div className="api-section">
              <h3 className="section-header">Financial Information</h3>
              <ul>
                <li><strong>Budget:</strong> {apiData.budget > 0 ? 
                  `$${apiData.budget.toLocaleString()}` : 
                  'Not reported'}</li>
                <li><strong>Revenue:</strong> {apiData.revenue > 0 ? 
                  `$${apiData.revenue.toLocaleString()}` : 
                  'Not reported'}</li>
                {apiData.budget > 0 && apiData.revenue > 0 && (
                  <li><strong>Profit/Loss:</strong> 
                    <span className={apiData.revenue - apiData.budget > 0 ? 'profit' : 'loss'}>
                      ${Math.abs(apiData.revenue - apiData.budget).toLocaleString()}
                      {apiData.revenue - apiData.budget > 0 ? ' profit' : ' loss'}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <div className="api-section">
              <h3 className="section-header">Genres</h3>
              <div className="genre-tags">
                {apiData.genres.map(genre => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name} (ID: {genre.id})
                  </span>
                ))}
              </div>
            </div>

            <div className="api-section">
              <h3 className="section-header">Languages</h3>
              <div className="language-list">
                {apiData.spoken_languages.map(lang => (
                  <span key={lang.iso_639_1} className="language-tag">
                    {lang.english_name} ({lang.iso_639_1})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
      <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          movieId={movie.id}
          movieTitle={movie.title}
          existingReview={userReview}
          onReviewSubmitted={(review) => {
            setUserReview(review);
            handleReviewSubmitted();
          }}
      />
    </div>
  );
};
