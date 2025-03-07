const API_KEY = 'e7b225b138e7b083d203ad7bc2819fec';
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdbAPI = {
  async getNowPlaying() {
    const res = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`);
    return res.json();
  },

  async getUpcoming() {
    const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&region=US&with_release_type=3`);
    const data = await res.json();
    
    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);

    const filteredMovies = data.results.filter(movie => {
      const releaseDate = new Date(movie.release_date);
      return releaseDate >= today && 
             releaseDate <= sixMonthsFromNow && 
             movie.poster_path !== null;
    });

    filteredMovies.sort((a, b) => 
      new Date(a.release_date) - new Date(b.release_date)
    );

    return {
      ...data,
      results: filteredMovies
    };
  },

  async searchMovie(query) {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${query}&page=1`);
    return res.json();
  },

  async getMovieDetails(movieId) {
    const [trailerRes, providersRes, reviewsRes, castRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`),
      fetch(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}&language=en-US&page=1`),
      fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=en-US`)
    ]);

    const [trailerData, providersData, reviewsData, castData] = await Promise.all([
      trailerRes.json(),
      providersRes.json(),
      reviewsRes.json(),
      castRes.json()
    ]);

    return {
      trailer: trailerData.results.find(video => video.type === 'Trailer' || video.type === 'Teaser'),
      providers: providersData.results.US || null,
      reviews: reviewsData.results.slice(0, 3),
      cast: castData.cast.slice(0, 10)
    };
  },

  async getTrailer(movieId) {
    const res = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
    const data = await res.json();
    return data.results.find(video => video.type === 'Trailer' || video.type === 'Teaser');
  },

  async getMovieBase(movieId) {
    const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
    if (!res.ok) {
      throw new Error(`Failed to fetch base details for movieId=${movieId}`);
    }
    return res.json();
  },

  async getMovie(movieId) {
    try {
      const movieData = await this.getMovieBase(movieId);
      return {
        id: movieData.id,
        title: movieData.title,
        overview: movieData.overview,
        poster_path: movieData.poster_path,
        backdrop_path: movieData.backdrop_path,
        release_date: movieData.release_date,
        vote_average: movieData.vote_average,
        genres: movieData.genres,
        runtime: movieData.runtime,
        poster: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
        backdrop: `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
      };
    } catch (error) {
      console.error(`Error fetching movie with ID ${movieId}:`, error);
      throw error;
    }
  },

}; 