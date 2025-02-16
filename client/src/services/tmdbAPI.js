const API_KEY = 'e7b225b138e7b083d203ad7bc2819fec';
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdbAPI = {
  async getNowPlaying() {
    const res = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`);
    return res.json();
  },

  async getUpcoming() {
    const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&region=US&with_release_type=3`);
    return res.json();
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

}; 