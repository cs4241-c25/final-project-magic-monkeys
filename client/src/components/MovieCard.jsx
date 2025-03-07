export const MovieCard = ({ movie, cardRatings, isUpcoming, onClick }) => (
  <div 
    className={`movie-card ${isUpcoming ? 'upcoming-card' : ''}`}
    onClick={() => onClick(movie)}
  >
    {movie.poster_path && (
      <img 
        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
        alt={movie.title}
      />
    )}
    <h3>{movie.title}</h3>
    <div className="card-ratings">
      {cardRatings[movie.id]?.rt && (
        <div className="card-rating rt">
          <img 
            src={parseInt(cardRatings[movie.id].rt) >= 60 ? 
              'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/certified_fresh-notext.56a89734a59.svg' : 
              'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-rotten.f1ef4f02ce3.svg'
            } 
            alt="RT"
          />
          {cardRatings[movie.id].rt}
        </div>
      )}
      {cardRatings[movie.id]?.imdb && (
        <div className="card-rating imdb">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/575px-IMDB_Logo_2016.svg.png"
            alt="IMDb"
          />
          {cardRatings[movie.id].imdb}
        </div>
      )}
      <div className="card-rating tmdb">
        ⭐ {movie.vote_average.toFixed(1)}
      </div>
    </div>
    {isUpcoming && (
      <p>Release Date: <span className="release-date-date">{new Date(movie.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</span></p>
    )}
  </div>
); 