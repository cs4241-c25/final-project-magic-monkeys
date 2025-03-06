import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SideNav } from '../components/SideNav';
import { BiLock, BiLockOpen } from 'react-icons/bi';
import { BsArrowsMove } from 'react-icons/bs';
import { useUser } from '../context/UserContext';
import { tmdbAPI } from '../services/tmdbAPI';
import '../styles/Tierlist.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

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
  pool: { items: [], label: 'Unranked Movies' }, // for rank "U"
};

export const Tierlist = () => {
  const { dbUser } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [tiers, setTiers] = useState(initialTiers);

  // 1) Fetch user's TierList from the backend and 2) fetch TMDB title/poster
  useEffect(() => {
    if (!dbUser) return;

    const fetchTierList = async () => {
      try {
        // GET the user's tier list from your /api/users/:userId/tier-lists route
        const response = await fetch(`${BACKEND_URL}/api/users/${dbUser._id}/tier-lists`);
        if (!response.ok) {
          console.warn("No existing tier list or error fetching it. Possibly empty.");
          return;
        }
        // This should return an array of TierList docs:
        // [ { _id, userId, movieId, rank, order }, ... ]
        const savedData = await response.json();

        // We'll augment each doc with TMDB info (title & poster)
        // using the new getMovieBase method in tmdbAPI
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

        // Build up a fresh tier object
        const newTiers = structuredClone(initialTiers);

        // Place each doc in its correct tier or the unranked pool
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
            newTiers.pool.items.push(movieObj);
          } else if (newTiers[rank]) {
            newTiers[rank].items.push(movieObj);
          }
        });

        // Sort each rank by "order"
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
    if (!result.destination || isLocked) return;

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
          tiers
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

      <div className={`tierlist-main ${isExpanded ? 'expanded' : ''}`}>
        <div className="tierlist-header">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg"
            >
              {isLocked ? <BiLock size={20} /> : <BiLockOpen size={20} />}
              {isLocked ? 'Locked' : 'Unlocked'}
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="tier-container">
            {/* Ranks S, A, B, C, D, F */}
            {['S', 'A', 'B', 'C', 'D', 'F'].map((tierKey) => (
              <div className="tier-row" key={tierKey}>
                <div className="tier-label">{tierKey}</div>
                <Droppable droppableId={tierKey} direction="horizontal" isDropDisabled={isLocked}>
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
                          isDragDisabled={isLocked}
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
                              {!isLocked && (
                                <div className="absolute top-1 left-1 text-white/50">
                                  <BsArrowsMove />
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

            {/* Unranked Movies (rank = "U") */}
            <div className="content-section mt-4">
              <h2 className="text-lg font-semibold mb-4">Unranked Movies</h2>
              <Droppable droppableId="pool" direction="horizontal" isDropDisabled={isLocked}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="tier-movies"
                  >
                    {tiers.pool.items.map((movie, index) => (
                      <Draggable
                        key={movie.id}
                        draggableId={movie.id}
                        index={index}
                        isDragDisabled={isLocked}
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
                            {!isLocked && (
                              <div className="absolute top-1 left-1 text-white/50">
                                <BsArrowsMove />
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
