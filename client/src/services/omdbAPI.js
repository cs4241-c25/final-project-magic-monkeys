const API_KEY = '1675cb21';

export const omdbAPI = {
  async getMovieRatings(title) {
    const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`);
    const data = await res.json();
    const rtRating = data.Ratings?.find(rating => rating.Source === 'Rotten Tomatoes');
    
    return {
      rt: rtRating?.Value || null,
      imdb: data.imdbRating || null,
      imdbId: data.imdbID || null
    };
  }
}; 