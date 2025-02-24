import { useState, useEffect } from 'react';
import { Modal } from './Modal';

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

  return (
    <div className="search-result">
      <button onClick={handleCloseMovie} className="close-button">×</button>
      <div className="movie-details">
        {movie.poster_path && (
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="movie-poster"
          />
        )}
        <div className="movie-info">
          <h1>{movie.title}</h1>
          <button onClick={fetchApiDetails} className="api-details-button">
            API Details
          </button>
          <p className="overview">{movie.overview}</p>
          {director && (
            <p className="director">
              <span>🎬 Director:</span> {director.name}
            </p>
          )}
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
            <a 
              href={`https://www.themoviedb.org/movie/${movie.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rating tmdb-rating"
            >
              <span>⭐ TMDB Rating:</span> {movie.vote_average.toFixed(1)}/10
            </a>
          </div>
          <p className="release-date">
            <span>🗓 Release Date:</span> {new Date(movie.release_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
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
    </div>
  );
}; 