export const MovieDetails = ({ 
  movie, 
  ratings, 
  selectedTrailer, 
  handleCloseMovie,
  renderWatchProviders,
  renderCast,
  renderReviews 
}) => {
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
          <p className="overview">{movie.overview}</p>
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
    </div>
  );
}; 