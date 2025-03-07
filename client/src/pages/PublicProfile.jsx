import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tmdbAPI } from '../services/tmdbAPI';

// Adjust this to match your actual API URL
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


// The possible ranks, in a display order
const RANK_ORDER = ['S', 'A', 'B', 'C', 'D', 'F', 'U']; 
// We'll treat "U" as "unranked" and display it last (or you can put it first if you prefer)

export const PublicProfile = () => {
    const { username } = useParams();
    const [userData, setUserData] = useState(null);
    const [tierListData, setTierListData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
  
    // Fetch the user by username
    useEffect(() => {
      const fetchUser = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/users/username/${username}`);
          if (!res.ok) {
            throw new Error(`Error fetching user: ${res.statusText}`);
          }
          const user = await res.json();
          setUserData(user);
  
          // Next, fetch this user's TierList
          const tierRes = await fetch(`${BACKEND_URL}/api/users/${user._id}/tier-lists`);
          // If no tier list entries, you might get 404 per your controller logic – handle that:
          if (tierRes.status === 404) {
            // Means user has no tier list entries, so just set an empty array
            setTierListData([]);
          } else if (!tierRes.ok) {
            throw new Error(`Error fetching tier list: ${tierRes.statusText}`);
          } else {
            const rawTierList = await tierRes.json();
            
            // We'll fetch each movie's title/poster from TMDB
            const enriched = await Promise.all(
              rawTierList.map(async (doc) => {
                // doc: { _id, userId, movieId, rank, order }
                try {
                  const baseData = await tmdbAPI.getMovieBase(doc.movieId);
                  return {
                    ...doc,
                    title: baseData.title,
                    posterPath: baseData.poster_path,
                  };
                } catch (err) {
                  console.error(`Could not fetch TMDB data for movieId=${doc.movieId}:`, err);
                  return {
                    ...doc,
                    title: 'Unknown Title',
                    posterPath: null,
                  };
                }
              })
            );
  
            // Sort by rank + order. 
            // We’ll group them, but let’s keep a single list for now and 
            // group them when displaying.
            enriched.sort((a, b) => {
              // First by RANK_ORDER, then by 'order'
              const rankA = RANK_ORDER.indexOf(a.rank);
              const rankB = RANK_ORDER.indexOf(b.rank);
              if (rankA !== rankB) return rankA - rankB;
              return (a.order ?? 0) - (b.order ?? 0);
            });
  
            setTierListData(enriched);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUser();
    }, [username]);
  
    if (loading) {
      return (
        <div style={{ padding: '20px' }}>
          <h1>Public Profile</h1>
          <p>Loading user data...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div style={{ padding: '20px' }}>
          <h1>Public Profile</h1>
          <p>Error: {error}</p>
        </div>
      );
    }
  
    if (!userData) {
      return (
        <div style={{ padding: '20px' }}>
          <h1>Public Profile</h1>
          <p>No user data found.</p>
        </div>
      );
    }
  
    // Group tier-list items by rank
    const tierMap = {};
    for (const rank of RANK_ORDER) {
      tierMap[rank] = [];
    }
    tierListData.forEach((item) => {
      tierMap[item.rank].push(item);
    });
  
    return (
      <div style={{ padding: '20px' }}>
        <h1>Public Profile</h1>
        <p>
          <strong>Username:</strong> {userData.username}
        </p>
        <p>
          <strong>Favorite Movie:</strong>{' '}
          {userData.favoriteMovie || 'No favorite movie yet'}
        </p>
  
        {/* TIERLIST SECTION */}
        <h2>User’s Tier List</h2>
        
        {/* If the user has no tier list entries: */}
        {tierListData.length === 0 && (
          <p>This user has no movies in their tier list yet.</p>
        )}
  
        {/* Otherwise, show them grouped by rank */}
        {RANK_ORDER.map((rank) => {
          const items = tierMap[rank];
          if (!items.length) return null; // skip empty ranks
  
          // We'll display a rank heading, plus each movie
          return (
            <div key={rank} style={{ margin: '1em 0' }}>
              <h3>
                {rank === 'U' ? 'Unranked' : `${rank} Tier`}
              </h3>
              <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap' }}>
                {items.map((movieItem) => {
                  const posterUrl = movieItem.posterPath
                    ? `https://image.tmdb.org/t/p/w200${movieItem.posterPath}`
                    : null;
  
                  return (
                    <div
                      key={movieItem._id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100px',
                      }}
                    >
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={movieItem.title}
                          style={{ width: '100px', marginBottom: '0.5em' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100px',
                            height: '150px',
                            backgroundColor: '#444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            marginBottom: '0.5em'
                          }}
                        >
                          No Poster
                        </div>
                      )}
                      <span style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                        {movieItem.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
