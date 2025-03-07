import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SideNav } from '../components/SideNav';
import { BiLock, BiLockOpen } from 'react-icons/bi';
import { BsArrowsMove } from 'react-icons/bs';
import { useUser } from '../context/UserContext';
import { tmdbAPI } from '../services/tmdbAPI';
import '../styles/Tierlist.css';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function: reorder items in a list
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Tiers structure (no dummy items)
const initialTiers = {
  S: { items: [], label: 'S Tier' },
  A: { items: [], label: 'A Tier' },
  B: { items: [], label: 'B Tier' },
  C: { items: [], label: 'C Tier' },
  D: { items: [], label: 'D Tier' },
  F: { items: [], label: 'F Tier' },
  U: { items: [], label: 'Unranked Movies' }, // rank "U"
};

export const Tierlist = () => {
  const { dbUser } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [tiers, setTiers] = useState(initialTiers);

  // 1) Fetch user's TierList from the backend and 2) fetch TMDB title/poster
  useEffect(() => {
    if (!dbUser) return;

    const fetchTierList = async () => {
      try {
        // GET the user's tier list from /api/users/:userId/tier-lists
        const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/tier-lists`);
        if (!response.ok) {
          console.warn("No existing tier list or error fetching it. Possibly empty.");
          return;
        }
        // Example: [ { _id, userId, movieId, rank, order }, ... ]
        const savedData = await response.json();

        // Augment each doc with TMDB info (title & poster)
        const withDetails = await Promise.all(
          savedData.map(async (doc) => {
            try {
              const baseData = await tmdbAPI.getMovieBase(doc.movieId);
              return {
                ...doc,
                title: baseData.title || 'Untitled',
                poster_path: baseData.poster_path || null,
              };
            } catch (err) {
              console.error("Failed to get TMDB data for doc:", doc, err);
              return {
                ...doc,
                title: 'Unknown Movie',
                poster_path: null,
              };
            }
          })
        );

        // Build a fresh copy of initialTiers
        const newTiers = structuredClone(initialTiers);

        // Distribute movies into the correct tier or the unranked group (U)
        withDetails.forEach((doc) => {
          const rank = doc.rank || 'U';
          const movieObj = {
            id: String(doc.movieId), // used for Draggable key
            title: doc.title,
            poster: doc.poster_path
              ? `https://image.tmdb.org/t/p/w500${doc.poster_path}`
              : null,
          };

          if (rank === 'U') {
            newTiers.U.items.push(movieObj);
          } else if (newTiers[rank]) {
            newTiers[rank].items.push(movieObj);
          }
        });

        // Sort each ranked tier (S, A, B, C, D, F) by "order"
        for (const rank of ['S', 'A', 'B', 'C', 'D', 'F']) {
          newTiers[rank].items.sort((a, b) => {
            const docA = withDetails.find((d) => String(d.movieId) === a.id);
            const docB = withDetails.find((d) => String(d.movieId) === b.id);
            return (docA?.order ?? 0) - (docB?.order ?? 0);
          });
        }

        setTiers(newTiers);
      } catch (error) {
        console.error("Error fetching tier list:", error);
      }
    };

    fetchTierList();
  }, [dbUser]);

  // Called when a drag ends
  const onDragEnd = (result) => {

    const sourceKey = result.source.droppableId;
    const destKey = result.destination.droppableId;

    // Reordering within the same tier
    if (sourceKey === destKey) {
      const reorderedItems = reorder(
        tiers[sourceKey].items,
        result.source.index,
        result.destination.index
      );
      setTiers((prev) => ({
        ...prev,
        [sourceKey]: {
          ...prev[sourceKey],
          items: reorderedItems,
        },
      }));
    } else {
      // Moving between tiers
      const sourceItems = Array.from(tiers[sourceKey].items);
      const [removed] = sourceItems.splice(result.source.index, 1);
      const destItems = Array.from(tiers[destKey].items);
      destItems.splice(result.destination.index, 0, removed);

      setTiers((prev) => ({
        ...prev,
        [sourceKey]: { ...prev[sourceKey], items: sourceItems },
        [destKey]: { ...prev[destKey], items: destItems },
      }));
    }
  };

  // Save the updated tiers to your backend
  const handleSave = async () => {
    if (!dbUser) {
      console.error("No dbUser found; can't save tier list yet.");
      alert("Please wait until your profile loads before saving your tier list.");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/tier-lists/bulk-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: dbUser._id,
          tiers,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save tier list.");
      }
      const data = await response.json();
      console.log("Tier list saved:", data);
      alert("Tier list saved successfully!");
    } catch (error) {
      console.error("Error saving tier list:", error);
      alert("An error occurred while saving your tier list.");
    }
  };

  return (
    <div className="tierlist-container">
      <SideNav isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <h1 className="tierlist-header">Edit Your Tierlist</h1>
      <div className={`tierlist-main ${isExpanded ? 'expanded' : ''}`}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="tier-container">
            {/* Tiers S, A, B, C, D, F */}
            {['S', 'A', 'B', 'C', 'D', 'F'].map((tierKey) => (
              <div className="tier-row" key={tierKey}>
                <div className="tier-label">{tierKey}</div>
                <Droppable droppableId={tierKey} direction="horizontal">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="tier-movies"
                    >
                      {tiers[tierKey].items.map((movie, index) => (
                        <Draggable
                          key={movie.id}
                          draggableId={movie.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="relative group"
                            >
                              {movie.poster ? (
                                <img
                                  src={movie.poster}
                                  alt={movie.title}
                                  className="hover:transform hover:scale-105"
                                />
                              ) : (
                                <div className="missing-poster">
                                  {movie.title}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            <button
              onClick={handleSave}
              className="save-button"
            >
              Save
            </button>

            {/* Unranked Movies (rank = "U") */}
            <div className="unranked-section mt-4">
              <div className="unranked-title-section">
                <h2 className="text-lg font-semibold mb-0">Unranked Movies</h2>
              </div>
              <Droppable droppableId="U" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="unranked-movies"
                  >
                    {tiers.U.items.map((movie, index) => (
                      <Draggable
                        key={movie.id}
                        draggableId={movie.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="relative group"
                          >
                            {movie.poster ? (
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className="hover:transform hover:scale-105"
                              />
                            ) : (
                              <div className="missing-poster">
                                {movie.title}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};
