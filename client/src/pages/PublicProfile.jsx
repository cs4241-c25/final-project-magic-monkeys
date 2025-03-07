import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tmdbAPI } from '../services/tmdbAPI'; // Adjust path as needed
import '../styles/PublicProfile.css'; // Our new stylesheet
import { SideNav } from '../components/SideNav';

// Same background color from your existing theme
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Tier rank order
const RANK_ORDER = ['S', 'A', 'B', 'C', 'D', 'F', 'U'];

export const PublicProfile = () => {
  const { username } = useParams();

  // Basic user data & error/loading states
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);   

  // TierList data
  const [tierList, setTierList] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // 1) Fetch the user by username
        const userRes = await fetch(`${BACKEND_URL}/api/users/username/${username}`);
        if (!userRes.ok) {
          throw new Error(`Error fetching user: ${userRes.statusText}`);
        }
        const user = await userRes.json();
        setUserData(user);

        // 2) Fetch user’s tier list using user._id
        const tierRes = await fetch(`${BACKEND_URL}/api/users/${user._id}/tier-lists`);
        if (tierRes.status === 404) {
          // This user has no tier list entries
          setTierList([]);
        } else if (!tierRes.ok) {
          throw new Error(`Error fetching tier list: ${tierRes.statusText}`);
        } else {
          const rawTierList = await tierRes.json();

          // 3) For each entry, fetch title/poster from TMDB
          const enriched = await Promise.all(
            rawTierList.map(async (doc) => {
              try {
                // doc has { movieId, rank, order, ... }
                const baseData = await tmdbAPI.getMovieBase(doc.movieId);
                return {
                  ...doc,
                  title: baseData.title || 'Unknown Title',
                  posterPath: baseData.poster_path,
                };
              } catch (tmdbError) {
                console.error(`Failed to fetch TMDB for movieId=${doc.movieId}`, tmdbError);
                return {
                  ...doc,
                  title: 'Unknown Title',
                  posterPath: null
                };
              }
            })
          );

          // 4) Sort them by rank + order
          enriched.sort((a, b) => {
            const rankA = RANK_ORDER.indexOf(a.rank);
            const rankB = RANK_ORDER.indexOf(b.rank);
            if (rankA !== rankB) return rankA - rankB;
            return (a.order ?? 0) - (b.order ?? 0);
          });

          setTierList(enriched);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="public-profile-container">
        <h1>Loading Profile...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-container">
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="public-profile-container">
        <h1>No user data found.</h1>
      </div>
    );
  }

  // Build a map of rank -> [movies...]
  const tierMap = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
    U: []
  };
  tierList.forEach(item => {
    tierMap[item.rank].push(item);
  });

  // Determine what to display as the "favorite movie."
  // If userData.favoriteMovie not set, use first S-tier movie title if it exists
  let displayedFavoriteMovie = userData.favoriteMovie;
  if (!displayedFavoriteMovie && tierMap.S.length > 0) {
    displayedFavoriteMovie = tierMap.S[0].title;
  }

  return (
    <div className="public-profile-container">
      <SideNav isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      {/* Top Row */}
      <div className="profile-top-row">
        <div className="profile-avatar">
          {/* Show first letter if no profile pic */}
          {userData.username?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1 className="profile-username">{userData.username}</h1>
          {/* Dummy data for “Joined” date */}
          <p className="profile-joined">Joined: Jan 1, 2023</p>
        </div>
      </div>

      {/* Second Row */}
      <div className="profile-second-row">
        {/* Left half: Bio */}
        <div className="profile-bio-section">
          <h2>Bio</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Quisque fermentum felis in lectus gravida, nec pulvinar 
            lacus convallis. Pellentesque habitant morbi tristique 
            senectus et netus et malesuada fames ac turpis egestas.
          </p>
        </div>

        {/* Right half: Favorite Movie */}
        <div className="profile-favorite-movie">
          <h2>Favorite Movie</h2>
          {displayedFavoriteMovie ? (
            <p className="favorite-movie-title">{displayedFavoriteMovie}</p>
          ) : (
            <p>No favorite movie specified.</p>
          )}
        </div>
      </div>

      {/* Mini Tier List */}
      <div className="profile-tierlist-section">
        <h2>User Tier List</h2>
        {tierList.length === 0 ? (
          <p>This user has no movies in their tier list yet.</p>
        ) : (
          <div className="mini-tier-container">
            {RANK_ORDER.map((rank) => {
              const items = tierMap[rank];
              if (!items.length) return null; // Skip empty ranks

              return (
                <div key={rank} className="mini-tier-row">
                  <div className="mini-tier-label">
                    {rank === 'U' ? 'U' : rank}
                  </div>
                  <div className="mini-tier-movies">
                    {items.map((movie, i) => {
                      const posterUrl = movie.posterPath
                        ? `https://image.tmdb.org/t/p/w200${movie.posterPath}`
                        : null;

                      return posterUrl ? (
                        <img
                          key={`${rank}-${i}`}
                          src={posterUrl}
                          alt={movie.title}
                        />
                      ) : (
                        <div key={`${rank}-${i}`} className="no-poster">
                          {movie.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
