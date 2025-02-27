  import { useEffect, useState } from 'react';
import { tmdbAPI } from '../services/tmdbAPI';

export const HeroImage = () => {
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const data = await tmdbAPI.getNowPlaying();
        const posterUrls = data.results
          .slice(0, 9)
          .map(movie => `https://image.tmdb.org/t/p/w300${movie.poster_path}`);
        setPosters(posterUrls);
      } catch (err) {
        console.error('Error fetching posters:', err);
      }
    };

    fetchPosters();
  }, []);

  return (
    <div className="hero-image-grid">
      {posters.map((poster, index) => (
        <div 
          key={index} 
          className="poster-wrapper"
          style={{
            '--delay': `${index * 0.2}s`,
            '--angle': `${(index * 20) - 80}deg`
          }}
        >
          <img src={poster} alt="Movie poster" className="poster" />
        </div>
      ))}
    </div>
  );
}; 