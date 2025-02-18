import { useState, useEffect } from 'react';
import { tmdbAPI } from '../services/tmdbAPI';

export const useMovieData = () => {
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [nowPlayingData, upcomingData] = await Promise.all([
          tmdbAPI.getNowPlaying(),
          tmdbAPI.getUpcoming()
        ]);

        setNowPlaying(nowPlayingData.results.slice(0, 20));
        setUpcoming(upcomingData.results.slice(0, 20));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return { nowPlaying, upcoming, loading, error };
}; 