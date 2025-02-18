import { useState, useEffect, useCallback } from 'react';
import { useMovieData } from '../hooks/useMovieData';
import { MovieCard } from '../components/MovieCard';
import { MovieDetails } from '../components/MovieDetails';
import { tmdbAPI } from '../services/tmdbAPI';
import { omdbAPI } from '../services/omdbAPI';

export const MovieDemo = () => {
  const [movie, setMovie] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [watchProviders, setWatchProviders] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState({ rt: null, imdb: null, imdbId: null });
  const [cardRatings, setCardRatings] = useState({});
  const [scrollInterval, setScrollInterval] = useState(null);
  const [cast, setCast] = useState([]);

  const { nowPlaying, upcoming, loading, error } = useMovieData();

  const fetchMovieDetails = useCallback(async (movieId, title) => {
    try {
      const [movieDetails, omdbData] = await Promise.all([
        tmdbAPI.getMovieDetails(movieId),
        omdbAPI.getMovieRatings(title)
      ]);

      setSelectedTrailer(movieDetails.trailer);
      setWatchProviders(movieDetails.providers);
      setReviews(movieDetails.reviews);
      setCast(movieDetails.cast);
      setRatings(omdbData);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchCardRatings = useCallback(async (movie) => {
    try {
      const ratings = await omdbAPI.getMovieRatings(movie.title);
      
      setCardRatings(prev => ({
        ...prev,
        [movie.id]: {
          imdb: ratings.imdb,
          rt: ratings.rt,
          tmdb: movie.vote_average
        }
      }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    nowPlaying.forEach(movie => fetchCardRatings(movie));
    upcoming.forEach(movie => fetchCardRatings(movie));
  }, [nowPlaying, upcoming, fetchCardRatings]);

  const searchMovie = async (e) => {
    e.preventDefault();
    
    if (searchTerm) {
      try {
        const data = await tmdbAPI.searchMovie(searchTerm);
        if (data.results && data.results.length > 0) {
          setMovie(data.results[0]);
          fetchMovieDetails(data.results[0].id, data.results[0].title);
        } else {
          handleCloseMovie();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleMovieClick = (movie) => {
    setMovie(movie);
    fetchMovieDetails(movie.id, movie.title);
    scrollToTop();
  };

  const handleCloseMovie = () => {
    setMovie(null);
    setSelectedTrailer(null);
    setWatchProviders(null);
    setReviews([]);
    setRatings({ rt: null, imdb: null, imdbId: null });
    setCast([]);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const startScrolling = (direction, containerId) => {
    if (scrollInterval) return;

    const container = document.getElementById(containerId);
    const interval = setInterval(() => {
      if (container) {
        container.scrollLeft += direction === 'left' ? -200 : 200;
      }
    }, 1);
    
    setScrollInterval(interval);
  };

  const stopScrolling = () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      setScrollInterval(null);
    }
  };

  const renderWatchProviders = () => {
    if (!watchProviders) return null;

    return (
      <div className="watch-providers">
        {watchProviders.flatrate && (
          <div className="provider-section">
            <h4>Stream</h4>
            <div className="provider-logos">
              {watchProviders.flatrate.map(provider => (
                <a
                  key={provider.provider_id}
                  href={watchProviders.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="provider-link"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    title={provider.provider_name}
                  />
                </a>
              ))}
            </div>
          </div>
        )}
        {watchProviders.rent && (
          <div className="provider-section">
            <h4>Rent</h4>
            <div className="provider-logos">
              {watchProviders.rent.map(provider => (
                <a
                  key={provider.provider_id}
                  href={watchProviders.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="provider-link"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    title={provider.provider_name}
                  />
                </a>
              ))}
            </div>
          </div>
        )}
        {watchProviders.buy && (
          <div className="provider-section">
            <h4>Buy</h4>
            <div className="provider-logos">
              {watchProviders.buy.map(provider => (
                <a
                  key={provider.provider_id}
                  href={watchProviders.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="provider-link"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    title={provider.provider_name}
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReviews = () => {
    if (!reviews.length) return null;

    return (
      <div className="reviews-section">
        <h2>Reviews</h2>
        <div className="reviews-container">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <img 
                  src={review.author_details.avatar_path ? 
                    (review.author_details.avatar_path.startsWith('/http') ? 
                      review.author_details.avatar_path.slice(1) : 
                      `https://image.tmdb.org/t/p/original${review.author_details.avatar_path}`
                    ) : 
                    'https://www.gravatar.com/avatar/placeholder?d=mp'
                  } 
                  alt={review.author}
                  className="author-avatar"
                />
                <div>
                  <h4>{review.author}</h4>
                  <p className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="review-content">
                <p>{review.content.length > 300 ? 
                  `${review.content.substring(0, 300)}...` : 
                  review.content
                }</p>
                {review.content.length > 300 && (
                  <a 
                    href={review.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="read-more"
                  >
                    Read full review
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCast = () => {
    if (!cast.length) return null;

    return (
      <div className="cast-section">
        <h2>Cast</h2>
        <div className="cast-list">
          {cast.map(member => (
            <div key={member.id} className="cast-member">
              {member.profile_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w200${member.profile_path}`}
                  alt={member.name}
                  className="cast-photo"
                />
              ) : (
                <div className="cast-photo-placeholder">
                  <span>{member.name.charAt(0)}</span>
                </div>
              )}
              <h3>{member.name}</h3>
              <p>{member.character}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="movie-demo">
      <header className="App-header">
        <form onSubmit={searchMovie} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a movie..."
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>

        {movie && (
          <MovieDetails
            movie={movie}
            ratings={ratings}
            selectedTrailer={selectedTrailer}
            handleCloseMovie={handleCloseMovie}
            renderWatchProviders={renderWatchProviders}
            renderCast={renderCast}
            renderReviews={renderReviews}
          />
        )}

        <div className="now-playing">
          <h2>Now Playing in Theaters</h2>
          <div className="section-container">
            <button 
              className="scroll-button scroll-left" 
              onMouseDown={() => startScrolling('left', 'now-playing-grid')}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
            >←</button>
            <div className="movie-grid" id="now-playing-grid">
              {nowPlaying.map(movie => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  cardRatings={cardRatings}
                  isUpcoming={false}
                  onClick={handleMovieClick}
                />
              ))}
            </div>
            <button 
              className="scroll-button scroll-right"
              onMouseDown={() => startScrolling('right', 'now-playing-grid')}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
            >→</button>
          </div>
        </div>

        <div className="upcoming-movies">
          <h2>Coming Soon to Theaters</h2>
          <div className="section-container">
            <button 
              className="scroll-button scroll-left"
              onMouseDown={() => startScrolling('left', 'upcoming-grid')}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
            >←</button>
            <div className="movie-grid" id="upcoming-grid">
              {upcoming.map(movie => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  cardRatings={cardRatings}
                  isUpcoming={true}
                  onClick={handleMovieClick}
                />
              ))}
            </div>
            <button 
              className="scroll-button scroll-right"
              onMouseDown={() => startScrolling('right', 'upcoming-grid')}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
            >→</button>
          </div>
        </div>
      </header>
    </div>
  );
}; 